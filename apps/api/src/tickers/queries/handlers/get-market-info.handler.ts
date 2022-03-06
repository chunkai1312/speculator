import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMarketInfoQuery } from '../impl/get-market-info.query';
import { TickerRepository } from '../../repositories/ticker.repository';

@QueryHandler(GetMarketInfoQuery)
export class GetMarketInfoHandler implements IQueryHandler<GetMarketInfoQuery> {
  constructor(private readonly tickerRepository: TickerRepository) {}

  async execute(query: GetMarketInfoQuery) {
    const { getMarketInfoFilter } = query;

    return this.tickerRepository.getMarketInfo(getMarketInfoFilter);
  }
}
