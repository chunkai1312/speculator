import { Exchange } from '@speculator/common';

export class GetSectorInfoFilter {
  readonly exchange: Exchange;
  readonly date?: string;
  readonly days?: number;
}
