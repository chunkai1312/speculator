import * as _ from 'lodash';
import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { TickerType, Exchange, Market } from '@speculator/common';
import { TwseIndicesPer5SecondsResponse, TpexIndicesPer5SecondsResponse } from '../../interfaces';
import { UpdateIndexQuotesCommand } from '../impl/update-index-quotes.command';
import { IndexQuotesUpdatedEvent } from '../../events/impl/index-quotes-updated.event';
import { TickerRepository } from '../../repositories/ticker.repository';

@CommandHandler(UpdateIndexQuotesCommand)
export class UpdateIndexQuotesHandler implements ICommandHandler<UpdateIndexQuotesCommand> {
  constructor(
    private readonly httpService: HttpService,
    private readonly eventBus: EventBus,
    private readonly tickerRepository: TickerRepository,
  ) {}

  async execute(command: UpdateIndexQuotesCommand) {
    const { cmd } = command;

    try {
      const getTickers = (exchange: Exchange) => {
        const tickers = {
          [Exchange.TWSE]: () => this.fetchTwseIndexQuotes(cmd.date),
          [Exchange.TPEx]: () => this.fetchTpexIndexQuotes(cmd.date),
        };
        return tickers[exchange]();
      };

      const tickers = await getTickers(cmd.exchange);
      if(!tickers) return null;

      await Promise.all(tickers.map(ticker => this.tickerRepository.updateTicker(ticker)));
      this.eventBus.publish(new IndexQuotesUpdatedEvent(cmd));
      return tickers;
    } catch (err) {
      throw new Error(err);
    }
  }

  async fetchTwseIndexQuotes(date: string) {
    const query = new URLSearchParams({ date: date.replace(/-/g, ''), response: 'json' });
    const url = `https://www.twse.com.tw/exchangeReport/MI_5MINS_INDEX?${query}`;

    const responseData: TwseIndicesPer5SecondsResponse = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') ? response.data : null);

    if (!responseData) return null;

    const data = responseData.data.reduce((quotes, row) => {
      const [
        time, // 時間
        IX0001, // 發行量加權股價指數
        IX0007, // 未含金融保險股指數
        IX0008, // 未含電子股指數
        IX0009, // 未含金融電子股指數
        IX0010, // 水泥類指數
        IX0011, // 食品類指數
        IX0012, // 塑膠類指數
        IX0016, // 紡織纖維類指數
        IX0017, // 電機機械類指數
        IX0018, // 電器電纜類指數
        IX0019, // 化學生技醫療類指數
        IX0020, // 化學類指數
        IX0021, // 生技醫療類指數
        IX0022, // 玻璃陶瓷類指數
        IX0023, // 造紙類指數
        IX0024, // 鋼鐵類指數
        IX0025, // 橡膠類指數
        IX0026, // 汽車類指數
        IX0027, // 電子類指數
        IX0028, // 半導體類指數
        IX0029, // 電腦及週邊設備類指數
        IX0030, // 光電類指數
        IX0031, // 通信網路類指數
        IX0032, // 電子零組件類指數
        IX0033, // 電子通路類指數
        IX0034, // 資訊服務類指數
        IX0035, // 其他電子類指數
        IX0036, // 建材營造類指數
        IX0037, // 航運類指數
        IX0038, // 觀光類指數
        IX0039, // 金融保險類指數
        IX0040, // 貿易百貨類指數
        IX0041, // 油電燃氣類指數
        IX0042, // 其他類指數
      ] = row;

      return [
        ...quotes,
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0001', name: '發行量加權股價指數', price: numeral(IX0001).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0007', name: '未含金融保險股指數', price: numeral(IX0007).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0008', name: '未含電子股指數', price: numeral(IX0008).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0009', name: '未含金融電子股指數', price: numeral(IX0009).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0010', name: '水泥類指數', price: numeral(IX0010).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0011', name: '食品類指數', price: numeral(IX0011).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0012', name: '塑膠類指數', price: numeral(IX0012).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0016', name: '紡織纖維類指數', price: numeral(IX0016).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0017', name: '電機機械類指數', price: numeral(IX0017).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0018', name: '電器電纜類指數', price: numeral(IX0018).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0019', name: '化學生技醫療類指數', price: numeral(IX0019).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0020', name: '化學類指數', price: numeral(IX0020).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0021', name: '生技醫療類指數', price: numeral(IX0021).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0022', name: '玻璃陶瓷類指數', price: numeral(IX0022).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0023', name: '造紙類指數', price: numeral(IX0023).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0024', name: '鋼鐵類指數', price: numeral(IX0024).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0025', name: '橡膠類指數', price: numeral(IX0025).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0026', name: '汽車類指數', price: numeral(IX0026).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0027', name: '電子工業類指數', price: numeral(IX0027).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0028', name: '半導體類指數', price: numeral(IX0028).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0029', name: '電腦及週邊設備類指數', price: numeral(IX0029).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0030', name: '光電類指數', price: numeral(IX0030).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0031', name: '通信網路類指數', price: numeral(IX0031).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0032', name: '電子零組件類指數', price: numeral(IX0032).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0033', name: '電子通路類指數', price: numeral(IX0033).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0034', name: '資訊服務類指數', price: numeral(IX0034).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0035', name: '其他電子類指數', price: numeral(IX0035).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0036', name: '建材營造類指數', price: numeral(IX0036).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0037', name: '航運類指數', price: numeral(IX0037).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0038', name: '觀光類指數', price: numeral(IX0038).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0039', name: '金融保險類指數', price: numeral(IX0039).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0040', name: '貿易百貨類指數', price: numeral(IX0040).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0041', name: '油電燃氣類指數', price: numeral(IX0041).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TWSE, market: Market.TSE, symbol: 'IX0042', name: '其他類指數', price: numeral(IX0042).value(), time},
      ];
    }, []);

    const quotes = _(data)
      .groupBy('symbol')
      .map((data: any[]) => {
        const [ prev, ...quotes ] = data;
        const { date, type, exchange, market, symbol, name } = prev;
        const referencePrice = prev.price;
        const change = parseFloat((_.maxBy(quotes, 'time').price - referencePrice).toPrecision(12));
        const changePercent = Math.round(parseFloat((change / referencePrice).toPrecision(12)) * 10000) / 100;
        return {
          date,
          type,
          exchange,
          market,
          symbol,
          name,
          openPrice: _.minBy(quotes, 'time').price,
          highPrice: _.maxBy(quotes, 'price').price,
          lowPrice: _.minBy(quotes, 'price').price,
          closePrice: _.maxBy(quotes, 'time').price,
          change,
          changePercent,
        };
      })
      .value();

    return quotes;
  }

