import { Exchange } from '../enums';

export class GetSectorInfoFilter {
  readonly exchange: Exchange;
  readonly date?: string;
  readonly days?: number;
}
