import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { TickerType, Exchange, Market } from '@speculator/common';
import { Ticker, TwseMarginTransactionsResponse, TpexMarginTransactionsResponse } from '../../interfaces';
import { UpdateEquityMarginsCommand } from '../impl/update-equity-margins.command';
import { EquityQuotesUpdatedEvent } from '../../events/impl/equity-quotes-updated.event';
import { TickerRepository } from '../../repositories/ticker.repository';

@CommandHandler(UpdateEquityMarginsCommand)
export class UpdateEquityMarginsHandler implements ICommandHandler<UpdateEquityMarginsCommand> {
  constructor(
    private readonly httpService: HttpService,
    private readonly eventBus: EventBus,
    private readonly tickerRepository: TickerRepository,
  ) {}

  async execute(command: UpdateEquityMarginsCommand) {
    const { cmd } = command;

    try {
      const getTickers = (exchange: Exchange) => {
        const tickers = {
          [Exchange.TWSE]: () => this.fetchTwseEquityMargins(cmd.date),
          [Exchange.TPEx]: () => this.fetchTpexEquityMargins(cmd.date),
        };
        return tickers[exchange] && tickers[exchange]();
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

  async fetchTwseEquityMargins(date: string): Promise<Ticker[]> {
    const query = new URLSearchParams({
      date: date.replace(/-/g, ''),
      response: 'json',
      selectType: 'ALL'
    });
    const url = `https://www.twse.com.tw/exchangeReport/MI_MARGN?${query}`;

    const responseData: TwseMarginTransactionsResponse = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') ? response.data : null);

    if (!responseData) return null;

    const data = responseData.data.map(row => {
      const [ symbol, name, marginPurchaseBuy, marginPurchaseSell, marginPurchaseRedemption, marginPurchasePrevBalance, marginPurchaseBalance, marginPurchaseQuota,
        shortSaleBuy, shortSaleSell, shortSaleRedemption, shortSalePrevBalance, shortSaleBalance, shortSaleQuota,
        offsetting, note,
      ] = row;

      const raw = {
        marginPurchaseBuy: numeral(marginPurchaseBuy).value(),
        marginPurchaseSell: numeral(marginPurchaseSell).value(),
        marginPurchaseRedemption: numeral(marginPurchaseRedemption).value(),
        marginPurchasePrevBalance: numeral(marginPurchasePrevBalance).value(),
        marginPurchaseBalance: numeral(marginPurchaseBalance).value(),
        shortSaleBuy: numeral(shortSaleBuy).value(),
        shortSaleSell: numeral(shortSaleSell).value(),
        shortSaleRedemption: numeral(shortSaleRedemption).value(),
        shortSalePrevBalance: numeral(shortSalePrevBalance).value(),
        shortSaleBalance: numeral(shortSaleBalance).value(),
      };

      return {
        date,
        exchange: Exchange.TWSE,
        market: Market.TSE,
        type: TickerType.Equity,
        symbol,
        name,
        marginPurchase: raw.marginPurchaseBalance,
        marginPurchaseChange: raw.marginPurchaseBalance - raw.marginPurchasePrevBalance,
        shortSale: raw.shortSaleBalance,
        shortSaleChange: raw.shortSaleBalance - raw.shortSalePrevBalance,
      };
    }).filter(data => data.name);

    return data;
  }

  async fetchTpexEquityMargins(date: string): Promise<Ticker[]> {
    const dt = DateTime.fromISO(date);
    const formattedDate = `${dt.get('year') - 1911}/${dt.toFormat('MM/dd')}`;
    const query = new URLSearchParams({ l: 'zh-tw', d: formattedDate, o: 'json' });
    const url = `https://www.tpex.org.tw/web/stock/margin_trading/margin_balance/margin_bal_result.php?${query}`;

    const responseData: TpexMarginTransactionsResponse = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) ? response.data : null);

    if (!responseData) return null;

    const data = responseData.aaData.map(row => {
      const [ symbol, name, marginPurchasePrevBalance, marginPurchaseBuy, marginPurchaseSell, marginPurchaseRedemption, marginPurchaseBalance, marginPurchaseBelong, marginPurchaseRate, marginPurchaseQuota,
        shortSalePrevBalance, shortSaleSell, shortSaleBuy, shortSaleRedemption, shortSaleBalance, shortSaleBelong, shortSaleRate, shortSaleQuota,
        offsetting, note,
      ] = row;

      const raw = {
        marginPurchaseBuy: numeral(marginPurchaseBuy).value(),
        marginPurchaseSell: numeral(marginPurchaseSell).value(),
        marginPurchaseRedemption: numeral(marginPurchaseRedemption).value(),
        marginPurchasePrevBalance: numeral(marginPurchasePrevBalance).value(),
        marginPurchaseBalance: numeral(marginPurchaseBalance).value(),
        shortSaleBuy: numeral(shortSaleBuy).value(),
        shortSaleSell: numeral(shortSaleSell).value(),
        shortSaleRedemption: numeral(shortSaleRedemption).value(),
        shortSalePrevBalance: numeral(shortSalePrevBalance).value(),
        shortSaleBalance: numeral(shortSaleBalance).value(),
      };

      return {
        date,
        exchange: Exchange.TPEx,
        market: Market.OTC,
        type: TickerType.Equity,
        symbol,
        name,
        marginPurchase: raw.marginPurchaseBalance,
        marginPurchaseChange: raw.marginPurchaseBalance - raw.marginPurchasePrevBalance,
        shortSale: raw.shortSaleBalance,
        shortSaleChange: raw.shortSaleBalance - raw.shortSalePrevBalance,
      };
    }).filter(data => data.name);

    return data;
  }
}
