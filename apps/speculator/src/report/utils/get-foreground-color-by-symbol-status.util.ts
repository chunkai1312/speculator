import { NetBuySellSheetColumn, ForegroundColor } from '../enums';
import { SymbolStatus } from '../interfaces/symbol-status.interface';

interface Options {
  column: NetBuySellSheetColumn;
}

export function getForegroundColorBySymbolStatus(symbolStatus: SymbolStatus, options: Options): ForegroundColor {
  const colors = {
    [NetBuySellSheetColumn.SymbolOfQfiiNetBuy]: () => {
      if (symbolStatus.isFiniContinuousBuying) return ForegroundColor.Continuous;
      if (symbolStatus.isFiniNewBuying) return ForegroundColor.Notice;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.NameOfQfiiNetBuy]: () => {
      if (symbolStatus.isSynchronousBuying) return ForegroundColor.Synchronous;
      if (symbolStatus.isContrarianTrading) return ForegroundColor.Contrarian;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.SymbolOfQfiiNetSell]: () => {
      if (symbolStatus.isFiniContinuousSelling) return ForegroundColor.Continuous;
      if (symbolStatus.isFiniNewSelling) return ForegroundColor.Notice;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.NameOfQfiiNetSell]: () => {
      if (symbolStatus.isSynchronousSelling) return ForegroundColor.Synchronous;
      if (symbolStatus.isContrarianTrading) return ForegroundColor.Contrarian;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.SymbolOfSiteNetBuy]: () => {
      if (symbolStatus.isSitcContinuousBuying) return ForegroundColor.Continuous;
      if (symbolStatus.isSitcNewBuying) return ForegroundColor.Notice;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.NameOfSiteNetBuy]: () => {
      if (symbolStatus.isSynchronousBuying) return ForegroundColor.Synchronous;
      if (symbolStatus.isContrarianTrading) return ForegroundColor.Contrarian;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.SymbolOfSiteNetSell]: () => {
      if (symbolStatus.isSitcContinuousSelling) return ForegroundColor.Continuous;
      if (symbolStatus.isSitcNewSelling) return ForegroundColor.Notice;
      return ForegroundColor.Normal;
    },
    [NetBuySellSheetColumn.NameOfSiteNetSell]: () => {
      if (symbolStatus.isSynchronousSelling) return ForegroundColor.Synchronous;
      if (symbolStatus.isContrarianTrading) return ForegroundColor.Contrarian;
      return ForegroundColor.Normal;
    },
  }

  return colors[options.column]() || ForegroundColor.Normal;
}
