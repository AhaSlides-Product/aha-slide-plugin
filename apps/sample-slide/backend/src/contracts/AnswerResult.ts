export interface CountTotalItem {
  bucket: string;
  key: string;
  increase_by: number;
}

export type CountTotal = CountTotalItem[];

export interface AnswerResult {
  presentation: number;
  slide: number;
  version: number;
  count_total: CountTotal;
  point: number;
  audience: string;
  audienceName: string;
  audienceEmoji?: string;
  correct: boolean;
  data: string;
}
