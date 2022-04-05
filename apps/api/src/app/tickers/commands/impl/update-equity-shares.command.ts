import { UpdateEquitySharesDto } from '../../dto/update-equity-shares.dto';

export class UpdateEquitySharesCommand {
  constructor(public readonly cmd: UpdateEquitySharesDto) {}
}
