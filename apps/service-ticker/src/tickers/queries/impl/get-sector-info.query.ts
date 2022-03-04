import { GetSectorInfoFilter } from '../../dto/get-sector-info-filter.dto';

export class GetSectorInfoQuery {
  constructor(public readonly getSectorInfoFilter: GetSectorInfoFilter) {}
}
