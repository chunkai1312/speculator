import { Chips } from './chips.interface';

export interface TickerNetBuySell {
  date: string;
  exchange: string;
  type: string;
  symbol: string;
  name?: string;
  price?: number;
  volume?: number;
  change?: number;
  changePercent?: number;
  netBuySell?: number;
}
