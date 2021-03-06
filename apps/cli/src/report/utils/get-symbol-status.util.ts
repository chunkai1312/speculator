import { Ticker } from 'apps/api/src/tickers/interfaces';
import { NetBuySellList } from 'apps/api/src/tickers/enums/net-buy-sell-list.enum';
import { getNetBuySellListFromTickers } from 'apps/api/src/tickers/utils';
import { SymbolStatus } from '../interfaces/symbol-status.interface';

export function getSymbolStatus(symbol: string, data: Record<string, Ticker[]>): SymbolStatus {
  const [ lastDate, prevDate, ...dates ] = Object.keys(data);

  const lastDateFiniNetBuy = getNetBuySellListFromTickers(data[lastDate], { type: NetBuySellList.QfiiNetBuy, top: 50 });
  const lastDateFiniNetSell = getNetBuySellListFromTickers(data[lastDate], { type: NetBuySellList.QfiiNetSell, top: 50 });
  const lastDateSitcNetBuy = getNetBuySellListFromTickers(data[lastDate], { type: NetBuySellList.SiteNetBuy, top: 50 });
  const lastDateSitcNetSell = getNetBuySellListFromTickers(data[lastDate], { type: NetBuySellList.SiteNetSell, top: 50 });
  const prevDateFiniNetBuy = getNetBuySellListFromTickers(data[prevDate], { type: NetBuySellList.QfiiNetBuy, top: 50 });
  const prevDateFiniNetSell = getNetBuySellListFromTickers(data[prevDate], { type: NetBuySellList.QfiiNetSell, top: 50 });
  const prevDateSitcNetBuy = getNetBuySellListFromTickers(data[prevDate], { type: NetBuySellList.SiteNetBuy, top: 50 });
  const prevDateSitcNetSell = getNetBuySellListFromTickers(data[prevDate], { type: NetBuySellList.SiteNetSell, top: 50 });

  const isFiniContinuousBuying = !!(lastDateFiniNetBuy.find(ticker => ticker.symbol === symbol) && prevDateFiniNetBuy.find(data => data.symbol === symbol));
  const isFiniContinuousSelling = !!(lastDateFiniNetSell.find(data => data.symbol === symbol) && prevDateFiniNetSell.find(data => data.symbol === symbol));
  const isSitcContinuousBuying = !!(lastDateSitcNetBuy.find(data => data.symbol === symbol) && prevDateSitcNetBuy.find(data => data.symbol === symbol));
  const isSitcContinuousSelling = !!(lastDateSitcNetSell.find(data => data.symbol === symbol) && prevDateSitcNetSell.find(data => data.symbol === symbol));
  const isSynchronousBuying = !!(lastDateFiniNetBuy.find(data => data.symbol === symbol) && lastDateSitcNetBuy.find(data => data.symbol === symbol));
  const isSynchronousSelling = !!(lastDateFiniNetSell.find(data => data.symbol === symbol) && lastDateSitcNetSell.find(data => data.symbol === symbol));
  const isContrarianTrading = !!((lastDateFiniNetBuy.find(data => data.symbol === symbol) && lastDateSitcNetSell.find(data => data.symbol === symbol) || lastDateFiniNetSell.find(data => data.symbol === symbol) && lastDateSitcNetBuy.find(data => data.symbol === symbol)));

  const isNewEntry = [].concat(prevDate, dates).every(date => {
    const tickers = data[date];
    const finiNetBuy = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.QfiiNetBuy, top: 50 });
    const finiNetSell = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.QfiiNetSell, top: 50 });
    const sitcNetBuy = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.SiteNetBuy, top: 50 });
    const sitcNetSell = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.SiteNetSell, top: 50 });
    return !([].concat(
      finiNetBuy.map(data => data.symbol),
      finiNetSell.map(data => data.symbol),
      sitcNetBuy.map(data => data.symbol),
      sitcNetSell.map(data => data.symbol),
    ).includes(symbol));
  });

  const isFiniNewBuying = symbol && [].concat(prevDate, dates).every(date => {
    const tickers = data[date];
    const finiNetBuy = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.QfiiNetBuy, top: 50 });
    return !(finiNetBuy.map(data => data.symbol)).includes(symbol);
  });

  const isFiniNewSelling = symbol &&[].concat(prevDate, dates).every(date => {
    const tickers = data[date];
    const finiNetSell = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.QfiiNetSell, top: 50 });
    return !(finiNetSell.map(data => data.symbol)).includes(symbol);
  });

  const isSitcNewBuying = symbol &&[].concat(prevDate, dates).every(date => {
    const tickers = data[date];
    const sitcNetBuy = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.SiteNetBuy, top: 50 });
    return !(sitcNetBuy.map(data => data.symbol)).includes(symbol);
  });

  const isSitcNewSelling = symbol &&[].concat(prevDate, dates).every(date => {
    const tickers = data[date];
    const sitcNetSell = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.SiteNetSell, top: 50 });
    return !(sitcNetSell.map(data => data.symbol)).includes(symbol);
  });

  return {
    isFiniContinuousBuying, // ??????????????????
    isFiniContinuousSelling, // ??????????????????
    isSitcContinuousBuying, // ??????????????????
    isSitcContinuousSelling, // ??????????????????
    isFiniNewBuying, // ???????????????
    isFiniNewSelling, // ???????????????
    isSitcNewBuying, // ???????????????
    isSitcNewSelling, // ???????????????
    isSynchronousBuying, // ????????????????????????
    isSynchronousSelling, // ????????????????????????
    isContrarianTrading, // ??????????????????????????????
  };
}
