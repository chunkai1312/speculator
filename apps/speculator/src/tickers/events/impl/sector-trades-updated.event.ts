import { UpdateSectorTradesDto } from '../../dto/update-sector-trades.dto';

export class SectorTradesUpdatedEvent {
  constructor(public readonly dto: UpdateSectorTradesDto) {}
}
