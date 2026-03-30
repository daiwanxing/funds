export const INDEX_FIELDS = "f2,f3,f4,f12,f13,f14";

export type TradingWindow = readonly [string, string];

export interface MarketSessionConfig {
  timeZone: string;
  sessions: TradingWindow[];
}

export const MARKET_SESSION_CONFIG: Record<string, MarketSessionConfig> = {
  "1.000001": {
    timeZone: "Asia/Shanghai",
    sessions: [["09:30", "11:30"], ["13:00", "15:00"]],
  },
  "0.399001": {
    timeZone: "Asia/Shanghai",
    sessions: [["09:30", "11:30"], ["13:00", "15:00"]],
  },
  "1.000300": {
    timeZone: "Asia/Shanghai",
    sessions: [["09:30", "11:30"], ["13:00", "15:00"]],
  },
  "0.399006": {
    timeZone: "Asia/Shanghai",
    sessions: [["09:30", "11:30"], ["13:00", "15:00"]],
  },
  "100.XIN9": {
    timeZone: "Asia/Shanghai",
    sessions: [["09:30", "11:30"], ["13:00", "15:00"]],
  },
  "100.HSI": {
    timeZone: "Asia/Hong_Kong",
    sessions: [["09:30", "12:00"], ["13:00", "16:00"]],
  },
  "100.N225": {
    timeZone: "Asia/Tokyo",
    sessions: [["09:00", "11:30"], ["12:30", "15:30"]],
  },
  "100.VNINDEX": {
    timeZone: "Asia/Ho_Chi_Minh",
    sessions: [["09:15", "11:30"], ["13:00", "15:00"]],
  },
  "100.NDX": {
    timeZone: "America/New_York",
    sessions: [["09:30", "16:00"]],
  },
  "100.SPX": {
    timeZone: "America/New_York",
    sessions: [["09:30", "16:00"]],
  },
  "100.DJIA": {
    timeZone: "America/New_York",
    sessions: [["09:30", "16:00"]],
  },
  "107.VIXY": {
    timeZone: "America/New_York",
    sessions: [["09:30", "16:00"]],
  },
};

export const GLOBAL_INDICES = [
  "1.000001", // 上证指数
  "0.399001", // 深证成指
  "1.000300", // 沪深300
  "0.399006", // 创业板指
  "100.HSI", // 恒生指数
  "100.NDX", // 纳斯达克
  "100.SPX", // 标普500
  "100.DJIA", // 道琼斯
  "100.N225", // 日经225
  "100.VNINDEX", // 越南胡志明
  "100.XIN9", // 富时中国A50
  "107.VIXY", // 恐慌指数VIX ETF
] as const;
