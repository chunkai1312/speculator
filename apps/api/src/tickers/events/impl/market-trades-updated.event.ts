import { UpdateMarketTradesDto } from '../../dto/update-market-trades.dto';

export class MarketTradesUpdatedEvent {
  constructor(public readonly dto: UpdateMarketTradesDto) {}
}
