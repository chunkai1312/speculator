import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLastTradeDatesByDateQuery } from '../impl/get-last-trade-dates-by-date.query';
import { TickerRepository } from '../../repositories/ticker.repository';

@QueryHandler(GetLastTradeDatesByDateQuery)
export class GetLastTradeDatesByDateHandler implements IQueryHandler<GetLastTradeDatesByDateQuery> {
  constructor(private readonly tickerRepository: TickerRepository) {}

  async execute(query: GetLastTradeDatesByDateQuery) {
    const { filterDto } = query;
    return this.tickerRepository.getLastTradingDaysByDate(filterDto);
  }
}
