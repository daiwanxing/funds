import type {
  GlobalIndexItem,
  GlobalIndexSnapshot,
  GlobalIndexTrendItem,
} from "@/types/market";

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

export const GLOBAL_INDEX_SNAPSHOT_QUERY_KEY = ["global-indices", "snapshot"] as const;
export const GLOBAL_INDEX_TRENDS_QUERY_KEY = ["global-indices", "trends"] as const;

export const getGlobalIndexSecid = (
  snapshot: Pick<GlobalIndexSnapshot, "f12" | "f13">,
) => {
  return `${snapshot.f13}.${snapshot.f12}`;
};

export const mergeGlobalIndexSnapshotsWithTrends = (
  snapshots: GlobalIndexSnapshot[],
  trends: GlobalIndexTrendItem[],
): GlobalIndexItem[] => {
  return snapshots.map((snapshot) => {
    const trendData = trends.find((item) => item.code === getGlobalIndexSecid(snapshot));
    const fallbackPre = Number(snapshot.f2) - Number(snapshot.f4) || 0;

    return {
      ...snapshot,
      prePrice: trendData?.prePrice || fallbackPre,
      trendPoints: trendData?.points,
      trendSessionMinutes: trendData?.sessionMinutes,
      isTodayData: trendData?.isTodayData ?? false,
    };
  });
};
