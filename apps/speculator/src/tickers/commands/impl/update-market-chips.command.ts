import { UpdateMarketChipsDto } from '../../dto/update-market-chips.dto';

export class UpdateMarketChipsCommand {
  constructor(public readonly cmd: UpdateMarketChipsDto) {}
}
