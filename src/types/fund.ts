// ─── 基金领域类型 ────────────────────────────────────────────────

/** 自选持仓配置项（存储在 storage 中的原始结构） */
export interface FundListItem {
  code: string;
  num: number;
  cost?: number;
}

/** 完整的基金数据项（含行情和持仓计算结果） */
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

/** 搜索结果条目 */
export interface SearchFundItem {
  label: string;
  value: string;
  desc?: string;
  tag?: string;
  /** 估算净值，例如 "1.0820" */
  gsz?: string;
  /** 估算涨跌幅，例如 0.51（正数涨，负数跌） */
  gszzl?: number;
}

/** 基金列表可排序字段 */
export type FundSortableField =
  | "gszzl"
  | "amount"
  | "gains"
  | "costGains"
  | "costGainsRate";

/** 搜索接口原始条目 */
export interface FundSearchResponseItem {
  CODE: string;
  NAME: string;
  CATEGORY?: number | string | null;
}

/** 搜索接口响应 */
export interface FundSearchApiResponse {
  Datas?: FundSearchResponseItem[];
}

/** 基金行情接口原始条目 */
export interface FundQuoteResponseItem {
  FCODE: string;
  SHORTNAME: string;
  PDATE: string;
  NAV: string | null;
  NAVCHGRT: string | null;
  GSZ: string | null;
  GSZZL: string | null;
  GZTIME: string | null;
}

/** 基金行情接口响应 */
export interface FundQuoteApiResponse {
  Datas?: FundQuoteResponseItem[];
}
