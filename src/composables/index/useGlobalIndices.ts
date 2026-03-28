import { computed } from "vue";
import axios from "axios";
import { useQuery } from "@tanstack/vue-query";
import { useSettings } from "@/composables/settings";
import { isDuringDate } from "@/utils/marketStatus";

export interface GlobalIndexItem {
  f2: number | string; // 最新价
  f3: number | string; // 涨跌幅
  f4: number | string; // 涨跌额
  f12: string; // 代码
  f13: number | string; // 市场号
  f14: string; // 名称
  prePrice?: number; // 昨收价
  trendPoints?: number[]; // 分时价格曲线
}

const GLOBAL_INDICES = [
  "1.000001", // 上证指数
  "0.399001", // 深证成指
  "1.000300", // 沪深300
  "0.399006", // 创业板指
  "100.HSI",  // 恒生指数
  "100.NDX",  // 纳斯达克
  "100.SPX",  // 标普500
  "100.DJIA", // 道琼斯
  "100.N225", // 日经225
  "100.VNINDEX", // 越南胡志明
  "100.XIN9", // 富时中国A50
  "107.VIXY", // 恐慌指数VIX ETF
];

export const useGlobalIndices = () => {
  const settings = useSettings();

  const snapshotQuery = useQuery({
    queryKey: ["global-indices", "snapshot"],
    queryFn: async () => {
      const secids = GLOBAL_INDICES.join(",");
      const url = `/api/index/api/qt/ulist.np/get?fltt=2&fields=f2,f3,f4,f12,f13,f14&secids=${secids}&_=${Date.now()}`;
      const { data } = await axios.get(url);
      return data?.data?.diff ?? [];
    },
    // Dynamically control polling based on settings and market status
    refetchInterval: computed(() => 
      settings.isLiveUpdate.value && isDuringDate() && !settings.isEdit.value ? 30_000 : false
    ),
  });

  const trendsQuery = useQuery({
    queryKey: ["global-indices", "trends"],
    queryFn: async () => {
      const promises = GLOBAL_INDICES.map(async (code) => {
        const url = `/api/index/api/qt/stock/trends2/get?secid=${code}&fields1=f1,f2&fields2=f51,f53&_=${Date.now()}`;
        const res = await axios.get(url);
        const data = res.data?.data;
        if (!data) return { code, prePrice: 0, points: [] };

        const points = (data.trends || [])
          .map((t: string) => parseFloat(t.split(",")[1]))
          .filter((p: number) => !isNaN(p));
        
        return { code, prePrice: data.prePrice, points };
      });
      return await Promise.all(promises);
    },
    refetchInterval: computed(() => 
      settings.isLiveUpdate.value && isDuringDate() && !settings.isEdit.value ? 300_000 : false
    ),
  });

  const dataList = computed<GlobalIndexItem[]>(() => {
    const snapshots = snapshotQuery.data.value || [];
    const trends = trendsQuery.data.value || [];
    
    return snapshots.map((snap: any) => {
      const trendData = trends.find((t: any) => t.code.endsWith(snap.f12));
      // Calculate prePrice fallback from current price minus change amount
      const fallbackPre = (Number(snap.f2) - Number(snap.f4)) || 0;
      return {
        ...snap,
        prePrice: trendData?.prePrice || fallbackPre,
        trendPoints: trendData?.points,
      };
    });
  });

  const isLoading = computed(() => snapshotQuery.isLoading.value);

  return {
    dataList,
    isLoading,
    refetch: () => {
      snapshotQuery.refetch();
      trendsQuery.refetch();
    }
  };
}
