import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTickersByDateQuery } from '../impl/get-tickers-by-date.query';
import { TickerRepository } from '../../repositories/ticker.repository';

@QueryHandler(GetTickersByDateQuery)
export class GetTickersByDateHandler implements IQueryHandler<GetTickersByDateQuery> {
  constructor(private readonly tickerRepository: TickerRepository) {}

  async execute(query: GetTickersByDateQuery) {
    const { filter } = query;
    return this.tickerRepository.getTickersByDate(filter);
  }
}
