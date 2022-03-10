import { Exchange } from '@speculator/common';

export class UpdateMarketTradesDto {
  readonly date: string;
  readonly exchange: Exchange;
}
