import { TickerType, Exchange } from '@speculator/common';

export class GetTickersFilterDto {
  readonly date?: string;
  readonly exchange?: Exchange;
  readonly type?: TickerType;
  readonly days?: number;
}
