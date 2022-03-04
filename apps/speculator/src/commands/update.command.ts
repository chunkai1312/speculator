import { Console, Command, createSpinner } from 'nestjs-console';
import { DateTime } from 'luxon';
import { Exchange, MarketChip } from 'src/tickers/enums';
import { TickersService } from 'src/tickers/tickers.service';
import { UpdateCommandOptions } from './interfaces';
import { wait } from './utils';

@Console()
export class UpdateCommand {
  constructor(private readonly tickerService: TickersService) {}

  @Command({
    command: 'update',
    description: '更新交易日資訊',
    options: [{
      flags: '-d, --date [date]',
      description: '指定日期',
      defaultValue: DateTime.local().toISODate(),
      fn: (value) => DateTime.fromISO(value).isValid && value || DateTime.local().toISODate(),
    }],
  })
  async commandHandler(options: UpdateCommandOptions): Promise<void> {
    const spinner = createSpinner();

    try {
      await wait(5000, spinner);
      await this.updateMarketChips(options.date);
      await wait(5000, spinner);
      await this.updateEquityChips(options.date);
      await wait(5000, spinner);
      await this.updateEquityQuotes(options.date);
      await wait(5000, spinner);
      await this.updateIndexQuotes(options.date);
      await wait(5000, spinner);
      await this.updateMarketTrades(options.date);
      await wait(5000, spinner);
      await this.updateSectorTrades(options.date);
      spinner.succeed(`${options.date} 更新完成`);
    } catch (err) {
      console.log(err);
    }
  }

  async updateMarketChips(date: string) {
    const spinner = createSpinner();
    spinner.start(`正在取得大盤籌碼資訊`);

    const results = await Promise.all([
      this.tickerService.updateMarketChips({ date, type: MarketChip.StockMarketInstiInvestorsNetBuySell }),
      this.tickerService.updateMarketChips({ date, type: MarketChip.StockMarketMarginTransactions }),
      this.tickerService.updateMarketChips({ date, type: MarketChip.StockMarketIndexFuturesInstiInvestorsNetOi }),
      this.tickerService.updateMarketChips({ date, type: MarketChip.StockMarketIndexOptionsInstiInvestorsNetOi }),
      this.tickerService.updateMarketChips({ date, type: MarketChip.StockMarketIndexFuturesLargeTraderNetOi }),
      this.tickerService.updateMarketChips({ date, type: MarketChip.StockMarketIndexFuturesRetailInvestorsNetOi }),
    ]);

    if (results[0]) spinner.succeed(`${date} 三大法人買賣超: 已更新`);
    else spinner.warn(`${date} 三大法人買賣超: 尚無資料或非交易日`);

    if (results[1]) spinner.succeed(`${date} 信用交易: 已更新`);
    else spinner.warn(`${date} 信用交易: 尚無資料或非交易日`);

    if (results[2]) spinner.succeed(`${date} 台指期三大法人淨部位: 已更新`);
    else spinner.warn(`${date} 台指期三大法人淨部位: 尚無資料或非交易日`);

    if (results[3]) spinner.succeed(`${date} 台指選擇權三大法人淨部位: 已更新`);
    else spinner.warn(`${date} 台指選擇權三大法人淨部位: 尚無資料或非交易日`);

    if (results[4]) spinner.succeed(`${date} 台指期大額交易人淨部位: 已更新`);
    else spinner.warn(`${date} 台指期大額交易人淨部位: 尚無資料或非交易日`);

    if (results[5]) spinner.succeed(`${date} 小台散戶淨部位: 已更新`);
    else spinner.warn(`${date} 小台散戶淨部位: 尚無資料或非交易日`);
  }

  async updateEquityChips(date: string) {
    const spinner = createSpinner();
    spinner.start(`正在取得上市櫃個股法人進出...`);

    const [ twse, tpex ] = await Promise.all([
      this.tickerService.updateEquityChips({ date, exchange: Exchange.TWSE }),
      this.tickerService.updateEquityChips({ date, exchange: Exchange.TPEx }),
    ]);

    if (twse) spinner.succeed(`${date} 上市個股法人進出: 已更新`);
    else spinner.warn(`${date} 上市個股法人進出: 尚無資料或非交易日`);

    if (tpex) spinner.succeed(`${date} 上櫃個股法人進出: 已更新`);
    else spinner.warn(`${date} 上櫃個股法人進出: 尚無資料或非交易日`);
  }

  async updateEquityQuotes(date: string) {
    const spinner = createSpinner();
    spinner.start(`正在取得上市櫃個股收盤行情...`);

    const [ twse, tpex ] = await Promise.all([
      this.tickerService.updateEquityQuotes({ date, exchange: Exchange.TWSE }),
      this.tickerService.updateEquityQuotes({ date, exchange: Exchange.TPEx }),
    ]);

    if (twse) spinner.succeed(`${date} 上市個股收盤行情: 已更新`);
    else spinner.warn(`${date} 上市個股收盤行情: 尚無資料或非交易日`);

    if (tpex) spinner.succeed(`${date} 上櫃個股收盤行情: 已更新`);
    else spinner.warn(`${date} 上櫃個股收盤行情: 尚無資料或非交易日`);
  }

  async updateIndexQuotes(date: string) {
    const spinner = createSpinner();
    spinner.start(`正在取得上市櫃指數收盤行情...`);

    const [ twse, tpex ] = await Promise.all([
      this.tickerService.updateIndexQuotes({ date, exchange: Exchange.TWSE }),
      this.tickerService.updateIndexQuotes({ date, exchange: Exchange.TPEx }),
    ]);

    if (twse) spinner.succeed(`${date} 上市指數收盤行情: 已更新`);
    else spinner.warn(`${date} 上市指數收盤行情: 尚無資料或非交易日`);

    if (tpex) spinner.succeed(`${date} 上櫃指數收盤行情: 已更新`);
    else spinner.warn(`${date} 上櫃指數收盤行情: 尚無資料或非交易日`);
  }

  async updateMarketTrades(date: string) {
    const spinner = createSpinner();
    spinner.start(`正在取得上市櫃大盤成交量值...`);

    const [ twse, tpex ] = await Promise.all([
      this.tickerService.updateMarketTrades({ date, exchange: Exchange.TWSE }),
      this.tickerService.updateMarketTrades({ date, exchange: Exchange.TPEx }),
    ]);

    if (twse) spinner.succeed(`${date} 上市大盤成交量值: 已更新`);
    else spinner.warn(`${date} 上市大盤成交量值: 尚無資料或非交易日`);

    if (tpex) spinner.succeed(`${date} 上櫃大盤成交量值: 已更新`);
    else spinner.warn(`${date} 上櫃大盤成交量值: 尚無資料或非交易日`);
  }

  async updateSectorTrades(date: string) {
    const spinner = createSpinner();
    spinner.start(`正在取得上市櫃類股成交量值...`);

    const [ twse, tpex ] = await Promise.all([
      this.tickerService.updateSectorTrades({ date, exchange: Exchange.TWSE }),
      this.tickerService.updateSectorTrades({ date, exchange: Exchange.TPEx }),
    ]);

    if (twse) spinner.succeed(`${date} 上市類股成交量值: 已更新`);
    else spinner.warn(`${date} 上市類股成交量值: 尚無資料或非交易日`);

    if (tpex) spinner.succeed(`${date} 上櫃類股成交量值: 已更新`);
    else spinner.warn(`${date} 上櫃類股成交量值: 尚無資料或非交易日`);
  }
}
