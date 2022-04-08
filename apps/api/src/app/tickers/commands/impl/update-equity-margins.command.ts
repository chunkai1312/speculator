import { UpdateEquityMarginsDto } from '../../dto/update-equity-margins.dto';

export class UpdateEquityMarginsCommand {
  constructor(public readonly cmd: UpdateEquityMarginsDto) {}
}
