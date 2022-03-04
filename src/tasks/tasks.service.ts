import { DateTime } from 'luxon';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Exchange, MarketChip } from 'src/tickers/enums';
import { TickersService } from 'src/tickers/tickers.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly tickersService: TickersService) {}

  @Cron('0 30 21 * * *')
  async updateMarketChipsTask() {
    const date = DateTime.local().toISODate();

    await Promise.all([
      this.tickersService.updateMarketChips({ date, type: MarketChip.StockMarketInstiInvestorsNetBuySell }),
      this.tickersService.updateMarketChips({ date, type: MarketChip.StockMarketMarginTransactions }),
      this.tickersService.updateMarketChips({ date, type: MarketChip.StockMarketIndexFuturesInstiInvestorsNetOi }),
      this.tickersService.updateMarketChips({ date, type: MarketChip.StockMarketIndexOptionsInstiInvestorsNetOi }),
      this.tickersService.updateMarketChips({ date, type: MarketChip.StockMarketIndexFuturesLargeTraderNetOi }),
      this.tickersService.updateMarketChips({ date, type: MarketChip.StockMarketIndexFuturesRetailInvestorsNetOi }),
    ]);
  }

  @Cron('0 30 16 * * *')
  async updateEquityChipsTask() {
    const date = DateTime.local().toISODate();

    await Promise.all([
      this.tickersService.updateEquityChips({ date, exchange: Exchange.TWSE }),
      this.tickersService.updateEquityChips({ date, exchange: Exchange.TPEx }),
    ]);
  }

  @Cron('0 30 16 * * *')
  async updateEquityQuotesTask() {
    const date = DateTime.local().toISODate();

    await Promise.all([
      this.tickersService.updateEquityQuotes({ date, exchange: Exchange.TWSE }),
      this.tickersService.updateEquityQuotes({ date, exchange: Exchange.TPEx }),
    ]);
  }


  @Cron('0 30 15 * * *')
  async updateIndexQuotesTask() {
    const date = DateTime.local().toISODate();

    await Promise.all([
      this.tickersService.updateIndexQuotes({ date, exchange: Exchange.TWSE }),
      this.tickersService.updateIndexQuotes({ date, exchange: Exchange.TPEx }),
    ]);
  }

  @Cron('0 30 15 * * *')
  async updateMarketTradesTask() {
    const date = DateTime.local().toISODate();

    await Promise.all([
      this.tickersService.updateMarketTrades({ date, exchange: Exchange.TWSE }),
      this.tickersService.updateMarketTrades({ date, exchange: Exchange.TPEx }),
    ]);
  }

  @Cron('0 30 15 * * *')
  async updateSectorTradesTask() {
    const date = DateTime.local().toISODate();

    await Promise.all([
      this.tickersService.updateSectorTrades({ date, exchange: Exchange.TWSE }),
      this.tickersService.updateSectorTrades({ date, exchange: Exchange.TPEx }),
    ]);
  }
}
