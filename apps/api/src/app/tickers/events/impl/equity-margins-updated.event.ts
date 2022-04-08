import { UpdateEquityMarginsDto } from '../../dto/update-equity-margins.dto';

export class EquityMarginsUpdatedEvent {
  constructor(public readonly dto: UpdateEquityMarginsDto) {}
}
