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

/** 获取北京时间（UTC+8）的今日日期字符串，格式：YYYY-MM-DD */
const getTodayBJT = (): string => {
  const now = new Date();
  const bjt = new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60 * 1000);
  const y = bjt.getFullYear();
  const m = String(bjt.getMonth() + 1).padStart(2, "0");
  const d = String(bjt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const fetchIndexTrends = async (
  secids: string[],
): Promise<GlobalIndexTrendItem[]> => {
  const todayBJT = getTodayBJT();

  const responses = await Promise.all(
    secids.map(async (code) => {
      const url = `/api/index/api/qt/stock/trends2/get?secid=${code}&fields1=f1,f2&fields2=f51,f53&_=${Date.now()}`;
      const { data } = await axios.get<GlobalIndexTrendApiResponse>(url);
      const trendData = data?.data;

      if (!trendData) {
        return { code, prePrice: 0, points: [], isTodayData: false };
      }

      const trends = trendData.trends ?? [];

      // f51 格式为 "YYYY-MM-DD HH:mm"，取第一个点的日期部分判断是否为今日
      const firstDate = trends[0]?.split(",")[0]?.slice(0, 10) ?? "";
      const isTodayData = firstDate === todayBJT;

      const points = trends
        .map((item) => parseFloat(item.split(",")[1]))
        .filter((point) => !Number.isNaN(point));

      return {
        code,
        prePrice: trendData.prePrice ?? 0,
        points,
        isTodayData,
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
