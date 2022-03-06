import { Exchange, TickerType } from '../enums';

export class GetTickersFilterDto {
  readonly date?: string;
  readonly exchange?: Exchange;
  readonly type?: TickerType;
  readonly days?: number;
}
