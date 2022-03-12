import * as numeral from 'numeral';
import * as FormData from 'form-data';
import * as csvtojson from 'csvtojson';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { HttpService } from '@nestjs/axios';
import { TickerType, Exchange, Index, Market, MarketChip } from '@speculator/common';
import { TwseTradingValueResponse, TwseMarginTransactionsResponse } from '../../interfaces/twse';
import { TaifexCallsAndPutsContract, TaifexFuturesContract, TaifexFuturesDailyMarket, TaifexFuturesLargeTrader, TaifexPcRatio } from '../../interfaces/taifex';
import { UpdateMarketChipsCommand } from '../impl/update-market-chips.command';
import { MarketChipsUpdatedEvent } from '../../events/impl/market-chips-updated.event';
import { TickerRepository } from '../../repositories/ticker.repository';
import { Ticker } from '../../interfaces';

@CommandHandler(UpdateMarketChipsCommand)
export class UpdateMarketChipsHandler implements ICommandHandler<UpdateMarketChipsCommand> {
  constructor(
    private readonly httpService: HttpService,
    private readonly eventBus: EventBus,
    private readonly tickerRepository: TickerRepository,
  ) {}

  async execute(command: UpdateMarketChipsCommand) {
    const { cmd } = command;

    try {
      const getTicker = (type: MarketChip) => {
        const chips = {
          [MarketChip.StockMarketInstiInvestorsNetBuySell]: () => this.fetchTwseStockMarketInstiInvestorsNetBuySell(cmd.date),
          [MarketChip.StockMarketMarginTransactions]: () => this.fetchTwseStockMarketMarginTransactions(cmd.date),
          [MarketChip.StockMarketIndexFuturesInstiInvestorsNetOi]: () => this.fetchTaifexFuturesContractNetAmount(cmd.date),
          [MarketChip.StockMarketIndexOptionsInstiInvestorsNetOi]: () => this.fetchTaifexCallsAndPutsContractNetAmount(cmd.date),
          [MarketChip.StockMarketIndexFuturesLargeTraderNetOi]: () => this.fetchTaifexFuturesLargeTraderNetAmount(cmd.date),
          [MarketChip.StockMarketIndexFuturesRetailInvestorsNetOi]: () => this.fetchTaifexRetailInvestorsLongShortRatio(cmd.date),
          [MarketChip.StockMarketIndexOptionsPutCallRatio]: () => this.fetchTaifexTxoPcRatio(cmd.date),
          [MarketChip.UsdTwdRate]: () => this.fetchUsdTwdRate(cmd.date),
        };
        return chips[type]();
      };

      const ticker = await getTicker(cmd.type);
      if(!ticker) return null;

      await this.tickerRepository.updateTicker(ticker);
      this.eventBus.publish(new MarketChipsUpdatedEvent(cmd));
      return ticker;
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * 取得股票市場三大法人買賣超
   */
  async fetchTwseStockMarketInstiInvestorsNetBuySell(date: string): Promise<Ticker> {
    const query = new URLSearchParams({
      type: 'day',
      dayDate: date.replace(/-/g, ''),
      response: 'json'
    });
    const url = `https://www.twse.com.tw/fund/BFI82U?${query}`;

    const responseData: TwseTradingValueResponse = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') ? response.data : null);

    if (!responseData) return null;

    const [ dp, dh, it, fi, fd ] = responseData.data;
    const [ dpName, dpBuy, dpSell, dpNet ] = dp;
    const [ dhName, dhBuy, dhSell, dhNet ] = dh;
    const [ itName, itBuy, itSell, itNet ] = it;
    const [ fiName, fiBuy, fiSell, fiNet ] = fi;
    const [ fdName, fdBuy, fdSell, fdNet ] = fd;

    const raw = {
      dpBuy: numeral(dpBuy).value(),
      dpSell: numeral(dpSell).value(),
      dpNet: numeral(dpNet).value(),
      dhBuy: numeral(dhBuy).value(),
      dhSell: numeral(dhSell).value(),
      dhNet: numeral(dhNet).value(),
      itBuy: numeral(itBuy).value(),
      itSell: numeral(itSell).value(),
      itNet: numeral(itNet).value(),
      fiBuy: numeral(fiBuy).value(),
      fiSell: numeral(fiSell).value(),
      fiNet: numeral(fiNet).value(),
      fdBuy: numeral(fdBuy).value(),
      fdSell: numeral(fdSell).value(),
      fdNet: numeral(fdNet).value(),
    };

    const data = {
      date,
      type: TickerType.Index,
      exchange: Exchange.TWSE,
      market: Market.TSE,
      symbol: Index.TAIEX,
      qfiiNetBuySell: raw.fiNet + raw.fdNet,
      siteNetBuySell: raw.itNet,
      dealersNetBuySell: raw.dpNet + raw.dhNet,
    };

    return data;
  }

  /**
   * 取得融資融券餘額
   */
  async fetchTwseStockMarketMarginTransactions(date: string): Promise<Ticker> {
    const query = new URLSearchParams({
      date: date.replace(/-/g, ''),
      response: 'json', selectType: 'MS'
    });
    const url = `https://www.twse.com.tw/exchangeReport/MI_MARGN?${query}`;

    const responseData: TwseMarginTransactionsResponse = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') ? response.data : null);

    if (!responseData) return null;
    if (!responseData.creditList.length) return null;

    const [ marginPurchase, shortSale, marginPurchaseValue ] = responseData.creditList;
    const [ marginPurchaseName, marginPurchaseBuy, marginPurchaseSell, marginPurchaseRedemption, marginPurchasePrevBalance, marginPurchaseBalance ] = marginPurchase;
    const [ shortSaleName, shortSaleBuy, shortSaleSell, shortSaleRedemption, shortSalePrevBalance, shortSaleBalance ] = shortSale;
    const [ marginPurchaseValueName, marginPurchaseValueBuy, marginPurchaseValueSell, marginPurchaseValueRedemption, marginPurchaseValuePrevBalance, marginPurchaseValueBalance ] = marginPurchaseValue;

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
      marginPurchaseValueBuy: numeral(marginPurchaseValueBuy).value(),
      marginPurchaseValueSell: numeral(marginPurchaseValueSell).value(),
      marginPurchaseValueRedemption: numeral(marginPurchaseValueRedemption).value(),
      marginPurchaseValuePrevBalance: numeral(marginPurchaseValuePrevBalance).value(),
      marginPurchaseValueBalance: numeral(marginPurchaseValueBalance).value(),
    };

    const data = {
      date,
      type: TickerType.Index,
      exchange: Exchange.TWSE,
      market: Market.TSE,
      symbol: Index.TAIEX,
      marginPurchase: raw.marginPurchaseValueBalance,
      marginPurchaseChange: raw.marginPurchaseValueBalance - raw.marginPurchaseValuePrevBalance,
      shortSale: raw.shortSaleBalance,
      shortSaleChange: raw.shortSaleBalance - raw.shortSalePrevBalance,
    };

    return data;
  }

  /**
   * 取得三大法人台指期貨淨未平倉
   */
  async fetchTaifexFuturesContractNetAmount(date: string): Promise<Ticker> {
    const queryDate = date.replace(/-/g, '/');
    const url = 'https://www.taifex.com.tw/enl/eng3/futContractsDateDown';

    const form = new FormData();
    form.append('queryStartDate', queryDate);
    form.append('queryEndDate', queryDate);
    form.append('commodityId', 'TXF');

    const responseData: TaifexFuturesContract[] = await firstValueFrom(this.httpService.post(url, form, { headers: form.getHeaders() }))
      .then(response => csvtojson().fromString(response.data));

    if (!responseData[0]?.Date) return null;

    const [ dealers, site, qfii ] = responseData;

    const raw = {
      dealersLongOiVolume: numeral(dealers['Open Interest (Long)']).value(),
      dealersLongOiValue: numeral(dealers['Contract Value of Open Interest (Long)(Thousands)']).value(),
      dealersShortOiVolume: numeral(dealers['Open Interest (Short)']).value(),
      dealersShortOiValue: numeral(dealers['Contract Value of Open Interest (Short)(Thousands)']).value(),
      dealersNetOiVolume: numeral(dealers['Open Interest (Net)']).value(),
      dealersNetOiValue: numeral(dealers['Contract Value of Open Interest (Net)(Thousands)']).value(),
      siteLongOiVolume: numeral(site['Open Interest (Long)']).value(),
      siteLongOiValue: numeral(site['Contract Value of Open Interest (Long)(Thousands)']).value(),
      siteShortOiVolume: numeral(site['Open Interest (Short)']).value(),
      siteShortOiValue: numeral(site['Contract Value of Open Interest (Short)(Thousands)']).value(),
      siteNetOiVolume: numeral(site['Open Interest (Net)']).value(),
      siteNetOiValue: numeral(site['Contract Value of Open Interest (Net)(Thousands)']).value(),
      qfiiLongOiVolume: numeral(qfii['Open Interest (Long)']).value(),
      qfiiLongOiValue: numeral(qfii['Contract Value of Open Interest (Long)(Thousands)']).value(),
      qfiiShortOiVolume: numeral(qfii['Open Interest (Short)']).value(),
      qfiiShortOiValue: numeral(qfii['Contract Value of Open Interest (Short)(Thousands)']).value(),
      qfiiNetOiVolume: numeral(qfii['Open Interest (Net)']).value(),
      qfiiNetOiValue: numeral(qfii['Contract Value of Open Interest (Net)(Thousands)']).value(),
    };

    const data = {
      date,
      type: TickerType.Index,
      exchange: Exchange.TWSE,
      market: Market.TSE,
      symbol: Index.TAIEX,
      qfiiTxNetOi: raw.qfiiNetOiVolume,
      siteTxNetOi: raw.siteNetOiVolume,
      dealersTxNetOi: raw.dealersNetOiVolume,
    };

    return data;
  }

  /**
   * 取得三大法人台指選擇權淨未平倉
   */
  async fetchTaifexCallsAndPutsContractNetAmount(date: string): Promise<Ticker> {
    const queryDate = date.replace(/-/g, '/');
    const url = 'https://www.taifex.com.tw/enl/eng3/callsAndPutsDateDown';

    const form = new FormData();
    form.append('queryStartDate', queryDate);
    form.append('queryEndDate', queryDate);
    form.append('commodityId', 'TXO');

    const responseData: TaifexCallsAndPutsContract[] = await firstValueFrom(this.httpService.post(url, form, { headers: form.getHeaders() }))
      .then(response => csvtojson().fromString(response.data));

    if (!responseData[0]?.Date) return null;

    const [ dealersCalls, siteCalls, qfiiCalls, dealersPuts, sitePuts, qfiiPuts ] = responseData;

    const raw = {
      dealersCallsLongOiVolume: numeral(dealersCalls['Open Interest (Long)']).value(),
      dealersCallsLongOiValue: numeral(dealersCalls['Contract Value of Open Interest (Long)(Thousands)']).value(),
      dealersCallsShortOiVolume: numeral(dealersCalls['Open Interest (Short)']).value(),
      dealersCallsShortOiValue: numeral(dealersCalls['Contract Value of Open Interest (Short)(Thousands)']).value(),
      dealersCallsNetOiVolume: numeral(dealersCalls['Open Interest (Net)']).value(),
      dealersCallsNetOiValue: numeral(dealersCalls['Contract Value of Open Interest (Net)(Thousands)']).value(),
      siteCallsLongOiVolume: numeral(siteCalls['Open Interest (Long)']).value(),
      siteCallsLongOiValue: numeral(siteCalls['Contract Value of Open Interest (Long)(Thousands)']).value(),
      siteCallsShortOiVolume: numeral(siteCalls['Open Interest (Short)']).value(),
      siteCallsShortOiValue: numeral(siteCalls['Contract Value of Open Interest (Short)(Thousands)']).value(),
      siteCallsNetOiVolume: numeral(siteCalls['Open Interest (Net)']).value(),
      siteCallsNetOiValue: numeral(siteCalls['Contract Value of Open Interest (Net)(Thousands)']).value(),
      qfiiCallsLongOiVolume: numeral(qfiiCalls['Open Interest (Long)']).value(),
      qfiiCallsLongOiValue: numeral(qfiiCalls['Contract Value of Open Interest (Long)(Thousands)']).value(),
      qfiiCallsShortOiVolume: numeral(qfiiCalls['Open Interest (Short)']).value(),
      qfiiCallsShortOiValue: numeral(qfiiCalls['Contract Value of Open Interest (Short)(Thousands)']).value(),
      qfiiCallsNetOiVolume: numeral(qfiiCalls['Open Interest (Net)']).value(),
      qfiiCallsNetOiValue: numeral(qfiiCalls['Contract Value of Open Interest (Net)(Thousands)']).value(),
      dealersPutsLongOiVolume: numeral(dealersPuts['Open Interest (Long)']).value(),
      dealersPutsLongOiValue: numeral(dealersPuts['Contract Value of Open Interest (Long)(Thousands)']).value(),
      dealersPutsShortOiVolume: numeral(dealersPuts['Open Interest (Short)']).value(),
      dealersPutsShortOiValue: numeral(dealersPuts['Contract Value of Open Interest (Short)(Thousands)']).value(),
      dealersPutsNetOiVolume: numeral(dealersPuts['Open Interest (Net)']).value(),
      dealersPutsNetOiValue: numeral(dealersPuts['Contract Value of Open Interest (Net)(Thousands)']).value(),
      sitePutsLongOiVolume: numeral(sitePuts['Open Interest (Long)']).value(),
      sitePutsLongOiValue: numeral(sitePuts['Contract Value of Open Interest (Long)(Thousands)']).value(),
      sitePutsShortOiVolume: numeral(sitePuts['Open Interest (Short)']).value(),
      sitePutsShortOiValue: numeral(sitePuts['Contract Value of Open Interest (Short)(Thousands)']).value(),
      sitePutsNetOiVolume: numeral(sitePuts['Open Interest (Net)']).value(),
      sitePutsNetOiValue: numeral(sitePuts['Contract Value of Open Interest (Net)(Thousands)']).value(),
      qfiiPutsLongOiVolume: numeral(qfiiPuts['Open Interest (Long)']).value(),
      qfiiPutsLongOiValue: numeral(qfiiPuts['Contract Value of Open Interest (Long)(Thousands)']).value(),
      qfiiPutsShortOiVolume: numeral(qfiiPuts['Open Interest (Short)']).value(),
      qfiiPutsShortOiValue: numeral(qfiiPuts['Contract Value of Open Interest (Short)(Thousands)']).value(),
      qfiiPutsNetOiVolume: numeral(qfiiPuts['Open Interest (Net)']).value(),
      qfiiPutsNetOiValue: numeral(qfiiPuts['Contract Value of Open Interest (Net)(Thousands)']).value(),
    };

    const data = {
      date,
      type: TickerType.Index,
      exchange: Exchange.TWSE,
      market: Market.TSE,
      symbol: Index.TAIEX,
      qfiiTxoCallsNetOi: raw.qfiiCallsNetOiVolume,
      siteTxoCallsNetOi: raw.siteCallsNetOiVolume,
      dealersTxoCallsNetOi: raw.dealersCallsNetOiVolume,
      qfiiTxoPutsNetOi: raw.qfiiPutsNetOiVolume,
      siteTxoPutsNetOi: raw.sitePutsNetOiVolume,
      dealersTxoPutsNetOi: raw.dealersPutsNetOiVolume,
      qfiiTxoCallsNetOiValue: raw.qfiiCallsNetOiValue,
      siteTxoCallsNetOiValue: raw.siteCallsNetOiValue,
      dealersTxoCallsNetOiValue: raw.dealersCallsNetOiValue,
      qfiiTxoPutsNetOiValue: raw.qfiiPutsNetOiValue,
      siteTxoPutsNetOiValue: raw.sitePutsNetOiValue,
      dealersTxoPutsNetOiValue: raw.dealersPutsNetOiValue,
    };

    return data;
  }

  /**
   * 取得前十大交易人台指期淨部位
   */
  async fetchTaifexFuturesLargeTraderNetAmount(date: string): Promise<Ticker> {
    const queryDate = date.replace(/-/g, '/');
    const url = 'https://www.taifex.com.tw/enl/eng3/largeTraderFutDown';

    const form = new FormData();
    form.append('queryStartDate', queryDate);
    form.append('queryEndDate', queryDate);

    const responseData: TaifexFuturesLargeTrader[] = await firstValueFrom(this.httpService.post(url, form, { headers: form.getHeaders() }))
      .then(response => csvtojson().fromString(response.data));

    if (!responseData[0]?.Date) return null;

    const results = responseData
      .filter(data => data.Contract === 'TX')  // 0 = 非特定人, 1 = 特定人
      .map(data => ({
        date: DateTime.fromFormat(data['Date'], 'yyyy/MM/dd').toISODate(),
        top5LongOi: numeral(data['Top 5_Buy']).value(),
        top5ShortOi: numeral(data['Top 5_Sell']).value(),
        top5NetOi: numeral(data['Top 5_Buy']).value() - numeral(data['Top 5_Sell']).value(),
        top10LongOi: numeral(data['Top 10_Buy']).value(),
        top10ShortOi: numeral(data['Top 10_Sell']).value(),
        top10NetOi: numeral(data['Top 10_Buy']).value() - numeral(data['Top 10_Sell']).value(),
        marketOi: numeral(data['OI of Market']).value(),
      }));

    const frontMonth = (results.length === 6) ? results[2] : results[0];
    const allMonths = (results.length === 6) ? results[4] : results[2];
    const specificFrontMonth = (results.length === 6) ? results[3] : results[1];
    const specificAllMonths = (results.length === 6) ? results[5] : results[3];

    const raw = {
      top5FrontMonthLongOi: frontMonth.top5LongOi,
      top5FrontMonthShortOi: frontMonth.top5ShortOi,
      top5FrontMonthNetOi: frontMonth.top5NetOi,
      top10FrontMonthLongOi: frontMonth.top10LongOi,
      top10FrontMonthShortOi: frontMonth.top10ShortOi,
      top10FrontMonthNetOi: frontMonth.top10NetOi,
      top5BackMonthsLongOi: allMonths.top5LongOi - frontMonth.top5LongOi,
      top5BackMonthsShortOi: allMonths.top5ShortOi - frontMonth.top5ShortOi,
      top5BackMonthsNetOi: allMonths.top5NetOi - frontMonth.top5NetOi,
      top10BackMonthsLongOi: allMonths.top10LongOi - frontMonth.top10LongOi,
      top10BackMonthsShortOi: allMonths.top10ShortOi - frontMonth.top10ShortOi,
      top10BackMonthsNetOi: allMonths.top10NetOi - frontMonth.top10NetOi,
      top5AllMonthsLongOi: allMonths.top5LongOi,
      top5AllMonthsShortOi: allMonths.top5ShortOi,
      top5AllMonthsNetOi: allMonths.top5NetOi,
      top10AllMonthsLongOi: allMonths.top10LongOi,
      top10AllMonthsShortOi: allMonths.top10ShortOi,
      top10AllMonthsNetOi: allMonths.top10NetOi,
      specificTop5FrontMonthLongOi: specificFrontMonth.top5LongOi,
      specificTop5FrontMonthShortOi: specificFrontMonth.top5ShortOi,
      specificTop5FrontMonthNetOi: specificFrontMonth.top5NetOi,
      specificTop10FrontMonthLongOi: specificFrontMonth.top10LongOi,
      specificTop10FrontMonthShortOi: specificFrontMonth.top10ShortOi,
      specificTop10FrontMonthNetOi: specificFrontMonth.top10NetOi,
      specificTop5BackMonthsLongOi: specificAllMonths.top5LongOi - specificFrontMonth.top5LongOi,
      specificTop5BackMonthsShortOi: specificAllMonths.top5ShortOi - specificFrontMonth.top5ShortOi,
      specificTop5BackMonthsNetOi: specificAllMonths.top5NetOi - specificFrontMonth.top5NetOi,
      specificTop10BackMonthsLongOi: specificAllMonths.top10LongOi - specificFrontMonth.top10LongOi,
      specificTop10BackMonthsShortOi: specificAllMonths.top10ShortOi - specificFrontMonth.top10ShortOi,
      specificTop10BackMonthsNetOi: specificAllMonths.top10NetOi - specificFrontMonth.top10NetOi,
      specificTop5AllMonthsLongOi: specificAllMonths.top5LongOi,
      specificTop5AllMonthsShortOi: specificAllMonths.top5ShortOi,
      specificTop5AllMonthsNetOi: specificAllMonths.top5NetOi,
      specificTop10AllMonthsLongOi: specificAllMonths.top10LongOi,
      specificTop10AllMonthsShortOi: specificAllMonths.top10ShortOi,
      specificTop10AllMonthsNetOi: specificAllMonths.top10NetOi,
    };

    const data = {
      date,
      type: TickerType.Index,
      exchange: Exchange.TWSE,
      market: Market.TSE,
      symbol: Index.TAIEX,
      top10TxFrontMonthNetOi: raw.specificTop10FrontMonthNetOi,
      top10TxBackMonthsNetOi: raw.specificTop10BackMonthsNetOi,
    };

    return data;
  }

  /**
   * 取得小台散戶淨未平倉及小台散戶多空比
   */
  async fetchTaifexRetailInvestorsLongShortRatio(date: string): Promise<Ticker> {
    const queryDate = date.replace(/-/g, '/');

    const [ mtxMarketOi, retailMtxNetOi ] = await Promise.all([
      this.fetchTaifexMtxMarketOi(queryDate),
      this.fetchTaifexMtxRetailInvestorsNetOi(queryDate),
    ]);

    if (!mtxMarketOi || !retailMtxNetOi) return;

    const retailMtxLongShortRatio = Math.round(retailMtxNetOi / mtxMarketOi * 10000) / 10000;

    const data = {
      date,
      type: TickerType.Index,
      exchange: Exchange.TWSE,
      market: Market.TSE,
      symbol: Index.TAIEX,
      retailMtxNetOi,
      retailMtxLongShortRatio,
    };

    return data;
  }

  /**
   * 取得小台全市場未平倉
   */
  async fetchTaifexMtxMarketOi(date: string) {
    const queryDate = date.replace(/-/g, '/');
    const url = 'https://www.taifex.com.tw/enl/eng3/futDataDown';

    const form = new FormData();
    form.append('down_type', '1');
    form.append('queryStartDate', queryDate);
    form.append('queryEndDate', queryDate);
    form.append('commodity_id', 'MTX');

    const responseData: TaifexFuturesDailyMarket[] = await firstValueFrom(this.httpService.post(url, form, { headers: form.getHeaders() }))
      .then(response => csvtojson().fromString(response.data));

    if (!responseData.length) return null;

    const mtxMarketOi = responseData
      .filter(raw => raw['Trading Session'] === 'Regular' && !raw['Volume(executions among spread order and single order only)'])
      .reduce((openInterest, raw) => { return openInterest + (+raw['open_interest']) }, 0);

    return mtxMarketOi;
  }

  /**
   * 取得小台散戶淨部位
   */
  async fetchTaifexMtxRetailInvestorsNetOi(date: string) {
    const queryDate = date.replace(/-/g, '/');
    const url = 'https://www.taifex.com.tw/enl/eng3/futContractsDateDown';

    const form = new FormData();
    form.append('queryStartDate', queryDate);
    form.append('queryEndDate', queryDate);
    form.append('commodityId', 'MXF');

    const responseData: TaifexFuturesContract[] = await firstValueFrom(this.httpService.post(url, form, { headers: form.getHeaders() }))
      .then(response => csvtojson().fromString(response.data));

    if (!responseData[0]?.Date) return null;

    const retailMtxNetOi = responseData.reduce((netPosition, raw) => netPosition + (numeral(raw['Open Interest (Net)']).value()), 0) * -1;

    return retailMtxNetOi;
  }

  /**
   * 取得 P/C Ratio
   */
  async fetchTaifexTxoPcRatio(date: string): Promise<Ticker> {
    const queryDate = date.replace(/-/g, '/');
    const url = 'https://www.taifex.com.tw/enl/eng3/pcRatioDown';

    const form = new FormData();
    form.append('queryStartDate', queryDate);
    form.append('queryEndDate', queryDate);

    const responseData: TaifexPcRatio[] = await firstValueFrom(this.httpService.post(url, form, { headers: form.getHeaders() }))
      .then(response => csvtojson().fromString(response.data));

    if (!responseData[0]?.Date) return null;

    const [ data ] = responseData.map(raw => ({
      date: DateTime.fromFormat(raw['Date'], 'yyyy/MM/dd').toISODate(),
      type: TickerType.Index,
      exchange: Exchange.TWSE,
      market: Market.TSE,
      symbol: Index.TAIEX,
      pcRatio: numeral(raw['Put/Call OI Ratio%']).value(),
    }));

    return data;
  }

  /**
   * 取得美元兌換台幣匯率
   */
  async fetchUsdTwdRate(date: string) {
    const queryDate = date.replace(/-/g, '/');
    const url = 'https://www.taifex.com.tw/enl/eng3/dailyFXRateDown';

    const form = new FormData();
    form.append('queryStartDate', queryDate);
    form.append('queryEndDate', queryDate);

    const responseData: TaifexPcRatio[] = await firstValueFrom(this.httpService.post(url, form, { headers: form.getHeaders() }))
      .then(response => csvtojson().fromString(response.data));

    if (!responseData[0]?.Date) return null;

    const [ data ] = responseData.map(raw => ({
      date: DateTime.fromFormat(raw['Date'], 'yyyy/MM/dd').toISODate(),
      type: TickerType.Index,
      exchange: Exchange.TWSE,
      market: Market.TSE,
      symbol: Index.TAIEX,
      usdtwd: numeral(raw['USD/NTD']).value(),
    }));

    return data;
  }
}
