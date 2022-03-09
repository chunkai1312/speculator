import { UpdateMarketChipsDto } from '../../dto/update-market-chips.dto';

export class MarketChipsUpdatedEvent {
  constructor(public readonly dto: UpdateMarketChipsDto) {}
}
