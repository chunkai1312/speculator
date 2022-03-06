export interface MarketInfo {
  date: string;
  taiexPrice: number;
  taifexVolume: number;
  taifexChange: number;
  finiNetBuySell: number;
  sitcNetBuySell: number;
  dealersNetBuySell: number;
  marginPurchase: number;
  marginPurchaseChange: number;
  shortSale: number;
  shortSaleChange: number;
  finiFuturesNetOi: number;
  finiCallsNetOi: number;
  finiPutsNetOi: number;
  top10TradersFrontMonthNetOi: number;
  top10TradersBackMonthsNetOi: number;
  retailInvestorsNetOi: number;
  retailInvestorsLongShortRatio: number;
  pcRatio: number;
}
