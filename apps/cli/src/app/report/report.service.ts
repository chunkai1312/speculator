
import * as numeral from 'numeral';
import * as ExcelJS from 'exceljs';
import { firstValueFrom } from 'rxjs';
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TickerType, Ticker, Exchange, Index } from '@speculator/common';
import { MostActives, Movers, NetBuySellList } from './enums';
import { getMoneyFlowFromTickersByDate, getMostActivesFromTickers, getMoversFromTickers, getNetBuySellListFromTickers } from './utils';
import { MarketInfoSheetColumn, MoneyFlowSheetColumn, MostActivesSheetColumn, MoversSheetColumn, NetBuySellSheetColumn, ForegroundColor } from './enums';
import { getFontColorByNetChange, getSymbolStatus, getForegroundColorBySymbolStatus } from './utils';
import { ExportOptions } from './interfaces';
import { API_SERVICE } from '../constants';

@Injectable()
export class ReportService {
  constructor(@Inject(API_SERVICE) private client: ClientProxy) {}

  async export(options: ExportOptions) {
    const { filename } = options;

    const workbook = new ExcelJS.Workbook();
    await this.addMarketInfoSheet(workbook, options);
    await this.addTwseMoneyFlowSheet(workbook, options);
    await this.addTpexMoneyFlowSheet(workbook, options);
    await this.addTwseMostActivesSheet(workbook, options);
    await this.addTpexMostActivesSheet(workbook, options);
    await this.addTwseMoversSheet(workbook, options);
    await this.addTpexMoversSheet(workbook, options);
    await this.addTwseInstiNetBuySellSheet(workbook, options);
    await this.addTpexInstiNetBuySellSheet(workbook, options);

    await workbook.xlsx.writeFile(`${process.cwd()}/${filename}`);
  }

