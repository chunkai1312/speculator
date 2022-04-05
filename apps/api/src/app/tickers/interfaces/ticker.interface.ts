import { TickerType, Exchange, Market } from '@speculator/common';

export interface Ticker {
  date: string;
  exchange: Exchange;
  market?: Market,
  type: TickerType;
  symbol: string;
  name?: string;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  closePrice?: number;
  change?: number;
  changePercent?: number;
  tradeVolume?: number;
  tradeValue?: number;
  transaction?: number;
  tradeWeight?: number;
  tradeWeightChange?: number;
  tradeWeightPrev?: number;
  tradeWeightAverage?: number;
  qfiiNetBuySell?: number;
  siteNetBuySell?: number;
  dealersNetBuySell?: number;
  marginPurchase?: number;
  marginPurchaseChange?: number;
  shortSale?: number;
  shortSaleChange?: number;
  qfiiTxNetOi?: number;
  qfiiTxoCallsNetOi?: number;
  qfiiTxoCallsNetOiValue?: number;
  qfiiTxoPutsNetOi?: number;
  qfiiTxoPutsNetOiValue?: number;
  top10TxFrontMonthNetOi?: number;
  top10TxBackMonthsNetOi?: number;
  retailMtxNetOi?: number;
  retailMtxLongShortRatio?: number;
  pcRatio?: number;
  usdtwd?: number;
}
