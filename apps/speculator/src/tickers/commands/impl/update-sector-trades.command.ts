import { UpdateSectorTradesDto } from '../../dto/update-sector-trades.dto';

export class UpdateSectorTradesCommand {
  constructor(public readonly cmd: UpdateSectorTradesDto) {}
}
