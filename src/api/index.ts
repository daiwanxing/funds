import axios from "axios";
import type {
  GlobalIndexSnapshot,
  GlobalIndicesSnapshotApiResponse,
  GlobalIndexTrendApiResponse,
  GlobalIndexTrendItem,
  IndexItem,
} from "@/types/market";

const INDEX_FIELDS = "f2,f3,f4,f12,f13,f14";

export const fetchIndexSnapshots = async (
  secids: string[],
): Promise<GlobalIndexSnapshot[]> => {
  if (secids.length === 0) return [];

  const url = `/api/index/api/qt/ulist.np/get?fltt=2&fields=${INDEX_FIELDS}&secids=${secids.join(",")}&_=${Date.now()}`;
  const { data } = await axios.get<GlobalIndicesSnapshotApiResponse>(url);
  return data?.data?.diff ?? [];
};

export const fetchIndexTrends = async (
  secids: string[],
): Promise<GlobalIndexTrendItem[]> => {
  const responses = await Promise.all(
    secids.map(async (code) => {
      const url = `/api/index/api/qt/stock/trends2/get?secid=${code}&fields1=f1,f2&fields2=f51,f53&_=${Date.now()}`;
      const { data } = await axios.get<GlobalIndexTrendApiResponse>(url);
      const trendData = data?.data;

      if (!trendData) {
        return { code, prePrice: 0, points: [] };
      }

      const points = (trendData.trends ?? [])
        .map((item) => parseFloat(item.split(",")[1]))
        .filter((point) => !Number.isNaN(point));

      return {
        code,
        prePrice: trendData.prePrice ?? 0,
        points,
      };
    }),
  );

  return responses;
};

export const fetchCustomIndices = async (
  secids: string[],
): Promise<IndexItem[]> => {
  return (await fetchIndexSnapshots(secids)) as IndexItem[];
};
