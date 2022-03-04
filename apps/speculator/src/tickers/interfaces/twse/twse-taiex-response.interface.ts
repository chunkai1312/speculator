export interface TwseTaiexResponse {
  stat: string;
  date: string;
  title: string;
  fields: string[];
  data: Array<string[]>;
  notes: string[];
}
