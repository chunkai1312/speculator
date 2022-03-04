export interface TwseTradingDetailsResponse {
  stat: string;
  date: string;
  title: string;
  fields: string[];
  data: Array<string[]>;
  selectType?: string;
  groups?: any[];
  notes?: string[];
}
