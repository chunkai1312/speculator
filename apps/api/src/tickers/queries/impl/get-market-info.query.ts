import { GetMarketInfoFilter } from '../../dto/get-market-info-filter.dto';

export class GetMarketInfoQuery {
  constructor(public readonly getMarketInfoFilter: GetMarketInfoFilter) {}
}
