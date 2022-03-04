export interface TwseTradingValueResponse {
  stat: string;
  date: string;
  title: string;
  fields: string[];
  data: Array<string[]>;
  params: any;
  notes: string[];
}
