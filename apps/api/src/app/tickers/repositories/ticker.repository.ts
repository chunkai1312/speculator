import { DateTime } from 'luxon';
import { groupBy } from 'lodash';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, QueryOptions, LeanDocument } from 'mongoose';
import { TickerType, Exchange, Index } from '@speculator/common';
import { Ticker, TickerDocument } from '../schemas/ticker.schema';
import { UpdateTickerDto } from '../dto/update-ticker.dto';
import { GetMarketInfoFilter } from '../dto/get-market-info-filter.dto';
import { GetSectorInfoFilter } from '../dto/get-sector-info-filter.dto';
import { GetTickersFilterDto } from '../dto/get-tickers-filter.dto';
import { GetLastTradeDatesByDateFilterDto } from '../dto/get-last-trade-dates-by-date-filter.dto';

@Injectable()
export class TickerRepository {
  constructor(@InjectModel(Ticker.name) private readonly tickerModel: Model<TickerDocument>) {}

  findTickers(conditions?: FilterQuery<TickerDocument>): Promise<LeanDocument<TickerDocument>[]> {
    return this.tickerModel.find(conditions).lean().exec();
  }

  updateTicker(updateTickerDto: UpdateTickerDto, options?: QueryOptions): Promise<any> {
    const { date, type, exchange, market, symbol } = updateTickerDto;

    return this.tickerModel
      .updateOne(
        { date, type, exchange, market, symbol },
        { ...updateTickerDto },
        { ...options, upsert: true },
      )
      .exec()
      .catch((err) => {
        if (err.name === 'MongoError' && err.code === 11000) return;
        throw err;
      });
  }

  async getMarketInfo(getMarketInfoFilter: GetMarketInfoFilter) {
    const date = getMarketInfoFilter?.date || DateTime.local().toISODate();
    const days = getMarketInfoFilter?.days || 30;

    const results = await this.tickerModel
      .find({ date: { $lte: date }, symbol: Index.TAIEX })
      .limit(days + 1)
      .sort({ date: -1 })
      .lean()
      .exec();

    const data = results.map((row, i) => (i < results.length - 1 ? {
      changePercent: row.closePrice && Math.round((row.change / (row.closePrice - row.change)) * 10000) / 100,
      usdtwdChange: row.usdtwd && parseFloat((row.usdtwd - results[i + 1].usdtwd).toPrecision(12)),
      qfiiTxNetOiChange: row.qfiiTxNetOi && (row.qfiiTxNetOi - results[i + 1].qfiiTxNetOi),
      qfiiTxoCallsNetOiChange: row.qfiiTxoCallsNetOi && (row.qfiiTxoCallsNetOi - results[i + 1].qfiiTxoCallsNetOi),
      qfiiTxoPutsNetOiChange: row.qfiiTxoPutsNetOi && (row.qfiiTxoPutsNetOi - results[i + 1].qfiiTxoPutsNetOi),
      top10TxFrontMonthNetOiChange: row.top10TxFrontMonthNetOi && (row.top10TxFrontMonthNetOi - results[i + 1].top10TxFrontMonthNetOi),
      top10TxBackMonthsNetOiChange: row.top10TxBackMonthsNetOi && (row.top10TxBackMonthsNetOi - results[i + 1].top10TxBackMonthsNetOi),
      retailMtxNetOiChange: row.retailMtxNetOi && (row.retailMtxNetOi - results[i + 1].retailMtxNetOi),
      ...row,
    } : row)).slice(0, -1);

    return data;
  }

  async getSectorInfo(getSectorInfoFilter: GetSectorInfoFilter) {
    const date = getSectorInfoFilter?.date || DateTime.local().toISODate();
    const days = getSectorInfoFilter?.days || 30;
    const exchange = getSectorInfoFilter.exchange;
    const marketIndex = (exchange === Exchange.TPEx) ? Index.TPEX : Index.TAIEX;

    const dates = await this.tickerModel.aggregate([
      { $match: { date: { $lte: date }, exchange, type: TickerType.Index, symbol: { $ne: marketIndex } } },
      { $group: { _id: '$date' } },
      { $sort: { _id: -1 } },
      { $limit: 5 }
    ]).then(results => results.map(data => data._id));

    const results = await this.tickerModel
      .find({ date: { $lte: date, $gte: dates[dates.length - 1] }, exchange, type: TickerType.Index, symbol: { $ne: marketIndex } })
      .sort({ date: -1 })
      .lean()
      .exec();

    const groupByDate = groupBy(results, 'date') as any;

    dates.forEach(date => {
      const totalVolume = (exchange === Exchange.TWSE)
        ? groupByDate[date].reduce((total, { symbol, volume }) => !['IX0019', 'IX0027'].includes(symbol) ? (total + volume) : total, 0)
        : groupByDate[date].reduce((total, { symbol, volume }) => !['IX0047'].includes(symbol) ? (total + volume) : total, 0);

      groupByDate[date] = groupByDate[date].map(sector => ({
        ...sector,
        weight: Math.round(parseFloat((sector.volume / totalVolume).toPrecision(12)) * 10000) / 100,
      }));
    });

    const data = groupByDate[dates[0]].map(sector => {
      const { symbol, name, price, volume, weight } = sector;

      const prev = groupByDate[dates[1]].find(sector => sector.symbol === symbol);
      const totalWeight = dates.reduce((total, date) => {
        const sector = groupByDate[date].find(sector => sector.symbol === symbol);
        return total + sector.weight;
      }, 0);

      return {
        ...sector,
        change: parseFloat((price - prev.price).toPrecision(12)),
        changePercent: Math.round(parseFloat(((price - prev.price) / prev.price).toPrecision(12)) * 10000) / 100,
        volume,
        weight,
        weightPrev: prev.weight,
        weightChange: parseFloat((weight - prev.weight).toPrecision(12)),
        weightAverage: Math.round(parseFloat((totalWeight / 5).toPrecision(12)) * 100) / 100,
      };
    }).sort((a, b) => b.changePercent - a.changePercent);

    return data;
  }

  getTickersByDate(filter: GetTickersFilterDto) {
    const { date, exchange, type, days } = filter;

    return this.tickerModel.aggregate([
      { $match: { date: { $lte: date }, exchange: exchange || { $ne: null }, type } },
      { $group: { _id: '$date', data: { $push: '$$ROOT' } } },
      { $sort: { _id: -1 } },
      { $limit: days || 1 }
    ]).then(results => results.reduce((data, tickersByDate) => ({ ...data, [tickersByDate._id]: tickersByDate.data }), {}));
  }

  getLastTradingDaysByDate(filterDto: GetLastTradeDatesByDateFilterDto) {
    const { date, days } = filterDto;

    return this.tickerModel.aggregate([
      { $match: { date: { $lte: date } } },
      { $group: { _id: '$date' } },
      { $sort: { _id: -1 } },
      { $limit: days },
    ]).then(results => results.map(data => data._id));
  }
}
