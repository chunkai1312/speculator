import { Exchange } from '../enums';

export class UpdateMarketTradesDto {
  readonly date: string;
  readonly exchange: Exchange;
}
