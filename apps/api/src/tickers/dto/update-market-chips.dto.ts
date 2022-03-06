import { MarketChip } from '../enums';

export class UpdateMarketChipsDto {
  readonly date: string;
  readonly type: MarketChip;
}
