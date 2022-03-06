import { Exchange } from '../enums';

export class UpdateEquityChipsDto {
  readonly date: string;
  readonly exchange: Exchange;
}
