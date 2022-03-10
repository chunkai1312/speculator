import * as _ from 'lodash';
import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { Exchange, Index, Market, TickerType, getSymbolFromSectorName } from '@speculator/common';
import { Ticker, TwseIndicesTradingResponse, TpexIndicesTradingResponse } from '../../interfaces';
import { UpdateSectorTradesCommand } from '../impl/update-sector-trades.command';
import { SectorTradesUpdatedEvent } from '../../events/impl/sector-trades-updated.event';
import { TickerRepository } from '../../repositories/ticker.repository';

@CommandHandler(UpdateSectorTradesCommand)
export class UpdateSectorTradesHandler implements ICommandHandler<UpdateSectorTradesCommand> {
  constructor(
    private readonly httpService: HttpService,
    private readonly eventBus: EventBus,
    private readonly tickerRepository: TickerRepository,
  ) {}

  async execute(command: UpdateSectorTradesCommand) {
    const { cmd } = command;

    try {
      const getTrades = (exchange: Exchange) => {
        const trades = {
          [Exchange.TWSE]: () => this.fetchTwseIndustrialIndexTrades(cmd.date),
          [Exchange.TPEx]: () => this.fetchTpexIndustrialIndexTrades(cmd.date),
        };
        return trades[exchange]();
      };

      const tickers = await getTrades(cmd.exchange);
      if(!tickers) return null;

      await Promise.all(tickers.map(ticker => this.tickerRepository.updateTicker(ticker)));
      this.eventBus.publish(new SectorTradesUpdatedEvent(cmd));
      return tickers;
    } catch (err) {
      throw new Error(err);
    }
  }

  async fetchTwseIndustrialIndexTrades(date: string): Promise<Ticker[]> {
    const query = new URLSearchParams({ date: date.replace(/-/g, ''), response: 'json' });
    const url = `https://www.twse.com.tw/exchangeReport/BFIAMU?${query}`;

    const responseData: TwseIndicesTradingResponse = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') ? response.data : null);

    if (!responseData) return null;

    const [ taiex ] = await this.tickerRepository.findTickers({
      date,
      type: TickerType.Index,
      exchange: Exchange.TWSE,
      market: Market.TSE,
      symbol: Index.TAIEX,
    });

    const data = responseData.data.map(row => {
      const [name, tradeVolume, tradeValue, transaction, change] = row;
      const symbol = getSymbolFromSectorName(name.trim(), Exchange.TWSE);
      return {
        date,
        type: TickerType.Index,
        exchange: Exchange.TWSE,
        market: Market.TSE,
        symbol,
        tradeVolume: numeral(tradeVolume).value(),
        tradeValue: numeral(tradeValue).value(),
        transaction: numeral(transaction).value(),
        tradeWeight: Math.round(parseFloat((numeral(tradeValue).value() / taiex.tradeValue).toPrecision(12)) * 10000) / 100,
      };
    });

    return data;
  }

  async fetchTpexIndustrialIndexTrades(date: string): Promise<Ticker[]> {
    const dt = DateTime.fromISO(date);
    const formattedDate = `${dt.get('year') - 1911}/${dt.toFormat('MM/dd')}`;
    const query = new URLSearchParams({ l: 'zh-tw', d: formattedDate, o: 'json' });
    const url = `https://www.tpex.org.tw/web/stock/historical/trading_vol_ratio/sectr_result.php?${query}`;

    const responseData: TpexIndicesTradingResponse = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) ? response.data : null);

    if (!responseData) return null;

    const data = responseData.aaData.map(row => {
      const [name, tradeValue, tradeValueWeight, tradeVolume, tradeVolumeWeight] = row;
      const symbol = getSymbolFromSectorName(name, Exchange.TPEx);
      return {
        date,
        type: TickerType.Index,
        exchange: Exchange.TPEx,
        market: Market.OTC,
        symbol,
        tradeVolume: numeral(tradeVolume).value(),
        tradeValue: numeral(tradeValue).value(),
        tradeWeight: numeral(tradeValueWeight).value(),
      };
    });

    const electronic = data.reduce((trading, data) => {
      return ['IX0053', 'IX0054', 'IX0055', 'IX0056', 'IX0057', 'IX0058', 'IX0059', 'IX0099']
        .includes(data.symbol) ? {
        ...trading,
        tradeVolume: trading.tradeVolume + data.tradeVolume,
        tradeValue: trading.tradeValue + data.tradeValue,
        tradeWeight: trading.tradeWeight + data.tradeWeight,
      } : trading;
    }, {
      date,
      type: TickerType.Index,
      exchange: Exchange.TPEx,
      market: Market.OTC,
      symbol: 'IX0047',
      tradeVolume: 0,
      tradeValue: 0,
      tradeWeight: 0,
    });

    data.push(electronic);

    return data;
  }
}
