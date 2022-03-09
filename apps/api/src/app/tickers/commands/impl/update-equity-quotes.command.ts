import { UpdateEquityQuotesDto } from '../../dto/update-equity-quotes.dto';

export class UpdateEquityQuotesCommand {
  constructor(public readonly cmd: UpdateEquityQuotesDto) {}
}
