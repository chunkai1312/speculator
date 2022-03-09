import { UpdateEquityChipsDto } from '../../dto/update-equity-chips.dto';

export class EquityChipsUpdatedEvent {
  constructor(public readonly dto: UpdateEquityChipsDto) {}
}
