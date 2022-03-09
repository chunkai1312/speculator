import { UpdateEquityChipsDto } from '../../dto/update-equity-chips.dto';

export class UpdateEquityChipsCommand {
  constructor(public readonly cmd: UpdateEquityChipsDto) {}
}
