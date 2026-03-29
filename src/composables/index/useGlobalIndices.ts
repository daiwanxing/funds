import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { usePreferences } from "@/composables/preferences";
import { isDuringDate } from "@/utils/marketStatus";
import { fetchIndexSnapshots, fetchIndexTrends } from "@/api/index";
import type {
  GlobalIndexItem,
  GlobalIndexSnapshot,
} from "@/types/market";

export type { GlobalIndexItem };

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
  const preferences = usePreferences();

  const snapshotQuery = useQuery({
    queryKey: ["global-indices", "snapshot"],
    queryFn: async () => {
      return fetchIndexSnapshots(GLOBAL_INDICES);
    },
    // Dynamically control polling based on settings and market status
    refetchInterval: computed(() => 
      preferences.isLiveUpdate.value && isDuringDate() && !preferences.isEdit.value ? 30_000 : false
    ),
  });

  const trendsQuery = useQuery({
    queryKey: ["global-indices", "trends"],
    queryFn: async () => {
      return fetchIndexTrends(GLOBAL_INDICES);
    },
    refetchInterval: computed(() => 
      preferences.isLiveUpdate.value && isDuringDate() && !preferences.isEdit.value ? 300_000 : false
    ),
  });

  const dataList = computed<GlobalIndexItem[]>(() => {
    const snapshots = snapshotQuery.data.value || [];
    const trends = trendsQuery.data.value || [];
    
    return snapshots.map((snapshot: GlobalIndexSnapshot) => {
      const trendData = trends.find((item) => item.code.endsWith(snapshot.f12));
      // Calculate prePrice fallback from current price minus change amount
      const fallbackPre = (Number(snapshot.f2) - Number(snapshot.f4)) || 0;
      return {
        ...snapshot,
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
};
