import { Exchange } from '@speculator/common';

export class UpdateIndexQuotesDto {
  readonly date: string;
  readonly exchange: Exchange;
}
