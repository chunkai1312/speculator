import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { TickerType, Exchange, Market } from '@speculator/common';
import { Ticker, TwseTradingDetailsResponse, TpexTradingDetailsResponse } from '../../interfaces';
import { UpdateEquityChipsCommand } from '../impl/update-equity-chips.command';
import { EquityChipsUpdatedEvent } from '../../events/impl/equity-chips-updated.event';
import { TickerRepository } from '../../repositories/ticker.repository';

@CommandHandler(UpdateEquityChipsCommand)
export class UpdateEquityChipsHandler implements ICommandHandler<UpdateEquityChipsCommand> {
  constructor(
    private readonly httpService: HttpService,
    private readonly eventBus: EventBus,
    private readonly tickerRepository: TickerRepository,
  ) {}

  async execute(command: UpdateEquityChipsCommand) {
    const { cmd } = command;

    try {
      const getTickers = (exchange: Exchange) => {
        const tickers = {
          [Exchange.TWSE]: () => this.fetchTwseTradingDetails(cmd.date),
          [Exchange.TPEx]: () => this.fetchTpexTradingDetails(cmd.date),
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

  async fetchTwseTradingDetails(date: string): Promise<Ticker[]> {
    const query = new URLSearchParams({
      response: 'json',
      date: date.replace(/-/g, ''),
      selectType: 'ALLBUT0999',
    });
    const url = `https://www.twse.com.tw/fund/T86?${query}`;

    const responseData: TwseTradingDetailsResponse = await firstValueFrom(this.httpService.get(url))
      .then((response) => (response.data.stat === 'OK' ? response.data : null));

    if (!responseData) return null;

    const data = responseData.data.reduce((tickers, raw) => {
      const [ symbol, name, fiBuy, fiSell, fiNet, fdBuy, fdSell, fdNet, itBuy, itSell, itNet, dNet, dpBuy, dpSell, dpNet, dhBuy, dhSell, dhNet, totalNet ] = raw;
      const ticker = {
        date,
        exchange: Exchange.TWSE,
        market: Market.TSE,
        type: TickerType.Equity,
        symbol: symbol.trim(),
        name: name.trim(),
        qfiiNetBuySell: Math.round((numeral(fiNet).value() + numeral(fdNet).value()) / 1000),
        siteNetBuySell: Math.round(numeral(itNet).value() / 1000),
        dealersNetBuySell: Math.round(numeral(dNet).value() / 1000),
      };
      return [ ...tickers, ticker ];
    }, []) as Ticker[];

    return data;
  }

  async fetchTpexTradingDetails(date: string): Promise<Ticker[]> {
    const dt = DateTime.fromISO(date);
    const formattedDate = `${dt.get('year') - 1911}/${dt.toFormat('MM/dd')}`;
    const query = new URLSearchParams({
      l: 'zh-tw',
      o: 'json',
      se: 'EW',
      t: 'D',
      d: formattedDate,
    });
    const url = `https://www.tpex.org.tw/web/stock/3insti/daily_trade/3itrade_hedge_result.php?${query}`;

    const responseData: TpexTradingDetailsResponse = await firstValueFrom(this.httpService.get(url))
      .then((response) => response.data.iTotalRecords > 0 ? response.data : null);

    if (!responseData) return null;

    const data = responseData.aaData.reduce((tickers, raw) => {
      const [ symbol, name, fiBuy, fiSell, fiNet, fdBuy, fdSell, fdNet, fBuy, fSell, fNet, itBuy, itSell, itNet, dpBuy, dpSell, dpNet, dhBuy, dhSell, dhNet, dBuy, dSell, dNet, totalNet ] = raw;
      const ticker = {
        date,
        exchange: Exchange.TPEx,
        market: Market.OTC,
        type: TickerType.Equity,
        symbol: symbol.trim(),
        name: name.trim(),
        qfiiNetBuySell: Math.round((numeral(fiNet).value() + numeral(fdNet).value()) / 1000),
        siteNetBuySell: Math.round(numeral(itNet).value() / 1000),
        dealersNetBuySell: Math.round(numeral(dNet).value() / 1000),
      };
      return [ ...tickers, ticker ];
    }, []) as Ticker[];

    return data;
  }
}
