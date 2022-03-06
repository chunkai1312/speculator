import { GetTickersFilterDto } from '../../dto/get-tickers-filter.dto';

export class GetLastTradeDatesByDateQuery {
  constructor(public readonly filterDto: GetTickersFilterDto) {}
}
