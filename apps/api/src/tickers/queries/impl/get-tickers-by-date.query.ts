import { GetTickersFilterDto } from '../../dto/get-tickers-filter.dto';

export class GetTickersByDateQuery {
  constructor(public readonly filter: GetTickersFilterDto) {}
}
