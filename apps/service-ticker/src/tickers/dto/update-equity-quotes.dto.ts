import { Exchange } from '../enums';

export class UpdateEquityQuotesDto {
  readonly date: string;
  readonly exchange: Exchange;
}
