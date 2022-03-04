export interface SymbolStatus {
  isFiniContinuousBuying: boolean; // 外資連續買超
  isFiniContinuousSelling: boolean; // 外資連續賣超
  isSitcContinuousBuying: boolean; // 投信連續買超
  isSitcContinuousSelling: boolean; // 投信連續賣超
  isFiniNewBuying: boolean; // 外資新買超
  isFiniNewSelling: boolean; // 外資新賣超
  isSitcNewBuying: boolean; // 投信新買超
  isSitcNewSelling: boolean; // 投信新賣超
  isSynchronousBuying: boolean; // 外資投信同步買超
  isSynchronousSelling: boolean; // 外資投信同步賣超
  isContrarianTrading: boolean; // 外投信買賣方向不同步
}
