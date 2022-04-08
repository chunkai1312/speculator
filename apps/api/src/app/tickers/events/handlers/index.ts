import { MarketChipsUpdatedHandler } from './market-chips-updated.handler';
import { SectorChipsUpdatedHandler } from './sector-chips-updated.handler';
import { EquityChipsUpdatedHandler } from './equity-chips-updated.handler';
import { EquityQuotesUpdatedHandler } from './equity-quotes-updated.handler';
import { EquityMarginsUpdatedHandler } from './equity-margins-updated.handler';
import { EquitySharesUpdatedHandler } from './equity-shares-updated.handler';
import { IndexQuotesUpdatedHandler } from './index-quotes-updated.handler';
import { MarketTradesUpdatedHandler } from './market-trades-updated.handler';
import { SectorTradesUpdatedHandler } from './sector-trades-updated.handler';

export const EventHandlers = [
  MarketChipsUpdatedHandler,
  SectorChipsUpdatedHandler,
  EquityChipsUpdatedHandler,
  EquityQuotesUpdatedHandler,
  EquityMarginsUpdatedHandler,
  EquitySharesUpdatedHandler,
  IndexQuotesUpdatedHandler,
  MarketTradesUpdatedHandler,
  SectorTradesUpdatedHandler,
];
