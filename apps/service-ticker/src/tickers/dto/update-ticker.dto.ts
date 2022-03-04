import { TickerType, Exchange, Market, Index } from '../enums';

export class UpdateTickerDto {
  readonly date: string;
  readonly type?: TickerType;
  readonly exchange?: Exchange;
  readonly market?: Market;
  readonly symbol: string | Index;
  readonly name?: string;
  readonly price?: number;
  readonly volume?: number;
  readonly change?: number;
  readonly changePercent?: number;
  readonly qfiiNetBuySell?: number;
  readonly siteNetBuySell?: number;
  readonly dealersNetBuySell?: number;
  readonly marginPurchase?: number;
  readonly marginPurchaseChange?: number;
  readonly shortSale?: number;
  readonly shortSaleChange?: number;
  readonly qfiiTxNetOi?: number;
  readonly qfiiTxoCallsNetOi?: number;
  readonly qfiiTxoCallsNetOiValue?: number;
  readonly qfiiTxoPutsNetOi?: number;
  readonly qfiiTxoPutsNetOiValue?: number;
  readonly top10TxFrontMonthNetOi?: number;
  readonly top10TxBackMonthsNetOi?: number;
  readonly retailMtxNetOi?: number;
  readonly retailMtxLongShortRatio?: number;
  readonly pcRatio?: number;
  readonly usdtwd?: number;
}
