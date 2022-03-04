export interface Sector {
  symbol: string;
  name: string;
  price?: number;
  change?: number;
  changePercent?: number;
  tradeValue?: number;
  tradeWeight?: number;
  tradeWeightPrev?: number;
  tradeWeightChange?: number;
  tradeWeightAverage?: number;
}