  async fetchTpexIndexQuotes(date: string) {
    const dt = DateTime.fromISO(date);
    const formattedDate = `${dt.get('year') - 1911}/${dt.toFormat('MM/dd')}`;
    const query = new URLSearchParams({ l: 'zh-tw', d: formattedDate, o: 'json' });
    const url = `https://www.tpex.org.tw/web/stock/iNdex_info/minute_index/1MIN_result.php?${query}`;

    const responseData: TpexIndicesPer5SecondsResponse = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) ? response.data : null);

    if (!responseData) return null;

    const data = responseData.aaData.reduce((quotes, row) => {
      const [
        time, // 時間
        IX0044, // 櫃檯紡纖類指數
        IX0045, // 櫃檯機械類指數
        IX0046, // 櫃檯鋼鐵類指數
        IX0048, // 櫃檯營建類指數
        IX0049, // 櫃檯航運類指數
        IX0050, // 櫃檯觀光類指數
        IX0100, // 櫃檯其他類指數
        IX0051, // 櫃檯化工類指數
        IX0052, // 櫃檯生技醫療類指數
        IX0053, // 櫃檯半導體類指數
        IX0054, // 櫃檯電腦及週邊類指數
        IX0055, // 櫃檯光電業類指數
        IX0056, // 櫃檯通信網路類指數
        IX0057, // 櫃檯電子零組件類指數
        IX0058, // 櫃檯電子通路類指數
        IX0059, // 櫃檯資訊服務類指數
        IX0099, // 櫃檯其他電子類指數
        IX0075, // 櫃檯文化創意業類指數
        IX0047, // 櫃檯電子類指數
        IX0043, // 櫃檯指數
        tradeValue, // 成交金額(萬元)
        tradeVolume, // 成交張數
        transaction, // 成交筆數
        bidOrders, // 委買筆數
        askOrders,  // 委賣筆數
        bidVolume, // 委買張數
        askVolume, // 委賣張數
      ] = row;

      return [
        ...quotes,
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0044', name: '櫃檯紡纖類指數', price: numeral(IX0044).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0045', name: '櫃檯機械類指數', price: numeral(IX0045).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0046', name: '櫃檯鋼鐵類指數', price: numeral(IX0046).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0048', name: '櫃檯營建類指數', price: numeral(IX0048).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0049', name: '櫃檯航運類指數', price: numeral(IX0049).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0050', name: '櫃檯觀光類指數', price: numeral(IX0050).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0100', name: '櫃檯其他類指數', price: numeral(IX0100).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0051', name: '櫃檯化工類指數', price: numeral(IX0051).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0052', name: '櫃檯生技醫療類指數', price: numeral(IX0052).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0053', name: '櫃檯半導體類指數', price: numeral(IX0053).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0054', name: '櫃檯電腦及週邊類指數', price: numeral(IX0054).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0055', name: '櫃檯光電業類指數', price: numeral(IX0055).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0056', name: '櫃檯通信網路類指數', price: numeral(IX0056).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0057', name: '櫃檯電子零組件類指數', price: numeral(IX0057).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0058', name: '櫃檯電子通路類指數', price: numeral(IX0058).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0059', name: '櫃檯資訊服務類指數', price: numeral(IX0059).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0099', name: '櫃檯其他電子類指數', price: numeral(IX0099).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0075', name: '櫃檯文化創意業類指數', price: numeral(IX0075).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0047', name: '櫃檯電子類指數', price: numeral(IX0047).value(), time},
        { date, type: TickerType.Index, exchange: Exchange.TPEx, market: Market.OTC, symbol: 'IX0043', name: '櫃檯指數', price: numeral(IX0043).value(), time},
      ];
    }, []);

    const quotes = _(data)
      .groupBy('symbol')
      .map((data: any[]) => {
        const [ prev, ...quotes ] = data;
        const { date, type, exchange, market, symbol, name } = prev;
        const referencePrice = prev.price;
        const change = parseFloat((_.maxBy(quotes, 'time').price - referencePrice).toPrecision(12));
        const changePercent = Math.round(parseFloat((change / referencePrice).toPrecision(12)) * 10000) / 100;
        return {
          date,
          type,
          exchange,
          market,
          symbol,
          name,
          openPrice: _.minBy(quotes, 'time').price,
          highPrice: _.maxBy(quotes, 'price').price,
          lowPrice: _.minBy(quotes, 'price').price,
          closePrice: _.maxBy(quotes, 'time').price,
          change,
          changePercent,
        };
      })
      .value();

    return quotes;
  }
}
