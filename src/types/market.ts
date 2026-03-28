// ─── 市场指数领域类型 ────────────────────────────────────────────

/** 全球指数行情数据项（东方财富接口格式） */
export interface GlobalIndexItem {
  f2: number | string; // 最新价
  f3: number | string; // 涨跌幅
  f4: number | string; // 涨跌额
  f12: string;         // 代码
  f13: number | string; // 市场号
  f14: string;          // 名称
  prePrice?: number;    // 昨收价
  trendPoints?: number[]; // 分时价格曲线
}

/** 自选指数数据项（板块行情） */
export interface IndexItem {
  f2: number;
  f3: number;
  f4: number;
  f12: string;
  f13: string;
  f14: string;
}
