import { MarketChip } from '@speculator/common';

export class UpdateMarketChipsDto {
  readonly date: string;
  readonly type: MarketChip;
}
