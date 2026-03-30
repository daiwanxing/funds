import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { fetchIndexSnapshots } from "@/api/index";
import { GLOBAL_INDICES, GLOBAL_INDEX_SNAPSHOT_QUERY_KEY } from "@/constants";
import type { GlobalIndexSnapshot } from "@/types/market";

export interface UseGlobalIndexSnapshotsOptions {
  refetchInterval?: MaybeRefOrGetter<number | false | undefined>;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
}

export const useGlobalIndexSnapshots = (
  options: UseGlobalIndexSnapshotsOptions = {},
) => {
  const query = useQuery({
    queryKey: GLOBAL_INDEX_SNAPSHOT_QUERY_KEY,
    queryFn: async () => {
      return fetchIndexSnapshots([...GLOBAL_INDICES]);
    },
    refetchInterval: computed(() => toValue(options.refetchInterval) ?? false),
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    refetchOnReconnect: options.refetchOnReconnect ?? false,
  });

  const dataList = computed<GlobalIndexSnapshot[]>(() => query.data.value ?? []);
  const isLoading = computed(() => query.isLoading.value);
  const isError = computed(() => query.isError.value);
  const error = computed(() => query.error.value);

  return {
    dataList,
    isLoading,
    isError,
    error,
    refetch: query.refetch,
  };
};
