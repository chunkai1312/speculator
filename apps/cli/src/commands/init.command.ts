import * as ora from 'ora';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Command, CommandRunner, Option } from 'nest-commander';
import { Exchange, MarketChip } from '@speculator/common';
import { API_SERVICE } from '../constants';

interface InitCommandOptions {
  from?: string;
  to?: string;
}

@Command({ name: 'init', description: '初始化應用程式' })
export class InitCommand implements CommandRunner {
  private readonly spinner = ora();

  constructor(@Inject(API_SERVICE) private readonly client: ClientProxy) {}

  async run(passedParam: string[], options?: InitCommandOptions): Promise<void> {
    const start = DateTime.fromISO(options.from);
    const end = DateTime.fromISO(options.to);

    try {
      this.spinner.start('正在初始化應用程式...');

      for (let dt = start; dt <= end; dt = dt.plus({ day: 1 })) {
        const date = dt.toISODate();
        await this.wait(5000);
        await this.updateMarketChips(date);
        await this.wait(5000);
        await this.updateEquityChips(date);
        await this.wait(5000);
        await this.updateEquityQuotes(date);
        await this.wait(5000);
        await this.updateIndexQuotes(date);
        await this.wait(5000);
        await this.updateMarketTrades(date);
        await this.wait(5000);
        await this.updateSectorTrades(date);
        this.spinner.succeed(`${date} 更新完成`);
      }

      this.spinner.succeed('應用程式初始化完成');
    } catch (err) {
      this.spinner.fail('執行階段錯誤');
      console.log(err);
    }
  }

  @Option({
    flags: '-f, --from [date]',
    description: '開始日期',
    defaultValue: DateTime.local().toISODate(),
  })
  parseFrom(value: string): string {
    return DateTime.fromISO(value).isValid && value || DateTime.local().toISODate();
  }

  @Option({
    flags: '-t, --to [date]',
    description: '結束日期',
    defaultValue: DateTime.local().toISODate(),
  })
  parseTo(value: string): string {
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
