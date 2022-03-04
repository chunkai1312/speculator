import { Exchange } from '../enums';

export class UpdateIndexQuotesDto {
  readonly date: string;
  readonly exchange: Exchange;
}
