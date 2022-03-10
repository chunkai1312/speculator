import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSectorInfoQuery } from '../impl/get-sector-info.query';
import { TickerRepository } from '../../repositories/ticker.repository';

@QueryHandler(GetSectorInfoQuery)
export class GetSectorInfoHandler implements IQueryHandler<GetSectorInfoQuery> {
  constructor(private readonly tickerRepository: TickerRepository) {}

  async execute(query: GetSectorInfoQuery) {
    const { getSectorInfoFilter } = query;
    return this.tickerRepository.getSectorInfo(getSectorInfoFilter);
  }
}