  async addMarketInfoSheet(workbook: ExcelJS.Workbook, options: ExportOptions) {
    const { date, days } = options;
    const data = await firstValueFrom(this.client.send({ cmd: 'get_market_info' }, { date, days }));
    const worksheet = workbook.addWorksheet(`大盤籌碼`);

    worksheet.columns = [
      { width: 10 },
      { width: 15 },
      { width: 12.5 },
      { width: 12.5 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 17.5 },
      { width: 17.5 },
      { width: 17.5 },
      { width: 17.5 },
      { width: 17.5 },
      { width: 17.5 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 12.5 },
      { width: 12.5 },
    ];

    const titleRow = worksheet.addRow([`大盤籌碼 (${data[0].date})`]);
    titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
    titleRow.height = 20;

    const headerRow = worksheet.addRow([
      '日期',
      '加權指數',
      '漲跌',
      '漲跌幅',
      '成交量(億)',
      '外資\r\n買賣超(億)',
      '投信\r\n買賣超(億)',
      '自營商\r\n買賣超(億)',
      '融資\r\n餘額(億)',
      '融資\r\n餘額增減(億)',
      '融券\r\n餘額(張)',
      '融券\r\n餘額增減(張)',
      '外資台指期\r\n淨未平倉(口)',
      '外資台指期\r\n淨未平倉增減(口)',
      '外資台指買權\r\n淨未平倉(口)',
      '外資台指買權\r\n淨未平倉增減(口)',
      '外資台指賣權\r\n淨未平倉(口)',
      '外資台指賣權\r\n淨未平倉增減(口)',
      '前十大交易人台指\r\n近月淨未平倉(口)',
      '前十大交易人台指\r\n近月淨未平倉增減(口)',
      '前十大交易人台指\r\n遠月淨未平倉(口)',
      '前十大交易人台指\r\n遠月淨未平倉增減(口)',
      '散戶小台\r\n淨未平倉(口)',
      '散戶小台\r\n淨未平倉增減(口)',
      '小台散戶\r\n多空比',
      '全市場\r\nPut/Call Ratio',
      '美元/新台幣',
      '新台幣升貶',
    ]);
    headerRow.getCell(MarketInfoSheetColumn.Date).style = { alignment: { vertical: 'middle', horizontal: 'center' } };
    headerRow.getCell(MarketInfoSheetColumn.Taiex).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Taiex } } };
    headerRow.getCell(MarketInfoSheetColumn.TaiexChange).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Taiex } } };
    headerRow.getCell(MarketInfoSheetColumn.TaiexChangePercent).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Taiex } } };
    headerRow.getCell(MarketInfoSheetColumn.TaiexVolume).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Taiex } } };
    headerRow.getCell(MarketInfoSheetColumn.QfiiNetBuySell).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.NetBuySell } } };
    headerRow.getCell(MarketInfoSheetColumn.SiteNetBuySell).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.NetBuySell } } };
    headerRow.getCell(MarketInfoSheetColumn.DealersNetBuySell).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.NetBuySell } } };
    headerRow.getCell(MarketInfoSheetColumn.MarginPurchase).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.MarginTransaction } } };
    headerRow.getCell(MarketInfoSheetColumn.MarginPurchaseChange).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.MarginTransaction } } };
    headerRow.getCell(MarketInfoSheetColumn.ShortSale).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.MarginTransaction } } };
    headerRow.getCell(MarketInfoSheetColumn.ShortSaleChange).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.MarginTransaction } } };
    headerRow.getCell(MarketInfoSheetColumn.QfiiTxNetOi).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.QfiiFutures } } };
    headerRow.getCell(MarketInfoSheetColumn.QfiiTxNetOiChange).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.QfiiFutures } } };
    headerRow.getCell(MarketInfoSheetColumn.QfiiTxoCallsNetOi).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.QfiiCallsAndPuts } } };
    headerRow.getCell(MarketInfoSheetColumn.QfiiTxoCallsNetOiChange).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.QfiiCallsAndPuts } } };
    headerRow.getCell(MarketInfoSheetColumn.QfiiTxoPutsNetOi).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.QfiiCallsAndPuts } } };
    headerRow.getCell(MarketInfoSheetColumn.QfiiTxoPutsNetOiChange).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.QfiiCallsAndPuts } } };
    headerRow.getCell(MarketInfoSheetColumn.Top10TxFrontMonthNetOi).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Top10Traders } } };
    headerRow.getCell(MarketInfoSheetColumn.Top10TxFrontMonthNetOiChange).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Top10Traders } } };
    headerRow.getCell(MarketInfoSheetColumn.Top10TxBackMonthsNetOi).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Top10Traders } } };
    headerRow.getCell(MarketInfoSheetColumn.Top10TxBackMonthsNetOiChange).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Top10Traders } } };
    headerRow.getCell(MarketInfoSheetColumn.RetailMtxNetOi).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.RetailInvestors } } };
    headerRow.getCell(MarketInfoSheetColumn.RetailMtxNetOiChange).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.RetailInvestors } } };
    headerRow.getCell(MarketInfoSheetColumn.RetailMtxLongShortRatio).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.RetailInvestors } } };
    headerRow.getCell(MarketInfoSheetColumn.PcRatio).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.PcRatio } } };
    headerRow.getCell(MarketInfoSheetColumn.UsdTwd).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.UsdTwd } } };
    headerRow.getCell(MarketInfoSheetColumn.UsdTwdChange).style = { alignment: { vertical: 'middle', horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.UsdTwd } } };

    for (let i = 0; i < data.length; i++) {
      const dataRow = worksheet.addRow([
        data[i].date,
        data[i].closePrice,
        data[i].change,
        numeral(data[i].changePercent).divide(100).value(),
        numeral(data[i].tradeValue).divide(100000000).value(),
        numeral(data[i].qfiiNetBuySell).divide(100000000).value(),
        numeral(data[i].siteNetBuySell).divide(100000000).value(),
        numeral(data[i].dealersNetBuySell).divide(100000000).value(),
        data[i].marginPurchase && numeral(data[i].marginPurchase).divide(100000).value(),
        data[i].marginPurchaseChange && numeral(data[i].marginPurchaseChange).divide(100000).value(),
        data[i].shortSale,
        data[i].shortSaleChange,
        data[i].qfiiTxNetOi,
        data[i].qfiiTxNetOiChange,
        data[i].qfiiTxoCallsNetOi,
        data[i].qfiiTxoCallsNetOiChange,
        data[i].qfiiTxoPutsNetOi,
        data[i].qfiiTxoPutsNetOiChange,
        data[i].top10TxFrontMonthNetOi,
        data[i].top10TxFrontMonthNetOiChange,
        data[i].top10TxBackMonthsNetOi,
        data[i].top10TxBackMonthsNetOiChange,
        data[i].retailMtxNetOi,
        data[i].retailMtxNetOiChange,
        data[i].retailMtxLongShortRatio,
        numeral(data[i].pcRatio).divide(100).value(),
        data[i].usdtwd,
        data[i].usdtwdChange * -1,
      ]);

      dataRow.getCell(MarketInfoSheetColumn.Date).style = { alignment: { horizontal: 'center' } };
      dataRow.getCell(MarketInfoSheetColumn.Taiex).font = { color: { argb: getFontColorByNetChange(data[i].change) } };
      dataRow.getCell(MarketInfoSheetColumn.TaiexChange).style = { font: { color: { argb: getFontColorByNetChange(data[i].change) } } };
      dataRow.getCell(MarketInfoSheetColumn.TaiexChangePercent).style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(data[i].change) } } };
      dataRow.getCell(MarketInfoSheetColumn.TaiexVolume).style = { numFmt: '#,##0.00' };
      dataRow.getCell(MarketInfoSheetColumn.QfiiNetBuySell).style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(data[i].qfiiNetBuySell) } } };
      dataRow.getCell(MarketInfoSheetColumn.SiteNetBuySell).style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(data[i].siteNetBuySell) } } };
      dataRow.getCell(MarketInfoSheetColumn.DealersNetBuySell).style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(data[i].dealersNetBuySell) } } };
      dataRow.getCell(MarketInfoSheetColumn.MarginPurchase).style = { numFmt: '#,##0.00' };
      dataRow.getCell(MarketInfoSheetColumn.MarginPurchaseChange).style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(data[i].marginPurchaseChange) } } };
      dataRow.getCell(MarketInfoSheetColumn.ShortSale).style = { numFmt: '#,##0' };
      dataRow.getCell(MarketInfoSheetColumn.ShortSaleChange).style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(data[i].shortSaleChange) } } };
      dataRow.getCell(MarketInfoSheetColumn.QfiiTxNetOi).style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(data[i].qfiiTxNetOi) } } };
      dataRow.getCell(MarketInfoSheetColumn.QfiiTxNetOiChange).style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(data[i].qfiiTxNetOiChange) } } };
      dataRow.getCell(MarketInfoSheetColumn.QfiiTxoCallsNetOi).style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(data[i].qfiiTxoCallsNetOi) } } };
      dataRow.getCell(MarketInfoSheetColumn.QfiiTxoCallsNetOiChange).style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(data[i].qfiiTxoCallsNetOiChange) } } };
      dataRow.getCell(MarketInfoSheetColumn.QfiiTxoPutsNetOi).style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(data[i].qfiiTxoPutsNetOi) } } };
      dataRow.getCell(MarketInfoSheetColumn.QfiiTxoPutsNetOiChange).style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(data[i].qfiiTxoPutsNetOiChange) } } };
      dataRow.getCell(MarketInfoSheetColumn.Top10TxFrontMonthNetOi).style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(data[i].top10TxFrontMonthNetOi) } } };
      dataRow.getCell(MarketInfoSheetColumn.Top10TxFrontMonthNetOiChange).style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(data[i].top10TxFrontMonthNetOiChange) } } };
      dataRow.getCell(MarketInfoSheetColumn.Top10TxBackMonthsNetOi).style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(data[i].top10TxBackMonthsNetOi) } } };
      dataRow.getCell(MarketInfoSheetColumn.Top10TxBackMonthsNetOiChange).style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(data[i].top10TxBackMonthsNetOiChange) } } };
      dataRow.getCell(MarketInfoSheetColumn.RetailMtxNetOi).style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(data[i].retailMtxNetOi) } } };
      dataRow.getCell(MarketInfoSheetColumn.RetailMtxNetOiChange).style = { numFmt: '#,##0', font: { color: { argb: getFontColorByNetChange(data[i].retailMtxNetOiChange) } } };
      dataRow.getCell(MarketInfoSheetColumn.RetailMtxLongShortRatio).style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(data[i].retailMtxLongShortRatio) } } };
      dataRow.getCell(MarketInfoSheetColumn.PcRatio).style = { numFmt: '#0.00%' };
      dataRow.getCell(MarketInfoSheetColumn.UsdTwd).style = { numFmt: '0.000', font: { color: { argb: getFontColorByNetChange(data[i].usdtwdChange * -1) } }  };
      dataRow.getCell(MarketInfoSheetColumn.UsdTwdChange).style = { numFmt: '0.000', font: { color: { argb: getFontColorByNetChange(data[i].usdtwdChange * -1) } }  };
      dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
      dataRow.height = 20;
    }

    return workbook;
  }

  async addTwseMoneyFlowSheet(workbook: ExcelJS.Workbook, options: ExportOptions) {
    const { date, days } = options;
    const tickersByDate = await firstValueFrom(this.client.send({ cmd: 'get_tickers_by_date' }, { date, type: TickerType.Index, exchange: Exchange.TWSE, days }));
    const data = getMoneyFlowFromTickersByDate(tickersByDate, { exchange: Exchange.TWSE });

    const worksheet = workbook.addWorksheet(`上市資金流向`);
    await this.processMoneyFlowSheet(worksheet, data);

    return workbook;
  }

  async addTpexMoneyFlowSheet(workbook: ExcelJS.Workbook, options: ExportOptions) {
    const { date, days } = options;
    const tickersByDate = await firstValueFrom(this.client.send({ cmd: 'get_tickers_by_date' }, { date, type: TickerType.Index, exchange: Exchange.TPEx, days }));
    const data = getMoneyFlowFromTickersByDate(tickersByDate, { exchange: Exchange.TPEx });

    const worksheet = workbook.addWorksheet(`上櫃資金流向`);
    await this.processMoneyFlowSheet(worksheet, data);

    return workbook;
  }

  async processMoneyFlowSheet(worksheet: ExcelJS.Worksheet, data: Record<string, Ticker[]>) {
    const exchange = data[Object.keys(data)[0]][0].exchange === Exchange.TPEx ? '上櫃' : '上市';
    const date = Object.keys(data)[0];
    const prevDate = Object.keys(data)[1];

    worksheet.columns = [
      { width: 17.5 },
      { width: 12.5 },
      { width: 12.5 },
      { width: 12.5 },
      { width: 12.5 },
      { width: 12.5 },
      { width: 12.5 },
      { width: 12.5 },
      { width: 12.5 },
      { width: 12.5 },
    ];

    const titleRow = worksheet.addRow([`${exchange}資金流向 (${date})`]);
    titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
    titleRow.height = 20;

    const headerRow = worksheet.addRow([
      '類股',
      '指數',
      '漲跌',
      '漲跌幅',
      '成交金額(億)',
      '成交比重',
      '昨日比重',
      '比重差',
      '昨日金額(億)',
      '金額差(億)',
    ]);
    headerRow.height = 20;
    headerRow.getCell(MoneyFlowSheetColumn.SectorName).style = { alignment: { horizontal: 'left' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } };
    headerRow.getCell(MoneyFlowSheetColumn.CloseIndex).style = { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } };
    headerRow.getCell(MoneyFlowSheetColumn.Change).style = { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } };
    headerRow.getCell(MoneyFlowSheetColumn.ChangePercent).style = { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } };
    headerRow.getCell(MoneyFlowSheetColumn.TradeValue).style = { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } };
    headerRow.getCell(MoneyFlowSheetColumn.TradeWeight).style = { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } };
    headerRow.getCell(MoneyFlowSheetColumn.TradeWeightPrev).style = { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } };
    headerRow.getCell(MoneyFlowSheetColumn.TradeWeightChange).style = { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } };
    headerRow.getCell(MoneyFlowSheetColumn.TradeValuePrev).style = { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } };
    headerRow.getCell(MoneyFlowSheetColumn.TradeValueChange).style = { alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: 'ffe0b2' } } };

    for (let i = 0; i < data[date].length; i++) {
      if (data[date][i].symbol === Index.NonElectronics) continue;
      if (data[date][i].symbol === Index.NonFinance) continue;
      if (data[date][i].symbol === Index.NonFinanceNonElectronics) continue;

      const tradeWeightPrev = data[prevDate].find(ticker => ticker.symbol === data[date][i].symbol).tradeWeight;
      const tradeWeightChange = data[date][i].tradeWeight - data[prevDate].find(ticker => ticker.symbol === data[date][i].symbol).tradeWeight;
      const tradeValuePrev = data[prevDate].find(ticker => ticker.symbol === data[date][i].symbol).tradeValue;
      const tradeValueChange = data[date][i].tradeValue - data[prevDate].find(ticker => ticker.symbol === data[date][i].symbol).tradeValue;

      const dataRow = worksheet.addRow([
        data[date][i].name,
        data[date][i].closePrice,
        data[date][i].change,
        numeral(data[date][i].changePercent).divide(100).value(),
        numeral(data[date][i].tradeValue).divide(100000000).value(),
        numeral(data[date][i].tradeWeight).divide(100).value(),
        numeral(tradeWeightPrev).divide(100).value(),
        !isNaN(tradeWeightChange) ? numeral(tradeWeightChange).divide(100).value() : null,
        numeral(tradeValuePrev).divide(100000000).value(),
        numeral(tradeValueChange).divide(100000000).value(),
      ]);
      dataRow.height = 20;

      dataRow.getCell(MoneyFlowSheetColumn.CloseIndex).style = { numFmt: '##0.00', font: { color: { argb: getFontColorByNetChange(data[date][i].change) } } };
      dataRow.getCell(MoneyFlowSheetColumn.Change).style = { numFmt: '##0.00', font: { color: { argb: getFontColorByNetChange(data[date][i].change) } } };
      dataRow.getCell(MoneyFlowSheetColumn.ChangePercent).style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(data[date][i].change) } } };
      dataRow.getCell(MoneyFlowSheetColumn.TradeValue).style = { numFmt: '#,##0.00' };
      dataRow.getCell(MoneyFlowSheetColumn.TradeWeight).style = { numFmt: '#0.00%' };
      dataRow.getCell(MoneyFlowSheetColumn.TradeWeightPrev).style = { numFmt: '#0.00%' };
      dataRow.getCell(MoneyFlowSheetColumn.TradeWeightChange).style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(tradeWeightChange) } } };
      dataRow.getCell(MoneyFlowSheetColumn.TradeValuePrev).style = { numFmt: '#,##0.00' };
      dataRow.getCell(MoneyFlowSheetColumn.TradeValueChange).style = { numFmt: '#,##0.00', font: { color: { argb: getFontColorByNetChange(tradeValueChange) } } };

      if (data[date][i].change > 0 && tradeWeightChange > 0 && tradeValueChange > 0) {
        dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffebee' } };
      } else if (data[date][i].change < 0 && tradeWeightChange < 0 && tradeValueChange < 0) {
        dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'e8f5e9' } };
      } else {
        dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
      }
    }
  }

  async addTwseMostActivesSheet(workbook: ExcelJS.Workbook, options: ExportOptions) {
    const { date, days } = options;

    const data = await firstValueFrom(this.client.send({ cmd: 'get_tickers_by_date' }, { date, exchange: Exchange.TWSE, type: TickerType.Equity, days: 5 }));
    const worksheet = workbook.addWorksheet(`上市成交量值排行`);
    await this.processMostActivesSheet(worksheet, data);

    return workbook;
  }

  async addTpexMostActivesSheet(workbook: ExcelJS.Workbook, options: ExportOptions) {
    const { date, days } = options;

    const data = await firstValueFrom(this.client.send({ cmd: 'get_tickers_by_date' }, { date, exchange: Exchange.TPEx, type: TickerType.Equity, days: 5 }));
    const worksheet = workbook.addWorksheet(`上櫃成交量值排行`);
    await this.processMostActivesSheet(worksheet, data);

    return workbook;
  }

  async processMostActivesSheet(worksheet: ExcelJS.Worksheet, data: Record<string, Ticker[]>) {
    const exchange = data[Object.keys(data)[0]][0].exchange === Exchange.TPEx ? '上櫃' : '上市';
    const date = Object.keys(data)[0];
    const tickers = data[date];

    const mostActivesByTradeVolume = getMostActivesFromTickers(tickers, { type:  MostActives.TradeVolume, top: 50 })
    const mostActivesByTradeValue = getMostActivesFromTickers(tickers, { type: MostActives.TradeValue, top: 50 })

    worksheet.columns = [
      { width: 10 },
      { width: 15 },
      { width: 8 },
      { width: 8 },
      { width: 8 },
      { width: 12 },
      { width: 8 },
      { width: 10 },
      { width: 15 },
      { width: 8 },
      { width: 8 },
      { width: 8 },
      { width: 12 },
    ];

    const titleRow = worksheet.addRow([`${exchange}成交量值排行 (${date})`]);
    titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
    titleRow.height = 20;

    const headerRow = worksheet.addRow(['成交量排行', '', '', '', '', '', '', '成交值排行', '', '', '', '', '']);
    const titleMostActivesByTradeVolumeCell = headerRow.getCell(1);
    const titleMostActivesByTradeValueCell = headerRow.getCell(8);
    titleMostActivesByTradeVolumeCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: ForegroundColor.Title } } };
    titleMostActivesByTradeValueCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: ForegroundColor.Title } } };
    worksheet.mergeCells(+titleMostActivesByTradeVolumeCell.row, +titleMostActivesByTradeVolumeCell.col, +titleMostActivesByTradeVolumeCell.row, +titleMostActivesByTradeVolumeCell.col + 5)
    worksheet.mergeCells(+titleMostActivesByTradeValueCell.row, +titleMostActivesByTradeValueCell.col, +titleMostActivesByTradeValueCell.row, +titleMostActivesByTradeValueCell.col + 5)
    headerRow.height = 20;

    const subheaderRow = worksheet.addRow(['代號', '股票', '股價', '漲跌', '漲跌幅', '成交量', '', '代號', '股票', '股價', '漲跌', '漲跌幅', '成交值(千元)']);
    subheaderRow.getCell(MostActivesSheetColumn.PriceOfTradeVolume).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MostActivesSheetColumn.ChangeOfTradeVolume).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MostActivesSheetColumn.ChangePercentOfTradeVolume).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MostActivesSheetColumn.VolumeOfTradeVolume).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MostActivesSheetColumn.PriceOfTradeValue).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MostActivesSheetColumn.ChangeOfTradeValue).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MostActivesSheetColumn.ChangePercentOfTradeValue).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MostActivesSheetColumn.VolumeOfTradeValue).style = { alignment: { horizontal: 'right' } };
    subheaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
    subheaderRow.height = 20;

    for (let i = 0; i < 50; i++) {
      const dataRow = worksheet.addRow([
        mostActivesByTradeVolume[i]?.symbol,
        mostActivesByTradeVolume[i]?.name,
        mostActivesByTradeVolume[i]?.closePrice,
        mostActivesByTradeVolume[i]?.change,
        numeral(mostActivesByTradeVolume[i]?.changePercent).divide(100).value(),
        numeral(mostActivesByTradeVolume[i]?.tradeVolume).divide(1000).value(),
        '',
        mostActivesByTradeValue[i]?.symbol,
        mostActivesByTradeValue[i]?.name,
        mostActivesByTradeValue[i]?.closePrice,
        mostActivesByTradeValue[i]?.change,
        numeral(mostActivesByTradeValue[i]?.changePercent).divide(100).value(),
        numeral(mostActivesByTradeValue[i]?.tradeValue).divide(1000).value(),
      ]);

      dataRow.getCell(MostActivesSheetColumn.PriceOfTradeVolume).style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(mostActivesByTradeVolume[i]?.change) } } };
      dataRow.getCell(MostActivesSheetColumn.ChangeOfTradeVolume).style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(mostActivesByTradeVolume[i]?.change) } } };
      dataRow.getCell(MostActivesSheetColumn.ChangePercentOfTradeVolume).style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(mostActivesByTradeVolume[i]?.change) } } };
      dataRow.getCell(MostActivesSheetColumn.VolumeOfTradeVolume).style = { numFmt: '#,##0' };
      dataRow.getCell(MostActivesSheetColumn.PriceOfTradeValue).style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(mostActivesByTradeValue[i]?.change) } } };
      dataRow.getCell(MostActivesSheetColumn.ChangeOfTradeValue).style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(mostActivesByTradeValue[i]?.change) } } };
      dataRow.getCell(MostActivesSheetColumn.ChangePercentOfTradeValue).style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(mostActivesByTradeValue[i]?.change) } } };
      dataRow.getCell(MostActivesSheetColumn.VolumeOfTradeValue).style = { numFmt: '#,##0' };

      if (dataRow.getCell(MostActivesSheetColumn.SymbolOfTradeVolume).value === mostActivesByTradeVolume[i]?.symbol) {
        dataRow.getCell(MostActivesSheetColumn.SymbolOfTradeVolume).value = {
          text: dataRow.getCell(MostActivesSheetColumn.SymbolOfTradeVolume).value.toString(),
          hyperlink: `https://goodinfo.tw/StockInfo/StockDetail.asp?STOCK_ID=${dataRow.getCell(MostActivesSheetColumn.SymbolOfTradeVolume).value}`,
        };
      }
      if (dataRow.getCell(MostActivesSheetColumn.SymbolOfTradeValue).value === mostActivesByTradeValue[i]?.symbol) {
        dataRow.getCell(MostActivesSheetColumn.SymbolOfTradeValue).value = {
          text: dataRow.getCell(MostActivesSheetColumn.SymbolOfTradeValue).value.toString(),
          hyperlink: `https://goodinfo.tw/StockInfo/StockDetail.asp?STOCK_ID=${dataRow.getCell(MostActivesSheetColumn.SymbolOfTradeValue).value}`,
        };
      }

      dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
      dataRow.height = 20;
    }
  }

  async addTwseMoversSheet(workbook: ExcelJS.Workbook, options: ExportOptions) {
    const { date, days } = options;

    const data = await firstValueFrom(this.client.send({ cmd: 'get_tickers_by_date' }, { date, exchange: Exchange.TWSE, type: TickerType.Equity, days: 5 }));
    const worksheet = workbook.addWorksheet(`上市漲跌幅排行`);
    await this.processMoversSheet(worksheet, data);

    return workbook;
  }

  async addTpexMoversSheet(workbook: ExcelJS.Workbook, options: ExportOptions) {
    const { date, days } = options;

    const data = await firstValueFrom(this.client.send({ cmd: 'get_tickers_by_date' }, { date, exchange: Exchange.TPEx, type: TickerType.Equity, days: 5 }));
    const worksheet = workbook.addWorksheet(`上櫃漲跌幅排行`);
    await this.processMoversSheet(worksheet, data);

    return workbook;
  }

  async processMoversSheet(worksheet: ExcelJS.Worksheet, data: Record<string, Ticker[]>) {
    const exchange = data[Object.keys(data)[0]][0].exchange === Exchange.TPEx ? '上櫃' : '上市';
    const date = Object.keys(data)[0];
    const tickers = data[date];

    const gainers = getMoversFromTickers(tickers, { type:  Movers.Gainers, top: 50 })
    const losers = getMoversFromTickers(tickers, { type: Movers.Losers, top: 50 })

    worksheet.columns = [
      { width: 10 },
      { width: 15 },
      { width: 8 },
      { width: 8 },
      { width: 8 },
      { width: 12 },
      { width: 8 },
      { width: 10 },
      { width: 15 },
      { width: 8 },
      { width: 8 },
      { width: 8 },
      { width: 12 },
    ];

    const titleRow = worksheet.addRow([`${exchange}漲跌幅排行 (${date})`]);
    titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
    titleRow.height = 20;

    const headerRow = worksheet.addRow(['漲幅排行', '', '', '', '', '', '', '跌幅排行', '', '', '', '', '']);
    const titleGainersCell = headerRow.getCell(1);
    const titleLosersCell = headerRow.getCell(8);
    titleGainersCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: ForegroundColor.Title } } };
    titleLosersCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: ForegroundColor.Title } } };
    worksheet.mergeCells(+titleGainersCell.row, +titleGainersCell.col, +titleGainersCell.row, +titleGainersCell.col + 5)
    worksheet.mergeCells(+titleLosersCell.row, +titleLosersCell.col, +titleLosersCell.row, +titleLosersCell.col + 5)
    headerRow.height = 20;

    const subheaderRow = worksheet.addRow(['代號', '股票', '股價', '漲跌', '漲跌幅', '成交量', '', '代號', '股票', '股價', '漲跌', '漲跌幅', '成交量']);
    subheaderRow.getCell(MoversSheetColumn.PriceOfGainers).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MoversSheetColumn.ChangeOfGainers).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MoversSheetColumn.ChangePercentOfGainers).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MoversSheetColumn.VolumeOfGainers).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MoversSheetColumn.PriceOfLosers).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MoversSheetColumn.ChangeOfLosers).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MoversSheetColumn.ChangePercentOfLosers).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(MoversSheetColumn.VolumeOfLosers).style = { alignment: { horizontal: 'right' } };
    subheaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
    subheaderRow.height = 20;

    for (let i = 0; i < 50; i++) {
      const dataRow = worksheet.addRow([
        gainers[i]?.symbol,
        gainers[i]?.name,
        gainers[i]?.closePrice,
        gainers[i]?.change,
        numeral(gainers[i]?.changePercent).divide(100).value(),
        numeral(gainers[i]?.tradeVolume).divide(1000).value(),
        '',
        losers[i]?.symbol,
        losers[i]?.name,
        losers[i]?.closePrice,
        losers[i]?.change,
        numeral(losers[i]?.changePercent).divide(100).value(),
        numeral(losers[i]?.tradeVolume).divide(1000).value(),
      ]);

      dataRow.getCell(MoversSheetColumn.PriceOfGainers).style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(gainers[i]?.change) } } };
      dataRow.getCell(MoversSheetColumn.ChangeOfGainers).style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(gainers[i]?.change) } } };
      dataRow.getCell(MoversSheetColumn.ChangePercentOfGainers).style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(gainers[i]?.change) } } };
      dataRow.getCell(MoversSheetColumn.VolumeOfGainers).style = { numFmt: '#,##0' };
      dataRow.getCell(MoversSheetColumn.PriceOfLosers).style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(losers[i]?.change) } } };
      dataRow.getCell(MoversSheetColumn.ChangeOfLosers).style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(losers[i]?.change) } } };
      dataRow.getCell(MoversSheetColumn.ChangePercentOfLosers).style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(losers[i]?.change) } } };
      dataRow.getCell(MoversSheetColumn.VolumeOfLosers).style = { numFmt: '#,##0' };

      if (dataRow.getCell(MoversSheetColumn.SymbolOfGainers).value === gainers[i]?.symbol) {
        dataRow.getCell(MoversSheetColumn.SymbolOfGainers).value = {
          text: dataRow.getCell(MoversSheetColumn.SymbolOfGainers).value.toString(),
          hyperlink: `https://goodinfo.tw/StockInfo/StockDetail.asp?STOCK_ID=${dataRow.getCell(MoversSheetColumn.SymbolOfGainers).value}`,
        };
      }
      if (dataRow.getCell(MoversSheetColumn.SymbolOfLosers).value === losers[i]?.symbol) {
        dataRow.getCell(MoversSheetColumn.SymbolOfLosers).value = {
          text: dataRow.getCell(MoversSheetColumn.SymbolOfLosers).value.toString(),
          hyperlink: `https://goodinfo.tw/StockInfo/StockDetail.asp?STOCK_ID=${dataRow.getCell(MoversSheetColumn.SymbolOfLosers).value}`,
        };
      }

      dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
      dataRow.height = 20;
    }
  }

  async addTwseInstiNetBuySellSheet(workbook: ExcelJS.Workbook, options: ExportOptions) {
    const { date, days } = options;

    const data = await firstValueFrom(this.client.send({ cmd: 'get_tickers_by_date' }, { date, exchange: Exchange.TWSE, type: TickerType.Equity, days: 5 }));
    const worksheet = workbook.addWorksheet(`上市外資投信買賣超排行`);
    await this.processInstiNetBuySellSheet(worksheet, data);

    return workbook;
  }

  async addTpexInstiNetBuySellSheet(workbook: ExcelJS.Workbook, options: ExportOptions) {
    const { date, days } = options;

    const data = await firstValueFrom(this.client.send({ cmd: 'get_tickers_by_date' }, { date, exchange: Exchange.TPEx, type: TickerType.Equity, days: 5 }));
    const worksheet = workbook.addWorksheet(`上櫃外資投信買賣超排行`);
    await this.processInstiNetBuySellSheet(worksheet, data);

    return workbook;
  }

  async processInstiNetBuySellSheet(worksheet: ExcelJS.Worksheet, data: Record<string, Ticker[]>) {
    const exchange = data[Object.keys(data)[0]][0].exchange === Exchange.TPEx ? '上櫃' : '上市';
    const date = Object.keys(data)[0];
    const tickers = data[date];

    const qfiiNetBuyList = getNetBuySellListFromTickers(tickers, { type:  NetBuySellList.QfiiNetBuy, top: 50 })
    const qfiiNetSellList = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.QfiiNetSell, top: 50 })
    const siteNetBuyList = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.SiteNetBuy, top: 50 })
    const siteNetSellList = getNetBuySellListFromTickers(tickers, { type: NetBuySellList.SiteNetSell, top: 50 })

    worksheet.columns = [
      { width: 10 },
      { width: 15 },
      { width: 10 },
      { width: 8 },
      { width: 8 },
      { width: 8 },
      { width: 10 },
      { width: 15 },
      { width: 10 },
      { width: 8 },
      { width: 8 },
      { width: 8 },
      { width: 10 },
      { width: 15 },
      { width: 10 },
      { width: 8 },
      { width: 8 },
      { width: 8 },
      { width: 10 },
      { width: 15 },
      { width: 10 },
      { width: 8 },
      { width: 8 },
    ];

    const titleRow = worksheet.addRow([`${exchange}外資投信買賣超排行 (${date})`]);
    titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };

    const headerRow = worksheet.addRow(['外資買超', '', '', '', '', '', '外資賣超', '', '', '', '', '', '投信買超', '', '', '', '', '', '投信賣超', '', '', '', '']);
    const titleqfiiNetBuyCell = headerRow.getCell(1);
    const titleqfiiNetSellCell = headerRow.getCell(7);
    const titleSticNetCell = headerRow.getCell(13);
    const titlesiteNetSellCell = headerRow.getCell(19);
    titleqfiiNetBuyCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Title } } };
    titleqfiiNetSellCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Title } } };
    titleSticNetCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Title } } };
    titlesiteNetSellCell.style = { alignment: { horizontal: 'center' }, fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Title } } };
    worksheet.mergeCells(+titleqfiiNetBuyCell.row, +titleqfiiNetBuyCell.col, +titleqfiiNetBuyCell.row, +titleqfiiNetBuyCell.col + 4)
    worksheet.mergeCells(+titleqfiiNetSellCell.row, +titleqfiiNetSellCell.col, +titleqfiiNetSellCell.row, +titleqfiiNetSellCell.col + 4)
    worksheet.mergeCells(+titleSticNetCell.row, +titleSticNetCell.col, +titleSticNetCell.row, +titleSticNetCell.col + 4)
    worksheet.mergeCells(+titlesiteNetSellCell.row, +titlesiteNetSellCell.col, +titlesiteNetSellCell.row, +titlesiteNetSellCell.col + 4)

    const subheaderRow = worksheet.addRow(['代號', '股票', '張數', '股價', '漲跌幅', '', '代號', '股票', '張數', '股價', '漲跌幅', '', '代號', '股票', '張數', '股價', '漲跌幅', '', '代號', '股票', '張數', '股價', '漲跌幅',]);
    subheaderRow.getCell(NetBuySellSheetColumn.VolumeOfQfiiNetBuy).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(NetBuySellSheetColumn.PriceOfQfiiNetBuy).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(NetBuySellSheetColumn.ChangePercentOfQfiiNetBuy).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(NetBuySellSheetColumn.VolumeOfQfiiNetSell).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(NetBuySellSheetColumn.PriceOfQfiiNetSell).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(NetBuySellSheetColumn.ChangePercentOfQfiiNetSell).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(NetBuySellSheetColumn.VolumeOfSiteNetBuy).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(NetBuySellSheetColumn.PriceOfSiteNetBuy).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(NetBuySellSheetColumn.ChangePercentOfSiteNetBuy).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(NetBuySellSheetColumn.VolumeOfSiteNetSell).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(NetBuySellSheetColumn.PriceOfSiteNetSell).style = { alignment: { horizontal: 'right' } };
    subheaderRow.getCell(NetBuySellSheetColumn.ChangePercentOfSiteNetSell).style = { alignment: { horizontal: 'right' } };
    subheaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };

    for (let i = 0; i < 50; i++) {
      const dataRow = worksheet.addRow([
        qfiiNetBuyList[i]?.symbol,
        qfiiNetBuyList[i]?.name,
        qfiiNetBuyList[i]?.qfiiNetBuySell,
        qfiiNetBuyList[i]?.closePrice,
        qfiiNetBuyList[i]?.changePercent && numeral(qfiiNetBuyList[i]?.changePercent).divide(100).value(),
        '',
        qfiiNetSellList[i]?.symbol,
        qfiiNetSellList[i]?.name,
        qfiiNetSellList[i]?.qfiiNetBuySell,
        qfiiNetSellList[i]?.closePrice,
        qfiiNetSellList[i]?.changePercent && numeral(qfiiNetSellList[i]?.changePercent).divide(100).value(),
        '',
        siteNetBuyList[i]?.symbol,
        siteNetBuyList[i]?.name,
        siteNetBuyList[i]?.siteNetBuySell,
        siteNetBuyList[i]?.closePrice,
        siteNetBuyList[i]?.changePercent && numeral(siteNetBuyList[i]?.changePercent).divide(100).value(),
        '',
        siteNetSellList[i]?.symbol,
        siteNetSellList[i]?.name,
        siteNetSellList[i]?.siteNetBuySell,
        siteNetSellList[i]?.closePrice,
        siteNetSellList[i]?.changePercent && numeral(siteNetSellList[i]?.changePercent).divide(100).value(),
      ]);
      dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };

      const symbolStatusOfqfiiNetBuy = getSymbolStatus(qfiiNetBuyList[i]?.symbol, data);
      const symbolStatusOfqfiiNetSell = getSymbolStatus(qfiiNetSellList[i]?.symbol, data);
      const symbolStatusOfsiteNetBuy = getSymbolStatus(siteNetBuyList[i]?.symbol, data);
      const symbolStatusOfsiteNetSell = getSymbolStatus(siteNetSellList[i]?.symbol, data);

      dataRow.getCell(NetBuySellSheetColumn.SymbolOfQfiiNetBuy).style = { fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: getForegroundColorBySymbolStatus(symbolStatusOfqfiiNetBuy, { column: NetBuySellSheetColumn.SymbolOfQfiiNetBuy }) }} };
      dataRow.getCell(NetBuySellSheetColumn.NameOfQfiiNetBuy).style = { fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: getForegroundColorBySymbolStatus(symbolStatusOfqfiiNetBuy, { column: NetBuySellSheetColumn.NameOfQfiiNetBuy }) }} };
      dataRow.getCell(NetBuySellSheetColumn.VolumeOfQfiiNetBuy).style = { numFmt: '#,##0', fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } } };
      dataRow.getCell(NetBuySellSheetColumn.PriceOfQfiiNetBuy).style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(qfiiNetBuyList[i]?.change) } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } } };
      dataRow.getCell(NetBuySellSheetColumn.ChangePercentOfQfiiNetBuy).style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(qfiiNetBuyList[i]?.change) } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } } };

      dataRow.getCell(NetBuySellSheetColumn.SymbolOfQfiiNetSell).style = { fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: getForegroundColorBySymbolStatus(symbolStatusOfqfiiNetSell, { column: NetBuySellSheetColumn.SymbolOfQfiiNetSell }) }} };
      dataRow.getCell(NetBuySellSheetColumn.NameOfQfiiNetSell).style = { fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: getForegroundColorBySymbolStatus(symbolStatusOfqfiiNetSell, { column: NetBuySellSheetColumn.NameOfQfiiNetSell }) }} };
      dataRow.getCell(NetBuySellSheetColumn.VolumeOfQfiiNetSell).style = { numFmt: '#,##0', fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } } };
      dataRow.getCell(NetBuySellSheetColumn.PriceOfQfiiNetSell).style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(qfiiNetSellList[i]?.change) } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } } };
      dataRow.getCell(NetBuySellSheetColumn.ChangePercentOfQfiiNetSell).style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(qfiiNetSellList[i]?.change) } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } } };

      dataRow.getCell(NetBuySellSheetColumn.SymbolOfSiteNetBuy).style = { fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: getForegroundColorBySymbolStatus(symbolStatusOfsiteNetBuy, { column: NetBuySellSheetColumn.SymbolOfSiteNetBuy }) }} };
      dataRow.getCell(NetBuySellSheetColumn.NameOfSiteNetBuy).style = { fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: getForegroundColorBySymbolStatus(symbolStatusOfsiteNetBuy, { column: NetBuySellSheetColumn.NameOfSiteNetBuy }) }} };
      dataRow.getCell(NetBuySellSheetColumn.VolumeOfSiteNetBuy).style = { numFmt: '#,##0', fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } } };
      dataRow.getCell(NetBuySellSheetColumn.PriceOfSiteNetBuy).style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(siteNetBuyList[i]?.change) } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } } };
      dataRow.getCell(NetBuySellSheetColumn.ChangePercentOfSiteNetBuy).style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(siteNetBuyList[i]?.change) } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } } };

      dataRow.getCell(NetBuySellSheetColumn.SymbolOfSiteNetSell).style = { fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: getForegroundColorBySymbolStatus(symbolStatusOfsiteNetSell, { column: NetBuySellSheetColumn.SymbolOfSiteNetSell }) }} };
      dataRow.getCell(NetBuySellSheetColumn.NameOfSiteNetSell).style = { fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb: getForegroundColorBySymbolStatus(symbolStatusOfsiteNetSell, { column: NetBuySellSheetColumn.NameOfSiteNetSell }) }} };
      dataRow.getCell(NetBuySellSheetColumn.VolumeOfSiteNetSell).style = { numFmt: '#,##0', fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } } };
      dataRow.getCell(NetBuySellSheetColumn.PriceOfSiteNetSell).style = { numFmt: '#0.00', font: { color: { argb: getFontColorByNetChange(siteNetSellList[i]?.change) } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } } };
      dataRow.getCell(NetBuySellSheetColumn.ChangePercentOfSiteNetSell).style = { numFmt: '#0.00%', font: { color: { argb: getFontColorByNetChange(siteNetSellList[i]?.change) } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } } };

      if (dataRow.getCell(NetBuySellSheetColumn.SymbolOfQfiiNetBuy).value) dataRow.getCell(NetBuySellSheetColumn.SymbolOfQfiiNetBuy).value = {
        text: dataRow.getCell(NetBuySellSheetColumn.SymbolOfQfiiNetBuy).value.toString(),
        hyperlink: `https://goodinfo.tw/StockInfo/StockDetail.asp?STOCK_ID=${dataRow.getCell(NetBuySellSheetColumn.SymbolOfQfiiNetBuy).value}`,
      };
      if (dataRow.getCell(NetBuySellSheetColumn.SymbolOfQfiiNetSell).value) dataRow.getCell(NetBuySellSheetColumn.SymbolOfQfiiNetSell).value = {
        text: dataRow.getCell(NetBuySellSheetColumn.SymbolOfQfiiNetSell).value.toString(),
        hyperlink: `https://goodinfo.tw/StockInfo/StockDetail.asp?STOCK_ID=${dataRow.getCell(NetBuySellSheetColumn.SymbolOfQfiiNetSell).value}`,
      };
      if (dataRow.getCell(NetBuySellSheetColumn.SymbolOfSiteNetBuy).value) dataRow.getCell(NetBuySellSheetColumn.SymbolOfSiteNetBuy).value = {
        text: dataRow.getCell(NetBuySellSheetColumn.SymbolOfSiteNetBuy).value.toString(),
        hyperlink: `https://goodinfo.tw/StockInfo/StockDetail.asp?STOCK_ID=${dataRow.getCell(NetBuySellSheetColumn.SymbolOfSiteNetBuy).value}`,
      };
      if (dataRow.getCell(NetBuySellSheetColumn.SymbolOfSiteNetSell).value) dataRow.getCell(NetBuySellSheetColumn.SymbolOfSiteNetSell).value = {
        text: dataRow.getCell(NetBuySellSheetColumn.SymbolOfSiteNetSell).value.toString(),
        hyperlink: `https://goodinfo.tw/StockInfo/StockDetail.asp?STOCK_ID=${dataRow.getCell(NetBuySellSheetColumn.SymbolOfSiteNetSell).value}`,
      };
    }

    worksheet.addRow(['']).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
    worksheet.addRow(['']).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };

    const isSynchronousRow = worksheet.addRow(['外資投信同步買超或賣超']);
    isSynchronousRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
    const isSynchronousCell = isSynchronousRow.getCell(1);
    isSynchronousCell.fill = { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Synchronous } };

    const isContrarianRow = worksheet.addRow(['外資投信買賣方向不同步']);
    isContrarianRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
    const isContrarianCell = isContrarianRow.getCell(1);
    isContrarianCell.fill = { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Contrarian } };

    const isContinuousRow = worksheet.addRow(['外資投信連續買超或賣超']);
    isContinuousRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
    const isContinuousCell = isContinuousRow.getCell(1);
    isContinuousCell.fill = { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Continuous } };

    const isNoticeRow = worksheet.addRow(['最近五個交易日首次進榜']);
    isNoticeRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'ffffff' } };
    const isNoticeCell = isNoticeRow.getCell(1);
    isNoticeCell.fill = { type: 'pattern', pattern: 'solid', fgColor:{ argb: ForegroundColor.Notice } };

    worksheet.mergeCells(+isSynchronousCell.row, +isSynchronousCell.col, +isSynchronousCell.row, +isSynchronousCell.col + 1);
    worksheet.mergeCells(+isContrarianCell.row, +isContrarianCell.col, +isContrarianCell.row, +isContrarianCell.col + 1);
    worksheet.mergeCells(+isContinuousCell.row, +isContinuousCell.col, +isContinuousCell.row, +isContinuousCell.col + 1);
    worksheet.mergeCells(+isNoticeCell.row, +isNoticeCell.col, +isNoticeCell.row, +isNoticeCell.col + 1);

    worksheet.eachRow((row) => row.height = 20);
  }
}
