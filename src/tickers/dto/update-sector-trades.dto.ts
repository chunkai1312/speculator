import { Exchange } from '../enums';

export class UpdateSectorTradesDto {
  readonly date: string;
  readonly exchange: Exchange;
}
