import type {
  GlobalIndexItem,
  GlobalIndexSnapshot,
  GlobalIndexTrendItem,
} from "@/types/market";

export {
  GLOBAL_INDICES,
  GLOBAL_INDEX_SNAPSHOT_QUERY_KEY,
  GLOBAL_INDEX_TRENDS_QUERY_KEY,
} from "@/constants";

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
