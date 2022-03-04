import * as _ from 'lodash';
import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { Exchange, Market, TickerType } from '../../enums';
import { Ticker, TwseTaiexResponse, TpexIndexResponse } from '../../interfaces';
import { UpdateMarketTradesCommand } from '../impl/update-market-trades.command';
import { MarketTradesUpdatedEvent } from '../../events/impl/market-trades-updated.event';
import { TickerRepository } from '../../repositories/ticker.repository';

@CommandHandler(UpdateMarketTradesCommand)
export class UpdateMarketTradesHandler implements ICommandHandler<UpdateMarketTradesCommand> {
  constructor(
    private readonly httpService: HttpService,
    private readonly eventBus: EventBus,
    private readonly tickerRepository: TickerRepository,
  ) {}

  async execute(command: UpdateMarketTradesCommand) {
    const { cmd } = command;

    try {
      const getTrades = (exchange: Exchange) => {
        const trades = {
          [Exchange.TWSE]: () => this.fetchTwseIndexTrades(cmd.date),
          [Exchange.TPEx]: () => this.fetchTpexIndexTrades(cmd.date),
        };
        return trades[exchange]();
      };

      const ticker = await getTrades(cmd.exchange);
      if(!ticker) return null;

      await this.tickerRepository.updateTicker(ticker);
      this.eventBus.publish(new MarketTradesUpdatedEvent(cmd));
      return ticker;
    } catch (err) {
      throw new Error(err);
    }
  }

  async fetchTwseIndexTrades(date: string): Promise<Ticker> {
    const query = new URLSearchParams({
      date: date.replace(/-/g, ''),
      response: 'json' },
    );
    const url = `https://www.twse.com.tw/exchangeReport/FMTQIK?${query}`;

    const responseData: TwseTaiexResponse = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') ? response.data : null);

    if (!responseData) return null;

    const taiex = responseData.data
      .map(row => {
        const [ date, tradeVolume, tradeValue, transaction ] = row;
        const [ year, month, day ] = date.split('/');
        return {
          date: DateTime.fromFormat(`${+year + 1911}${month}${day}`, 'yyyyMMdd').toISODate(),
          type: TickerType.Index,
          exchange: Exchange.TWSE,
          market: Market.TSE,
          symbol: 'IX0001',
          tradeVolume: numeral(tradeVolume).value(),
          tradeValue: numeral(tradeValue).value(),
          transaction: numeral(transaction).value(),
        };
      })
      .find(data => data.date === date);

    return taiex || null;
  }

  async fetchTpexIndexTrades(date: string): Promise<Ticker> {
    const dt = DateTime.fromISO(date);
    const formattedDate = `${dt.get('year') - 1911}/${dt.toFormat('MM')}`;
    const query = new URLSearchParams({ l: 'zh-tw', d: formattedDate, o: 'json' });
    const url = `https://www.tpex.org.tw/web/stock/aftertrading/daily_trading_index/st41_result.php?${query}`;

    const responseData: TpexIndexResponse = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) ? response.data : null);

    if (!responseData) return null;

    const tpex = responseData.aaData.map(row => {
      const [ date, tradeVolume, tradeValue, transaction ] = row;
      const [ year, month, day ] = date.split('/');
      return {
        date: DateTime.fromFormat(`${+year + 1911}${month}${day}`, 'yyyyMMdd').toISODate(),
        type: TickerType.Index,
        exchange: Exchange.TPEx,
        market: Market.OTC,
        symbol: 'IX0043',
        tradeVolume: numeral(tradeVolume).value(),
        tradeValue: numeral(tradeValue).value(),
        transaction: numeral(transaction).value(),
      };
    })
    .find(data => data.date === date);

    return tpex || null;
  }
}
