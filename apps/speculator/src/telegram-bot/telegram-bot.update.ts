import { Update, Ctx, Start, Help, On, Hears } from 'nestjs-telegraf';
import { DateTime } from 'luxon';
import { TelegrafContext } from './interfaces/telegraf-context.interface';
import { TickersService } from 'src/tickers/tickers.service';
import { getNetBuySellListFromTickers } from 'src/tickers/utils/get-net-buy-sell-list-from-tickers.util';
import { getMoneyFlowFromTickersByDate } from 'src/tickers/utils/get-money-flow-from-tickers-by-date.util';
import { NetBuySellList } from 'src/tickers/enums/net-buy-sell-list.enum';
import { table } from 'table';
import { Exchange, Index, TickerType } from 'src/tickers/enums';

@Update()
export class TelegramBotUpdate {
  constructor(private readonly tickersService: TickersService) {}

  @Start()
  async start(@Ctx() ctx: TelegrafContext) {
    await ctx.reply('Welcome');
  }

  @Help()
  async help(@Ctx() ctx: TelegrafContext) {
    await ctx.reply('Send me a sticker');
  }

  @On('sticker')
  async on(@Ctx() ctx: TelegrafContext) {
    await ctx.reply('👍');
  }

  @Hears('hi')
  async hears(@Ctx() ctx: TelegrafContext) {
    await ctx.reply('welcome');
  }

  @Hears('外資')
  async fini(@Ctx() ctx: TelegrafContext) {
    const results = await this.tickersService.getTickersByDate({ date: DateTime.local().toISODate(), type: TickerType.Equity });
    const date = Object.keys(results)[0];
    const tickers = results[date];

    const twseFiniNetBuy = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.TwseQfiiNetBuy, top: 50 })
      .reduce((data, ticker, i) =>
        [ ...data, [i + 1, ticker.symbol, ticker.name, ticker.qfiiNetBuySell] ],
        [['排名', '代號', '股票', '買超(張)']]
      );

    const twseFiniNetSell = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.TwseQfiiNetSell, top: 50 })
      .reduce((data, ticker, i) =>
        [ ...data, [i + 1, ticker.symbol, ticker.name, ticker.qfiiNetBuySell] ],
        [['排名', '代號', '股票', '買超(張)']]
      );

    const tpexFiniNetBuy = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.TpexQfiiNetBuy, top: 50 })
      .reduce((data, ticker, i) =>
        [ ...data, [i + 1, ticker.symbol, ticker.name, ticker.qfiiNetBuySell] ],
        [['排名', '代號', '股票', '買超(張)']]
      );

    const tpexFiniNetSell = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.TpexQfiiNetSell, top: 50 })
      .reduce((data, ticker, i) =>
        [ ...data, [i + 1, ticker.symbol, ticker.name, ticker.qfiiNetBuySell] ],
        [['排名', '代號', '股票', '買超(張)']]
      );

    await ctx.replyWithHTML(`<b>上市外資買超排行</b> (${date})\n<pre>${table(twseFiniNetBuy, { singleLine: true })}</pre>`);
    await ctx.replyWithHTML(`<b>上市外資賣超排行</b> (${date})\n<pre>${table(twseFiniNetSell, { singleLine: true })}</pre>`);
    await ctx.replyWithHTML(`<b>上櫃外資買超排行</b> (${date})\n<pre>${table(tpexFiniNetBuy, { singleLine: true })}</pre>`);
    await ctx.replyWithHTML(`<b>上櫃外資賣超排行</b> (${date})\n<pre>${table(tpexFiniNetSell, { singleLine: true })}</pre>`);
  }

  @Hears('投信')
  async sitc(@Ctx() ctx: TelegrafContext) {
    const results = await this.tickersService.getTickersByDate({ date: DateTime.local().toISODate(), type: TickerType.Equity });
    const date = Object.keys(results)[0];
    const tickers = results[date];

    const twseSitcNetBuy = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.TwseSiteNetBuy, top: 50 })
      .reduce((data, ticker, i) =>
        [ ...data, [i + 1, ticker.symbol, ticker.name, ticker.siteNetBuySell] ],
        [['排名', '代號', '股票', '買超(張)']]
      );

    const twseSitcNetSell = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.TwseSiteNetSell, top: 50 })
      .reduce((data, ticker, i) =>
        [ ...data, [i + 1, ticker.symbol, ticker.name, ticker.siteNetBuySell] ],
        [['排名', '代號', '股票', '買超(張)']]
      );

    const tpexSitcNetBuy = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.TpexSiteNetBuy, top: 50 })
      .reduce((data, ticker, i) =>
        [ ...data, [i + 1, ticker.symbol, ticker.name, ticker.siteNetBuySell] ],
        [['排名', '代號', '股票', '買超(張)']]
      );

    const tpexSitcNetSell = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.TpexSiteNetSell, top: 50 })
      .reduce((data, ticker, i) =>
        [ ...data, [i + 1, ticker.symbol, ticker.name, ticker.siteNetBuySell] ],
        [['排名', '代號', '股票', '買超(張)']]
      );

    await ctx.replyWithHTML(`<b>上市投信買超排行</b> (${date})\n<pre>${table(twseSitcNetBuy, { singleLine: true })}</pre>`);
    await ctx.replyWithHTML(`<b>上市投信賣超排行</b> (${date})\n<pre>${table(twseSitcNetSell, { singleLine: true })}</pre>`);
    await ctx.replyWithHTML(`<b>上櫃投信買超排行</b> (${date})\n<pre>${table(tpexSitcNetBuy, { singleLine: true })}</pre>`);
    await ctx.replyWithHTML(`<b>上櫃投信賣超排行</b> (${date})\n<pre>${table(tpexSitcNetSell, { singleLine: true })}</pre>`);
  }

  @Hears('資金流向')
  async moneyFlow(@Ctx() ctx: TelegrafContext) {
    const tickersByDate = await this.tickersService.getTickersByDate({ date: DateTime.local().toISODate(), type: TickerType.Index, days: 2 });

    const date = Object.keys(tickersByDate)[0];

    const twseMoneyFlowByDate = getMoneyFlowFromTickersByDate(tickersByDate, { exchange: Exchange.TWSE });
    const tpexMoneyFlowByDate = getMoneyFlowFromTickersByDate(tickersByDate, { exchange: Exchange.TPEx });

    const twseMoneyFlow = twseMoneyFlowByDate[date]
      .filter(ticker => ticker.symbol !== Index.TAIEX)
      .reduce((data, ticker, i) =>
        [ ...data, [ticker.name, ticker.closePrice, ticker.change, ticker.changePercent, Math.round(ticker.tradeValue / 1000000) / 100, ticker.tradeWeight] ],
        [['類股', '指數', '漲跌', '漲跌幅', '成交金額(億元)', '成交比重']]
      );

    const tpexMoneyFlow = tpexMoneyFlowByDate[date]
      .filter(ticker => ticker.symbol !== Index.TPEX)
      .reduce((data, ticker, i) =>
        [ ...data, [ticker.name, ticker.closePrice, ticker.change, ticker.changePercent, Math.round(ticker.tradeValue / 1000000) / 100, ticker.tradeWeight] ],
        [['類股', '指數', '漲跌', '漲跌幅', '成交金額(億元)', '成交比重']]
      );

    await ctx.replyWithHTML(`<b>上市資金流向</b> (${date})\n<pre>${table(twseMoneyFlow, { singleLine: true })}</pre>`);
    await ctx.replyWithHTML(`<b>上櫃資金流向</b> (${date})\n<pre>${table(tpexMoneyFlow, { singleLine: true })}</pre>`);
  }
}
