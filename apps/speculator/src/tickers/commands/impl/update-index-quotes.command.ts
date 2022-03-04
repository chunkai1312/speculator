import { UpdateIndexQuotesDto } from '../../dto/update-index-quotes.dto';

export class UpdateIndexQuotesCommand {
  constructor(public readonly cmd: UpdateIndexQuotesDto) {}
}
