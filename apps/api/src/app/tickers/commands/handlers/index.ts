import { UpdateMarketChipsHandler } from './update-market-chips.handler';
import { UpdateEquityChipsHandler } from './update-equity-chips.handler';
import { UpdateEquityQuotesHandler } from './update-equity-quotes.handler';
import { UpdateEquitySharesHandler } from './update-equity-shares.handler';
import { UpdateIndexQuotesHandler } from './update-index-quotes.handler';
import { UpdateMarketTradesHandler } from './update-market-trades.handler';
import { UpdateSectorTradesHandler } from './update-sector-trades.handler';

export const CommandHandlers = [
  UpdateMarketChipsHandler,
  UpdateEquityChipsHandler,
  UpdateEquityQuotesHandler,
  UpdateEquitySharesHandler,
  UpdateIndexQuotesHandler,
  UpdateMarketTradesHandler,
  UpdateSectorTradesHandler,
];
