import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { TickerType, Exchange, Market } from '@speculator/common';
import { Ticker, TwseDailyQuotesResponse, TpexDailyQuotesResponse } from '../../interfaces';
import { UpdateEquityQuotesCommand } from '../impl/update-equity-quotes.command';
import { EquityQuotesUpdatedEvent } from '../../events/impl/equity-quotes-updated.event';
import { TickerRepository } from '../../repositories/ticker.repository';

@CommandHandler(UpdateEquityQuotesCommand)
export class UpdateEquityQuotesHandler implements ICommandHandler<UpdateEquityQuotesCommand> {
  constructor(
    private readonly httpService: HttpService,
    private readonly eventBus: EventBus,
    private readonly tickerRepository: TickerRepository,
  ) {}

  async execute(command: UpdateEquityQuotesCommand) {
    const { cmd } = command;

    try {
      const getTickers = (exchange: Exchange) => {
        const tickers = {
          [Exchange.TWSE]: () => this.fetchTwseEquityQuotes(cmd.date),
          [Exchange.TPEx]: () => this.fetchTpexEquityQuotes(cmd.date),
        };
        return tickers[exchange]();
      };

      const tickers = await getTickers(cmd.exchange);
      if(!tickers) return null;

      await Promise.all(tickers.map(ticker => this.tickerRepository.updateTicker(ticker)));
      this.eventBus.publish(new EquityQuotesUpdatedEvent(cmd));
      return tickers;
    } catch (err) {
      throw new Error(err);
    }
  }

  async fetchTwseEquityQuotes(date: string): Promise<Ticker[]> {
    const query = new URLSearchParams({ date: date.replace(/-/g, ''), type: 'ALLBUT0999', response: 'json' });
    const url = `https://www.twse.com.tw/exchangeReport/MI_INDEX?${query}`;

    const responseData: TwseDailyQuotesResponse = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') ? response.data : null);

    if (!responseData) return null;

    const data = responseData.data9.map(row => {
      const [ symbol, name, tradeVolume, transaction, tradeValue, openPrice, highPrice, lowPrice, closePrice, upDown, change ] = row;
      const netChange = upDown.includes('green') ? numeral(change).value() * -1 : numeral(change).value();
      const referencePrice = numeral(closePrice).value() - netChange;
      const changePercent = Math.round(parseFloat((netChange / referencePrice).toPrecision(12)) * 10000) / 100;
      return {
        date,
        exchange: Exchange.TWSE,
        market: Market.TSE,
        type: TickerType.Equity,
        symbol,
        name,
        openPrice: numeral(openPrice).value(),
        highPrice: numeral(highPrice).value(),
        lowPrice: numeral(lowPrice).value(),
        closePrice: numeral(closePrice).value(),
        change: netChange,
        changePercent: isNaN(changePercent) ? 0 : changePercent,
        tradeVolume: numeral(tradeVolume).value(),
        tradeValue: numeral(tradeValue).value(),
        transaction: numeral(transaction).value(),
      };
    }).filter(data => data.name);

    return data;
  }

  async fetchTpexEquityQuotes(date: string): Promise<Ticker[]> {
    const dt = DateTime.fromISO(date);
    const formattedDate = `${dt.get('year') - 1911}/${dt.toFormat('MM/dd')}`;
    const query = new URLSearchParams({ l: 'zh-tw', d: formattedDate, se: 'EW', o: 'json' });
    const url = `https://www.tpex.org.tw/web/stock/aftertrading/otc_quotes_no1430/stk_wn1430_result.php?${query}`;

    const responseData: TpexDailyQuotesResponse = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) ? response.data : null);

    if (!responseData) return null;

    const data = responseData.aaData.map(row => {
      const [ symbol, name, closePrice, change, openPrice, highPrice, lowPrice, tradeVolume, tradeValue, transaction ] = row;
      const changePercent = Math.round(parseFloat((numeral(change).value() / (numeral(closePrice).value() - numeral(change).value())).toPrecision(12)) * 10000) / 100;
      return {
        date,
        exchange: Exchange.TPEx,
        market: Market.OTC,
        type: TickerType.Equity,
        symbol,
        name,
        openPrice: numeral(openPrice).value(),
        highPrice: numeral(highPrice).value(),
        lowPrice: numeral(lowPrice).value(),
        closePrice: numeral(closePrice).value(),
        change: numeral(change).value(),
        changePercent: isNaN(changePercent) ? 0 : changePercent,
        tradeVolume: numeral(tradeVolume).value(),
        tradeValue: numeral(tradeValue).value(),
        transaction: numeral(transaction).value(),
      };
    }).filter(data => data.name);

    return data;
  }
}
