import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { usePreferences } from "@/composables/preferences";
import { isDuringDate } from "@/utils/marketStatus";
import { fetchIndexTrends } from "@/api/index";
import {
  GLOBAL_INDICES,
  GLOBAL_INDEX_TRENDS_QUERY_KEY,
} from "@/constants";
import { mergeGlobalIndexSnapshotsWithTrends } from "./globalIndices";
import { useGlobalIndexSnapshots } from "./useGlobalIndexSnapshots";
import type {
  GlobalIndexItem,
} from "@/types/market";

export type { GlobalIndexItem };

export const useGlobalIndices = () => {
  const preferences = usePreferences();
  const snapshotRefetchInterval = computed(() => (
    preferences.isLiveUpdate.value && isDuringDate() && !preferences.isEdit.value
      ? 30_000
      : false
  ));

  const snapshotQuery = useGlobalIndexSnapshots({
    refetchInterval: snapshotRefetchInterval,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
  });

  const trendsQuery = useQuery({
    queryKey: GLOBAL_INDEX_TRENDS_QUERY_KEY,
    queryFn: async () => {
      return fetchIndexTrends([...GLOBAL_INDICES]);
    },
    refetchInterval: computed(() => (
      preferences.isLiveUpdate.value && isDuringDate() && !preferences.isEdit.value
        ? 300_000
        : false
    )),
    retry: false,
  });

  const dataList = computed<GlobalIndexItem[]>(() => {
    const snapshots = snapshotQuery.dataList.value;
    const trends = trendsQuery.data.value || [];

    return mergeGlobalIndexSnapshotsWithTrends(snapshots, trends);
  });

  const isLoading = computed(() => {
    return snapshotQuery.isLoading.value || trendsQuery.isLoading.value;
  });

  return {
    dataList,
    isLoading,
  };
};
