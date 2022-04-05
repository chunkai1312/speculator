import * as numeral from 'numeral';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import { firstValueFrom } from 'rxjs';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { TickerType, Exchange, Market } from '@speculator/common';
import { Ticker, TwseForeignInvestorsTradingAndShareholdingResponse, TpexTradingDetailsResponse } from '../../interfaces';
import { UpdateEquitySharesCommand } from '../impl/update-equity-shares.command';
import { EquityChipsUpdatedEvent } from '../../events/impl/equity-chips-updated.event';
import { TickerRepository } from '../../repositories/ticker.repository';

@CommandHandler(UpdateEquitySharesCommand)
export class UpdateEquitySharesHandler implements ICommandHandler<UpdateEquitySharesCommand> {
  constructor(
    private readonly httpService: HttpService,
    private readonly eventBus: EventBus,
    private readonly tickerRepository: TickerRepository,
  ) {}

  async execute(command: UpdateEquitySharesCommand) {
    const { cmd } = command;

    try {
      const getTickers = (exchange: Exchange) => {
        const tickers = {
          [Exchange.TWSE]: () => this.fetchTwseEquityShares(cmd.date),
          [Exchange.TPEx]: () => this.fetchTpexEquityShares(cmd.date),
        };
        return tickers[exchange]();
      };

      const tickers = await getTickers(cmd.exchange);
      if(!tickers) return null;

      await Promise.all(tickers.map(ticker => this.tickerRepository.updateTicker(ticker)));
      this.eventBus.publish(new EquityChipsUpdatedEvent(cmd));
      return tickers;
    } catch (err) {
      throw new Error(err);
    }
  }

  async fetchTwseEquityShares(date: string): Promise<Ticker[]> {
    const query = new URLSearchParams({
      response: 'json',
      date: date.replace(/-/g, ''),
      selectType: 'ALLBUT0999',
    });
    const url = `https://www.twse.com.tw/fund/MI_QFIIS?${query}`;

    const responseData: TwseForeignInvestorsTradingAndShareholdingResponse = await firstValueFrom(this.httpService.get(url))
      .then((response) => (response.data.stat === 'OK' ? response.data : null));

    if (!responseData) return null;

    const data = responseData.data.reduce((tickers, raw) => {
      const [ symbol, name, isinCode, issuedShares, availableShares, qfiiHoldings ] = raw;
      const ticker = {
        date,
        exchange: Exchange.TWSE,
        market: Market.TSE,
        type: TickerType.Equity,
        symbol: symbol.trim(),
        issuedShares: numeral(issuedShares).value(),
        qfiiHoldings: numeral(qfiiHoldings).value(),
      };
      return [ ...tickers, ticker ];
    }, []) as Ticker[];

    return data;
  }

  async fetchTpexEquityShares(date: string): Promise<Ticker[]>  {
    const tickers = [];
    const [ year, month, day ] = date.split('-');
    const url = 'https://mops.twse.com.tw/server-java/t13sa150_otc';
    const data = new URLSearchParams({ years: year, months: month, days: day, bcode: '', step: '2' });
    const page = await firstValueFrom(this.httpService.post(url, data, { responseType: 'arraybuffer' }));
    const $ = cheerio.load(iconv.decode(page.data, 'big5'));
    const rows = $('tr');

    for (let i = 1; i < rows.length; i++) {
      const td = rows.eq(i).find('td');
      const symbol = td.eq(0).text().trim();
      const issuedShares = numeral(td.eq(2).text().trim()).value();
      const qfiiHoldings = numeral(td.eq(4).text().trim()).value();
      if (!symbol) continue;

      tickers.push({
        date,
        exchange: Exchange.TPEx,
        type: TickerType.Equity,
        symbol,
        issuedShares,
        qfiiHoldings,
      });
    }

    return tickers;
  }
}
