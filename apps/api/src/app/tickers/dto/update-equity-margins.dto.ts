import { Exchange } from '@speculator/common';

export class UpdateEquityMarginsDto {
  readonly date: string;
  readonly exchange: Exchange;
}
