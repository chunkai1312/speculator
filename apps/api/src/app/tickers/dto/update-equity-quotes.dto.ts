import { Exchange } from '@speculator/common';

export class UpdateEquityQuotesDto {
  readonly date: string;
  readonly exchange: Exchange;
}
