export interface FundItem {
  fundcode: string;
  name: string;
  jzrq: string;
  dwjz: number | null;
  gsz: number | null;
  gszzl: number;
  gztime: string;
  num: number;
  cost: number;
  amount: number;
  gains: number;
  costGains: number;
  costGainsRate: number;
  hasReplace?: boolean;
}

export interface IndexItem {
  f2: number;
  f3: number;
  f4: number;
  f12: string;
  f13: string;
  f14: string;
  prePrice?: number;
  trendPoints?: number[];
}

export interface SeciOption {
  value: string;
  label: string;
}

export interface HolidayData {
  version?: string;
  lastDate?: string;
}
