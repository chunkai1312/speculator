import { GetMarketInfoHandler } from './get-market-info.handler';
import { GetSectorInfoHandler } from './get-sector-info.handler';
import { GetTickersByDateHandler } from './get-tickers-by-date.handler';
import { GetLastTradeDatesByDateHandler } from './get-last-trade-dates-by-date.handler';

export const QueryHandlers = [
  GetMarketInfoHandler,
  GetSectorInfoHandler,
  GetTickersByDateHandler,
  GetLastTradeDatesByDateHandler,
];
