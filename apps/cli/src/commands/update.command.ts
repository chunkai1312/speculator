import * as ora from 'ora';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Command, CommandRunner, Option } from 'nest-commander';
import { Exchange, MarketChip } from 'apps/api/src/tickers/enums';

interface UpdateCommandOptions {
  date?: string;
}

@Command({ name: 'update', description: 'update data' })
export class UpdateCommand implements CommandRunner {
  private readonly spinner = ora();

  constructor(@Inject('api') private client: ClientProxy) {}

  async run(passedParam: string[], options?: UpdateCommandOptions): Promise<void> {
    this.spinner.start('資料更新中...');
    try {
      await this.wait(5000);
      await this.updateMarketChips(options.date);
      await this.wait(5000);
      await this.updateEquityChips(options.date);
      await this.wait(5000);
      await this.updateEquityQuotes(options.date);
      await this.wait(5000);
      await this.updateIndexQuotes(options.date);
      await this.wait(5000);
      await this.updateMarketTrades(options.date);
      await this.wait(5000);
      await this.updateSectorTrades(options.date);
      this.spinner.succeed(`${options.date} 更新完成`);
    } catch (err) {
      this.spinner.fail('執行階段錯誤');
      console.log(err);
    }
  }

  @Option({
    flags: '-d, --date [date]',
    description: 'date of trading date',
    defaultValue: DateTime.local().toISODate(),
  })
  parseDate(value: string): string {
    return DateTime.fromISO(value).isValid && value || DateTime.local().toISODate();
  }

  async updateMarketChips(date: string) {
    this.spinner.start(`正在取得大盤籌碼資訊...`);

    await firstValueFrom(this.client.send({ cmd: 'update_market_chips' }, { date, type: MarketChip.StockMarketInstiInvestorsNetBuySell }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 三大法人買賣超: 已更新`);
        else this.spinner.warn(`${date} 三大法人買賣超: 尚無資料或非交易日`);
      });

    await firstValueFrom(this.client.send({ cmd: 'update_market_chips' }, { date, type: MarketChip.StockMarketMarginTransactions }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 信用交易: 已更新`);
        else this.spinner.warn(`${date} 信用交易: 尚無資料或非交易日`);
      });

    await firstValueFrom(this.client.send({ cmd: 'update_market_chips' }, { date, type: MarketChip.StockMarketIndexFuturesInstiInvestorsNetOi }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 台指期三大法人淨部位: 已更新`);
        else this.spinner.warn(`${date} 台指期三大法人淨部位: 尚無資料或非交易日`);
      });

    await firstValueFrom(this.client.send({ cmd: 'update_market_chips' }, { date, type: MarketChip.StockMarketIndexOptionsInstiInvestorsNetOi }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 台指選擇權三大法人淨部位: 已更新`);
        else this.spinner.warn(`${date} 台指選擇權三大法人淨部位: 尚無資料或非交易日`);
      });

    await firstValueFrom(this.client.send({ cmd: 'update_market_chips' }, { date, type: MarketChip.StockMarketIndexFuturesLargeTraderNetOi }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 台指期大額交易人淨部位: 已更新`);
        else this.spinner.warn(`${date} 台指期大額交易人淨部位: 尚無資料或非交易日`);
      });

    await firstValueFrom(this.client.send({ cmd: 'update_market_chips' }, { date, type: MarketChip.StockMarketIndexFuturesRetailInvestorsNetOi }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 小台散戶淨部位: 已更新`);
        else this.spinner.warn(`${date} 小台散戶淨部位: 尚無資料或非交易日`);
      });
  }

  async updateEquityChips(date: string) {
    this.spinner.start(`正在取得上市櫃個股法人進出...`);

    await firstValueFrom(this.client.send({ cmd: 'update_equity_chips' }, { date, exchange: Exchange.TWSE }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 上市個股法人進出: 已更新`);
        else this.spinner.warn(`${date} 上市個股法人進出: 尚無資料或非交易日`);
      });

    await firstValueFrom(this.client.send({ cmd: 'update_equity_chips' }, { date, exchange: Exchange.TPEx }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 上櫃個股法人進出: 已更新`);
        else this.spinner.warn(`${date} 上櫃個股法人進出: 尚無資料或非交易日`);
      });
  }

  async updateEquityQuotes(date: string) {
    this.spinner.start(`正在取得上市櫃個股收盤行情...`);

    await firstValueFrom(this.client.send({ cmd: 'update_equity_quotes' }, { date, exchange: Exchange.TWSE }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 上市個股收盤行情: 已更新`);
        else this.spinner.warn(`${date} 上市個股收盤行情: 尚無資料或非交易日`);
      });

    await firstValueFrom(this.client.send({ cmd: 'update_equity_quotes' }, { date, exchange: Exchange.TPEx }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 上櫃個股收盤行情: 已更新`);
        else this.spinner.warn(`${date} 上櫃個股收盤行情: 尚無資料或非交易日`);
      });
  }

  async updateIndexQuotes(date: string) {
    this.spinner.start(`正在取得上市櫃指數收盤行情...`);

    await firstValueFrom(this.client.send({ cmd: 'update_index_quotes' }, { date, exchange: Exchange.TWSE }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 上市指數收盤行情: 已更新`);
        else this.spinner.warn(`${date} 上市指數收盤行情: 尚無資料或非交易日`);
      });

    await firstValueFrom(this.client.send({ cmd: 'update_index_quotes' }, { date, exchange: Exchange.TPEx }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 上櫃指數收盤行情: 已更新`);
        else this.spinner.warn(`${date} 上櫃指數收盤行情: 尚無資料或非交易日`);
      });
  }

  async updateMarketTrades(date: string) {
    this.spinner.start(`正在取得上市櫃大盤成交量值...`);

    await firstValueFrom(this.client.send({ cmd: 'update_market_trades' }, { date, exchange: Exchange.TWSE }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 上市大盤成交量值: 已更新`);
        else this.spinner.warn(`${date} 上市大盤成交量值: 尚無資料或非交易日`);
      });

    await firstValueFrom(this.client.send({ cmd: 'update_market_trades' }, { date, exchange: Exchange.TPEx }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 上櫃大盤成交量值: 已更新`);
        else this.spinner.warn(`${date} 上櫃大盤成交量值: 尚無資料或非交易日`);
      });
  }

  async updateSectorTrades(date: string) {
    this.spinner.start(`正在取得上市櫃類股成交量值...`);

    await firstValueFrom(this.client.send({ cmd: 'update_sector_trades' }, { date, exchange: Exchange.TWSE }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 上市類股成交量值: 已更新`);
        else this.spinner.warn(`${date} 上市類股成交量值: 尚無資料或非交易日`);
      });

    await firstValueFrom(this.client.send({ cmd: 'update_sector_trades' }, { date, exchange: Exchange.TPEx }))
      .then(result => {
        if (result) this.spinner.succeed(`${date} 上市類股成交量值: 已更新`);
        else this.spinner.warn(`${date} 上市類股成交量值: 尚無資料或非交易日`);
      });
  }

  async wait(ms: number) {
    this.spinner.start('正在等待取得資料...');
    await new Promise((resolve) => setTimeout(resolve, ms));
    this.spinner.stop();
  }
}
