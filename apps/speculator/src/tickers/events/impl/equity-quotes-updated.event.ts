import { UpdateEquityQuotesDto } from '../../dto/update-equity-quotes.dto';

export class EquityQuotesUpdatedEvent {
  constructor(public readonly dto: UpdateEquityQuotesDto) {}
}
