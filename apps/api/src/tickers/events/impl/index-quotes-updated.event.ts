import { UpdateIndexQuotesDto } from '../../dto/update-index-quotes.dto';

export class IndexQuotesUpdatedEvent {
  constructor(public readonly dto: UpdateIndexQuotesDto) {}
}
