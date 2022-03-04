import { UpdateMarketTradesDto } from '../../dto/update-market-trades.dto';

export class UpdateMarketTradesCommand {
  constructor(public readonly cmd: UpdateMarketTradesDto) {}
}
