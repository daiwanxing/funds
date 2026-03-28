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
