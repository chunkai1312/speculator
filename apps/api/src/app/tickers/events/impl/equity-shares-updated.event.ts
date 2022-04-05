import { UpdateEquitySharesDto } from '../../dto/update-equity-shares.dto';

export class EquitySharesUpdatedEvent {
  constructor(public readonly dto: UpdateEquitySharesDto) {}
}
