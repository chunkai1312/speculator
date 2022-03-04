export enum MarketChip {
  StockMarketInstiInvestorsNetBuySell, // 現貨三大法人買賣超
  StockMarketMarginTransactions, // 現貨信用交易
  StockMarketIndexFuturesInstiInvestorsNetOi, // 期貨三大法人淨部位
  StockMarketIndexOptionsInstiInvestorsNetOi, // 選擇權三大法人淨部位
  StockMarketIndexFuturesLargeTraderNetOi, // 期貨大額交易人淨部位
  StockMarketIndexFuturesRetailInvestorsNetOi, // 期貨散戶淨部位
}
