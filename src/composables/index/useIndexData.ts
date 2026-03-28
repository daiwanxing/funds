import { computed, type Ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { storage } from "@/utils/storage";
import { fetchCustomIndices } from "@/api/index";
import type { IndexItem } from "@/types/market";
import { useSettings } from "@/composables/settings";
import { isDuringDate } from "@/utils/marketStatus";

export const useIndexData = (seciList: Ref<string[]>) => {
  const settings = useSettings();
  const indexQuery = useQuery({
    queryKey: ["custom-indices", computed(() => seciList.value.join(","))],
    queryFn: async () => {
      return fetchCustomIndices(seciList.value);
    },
    enabled: computed(() => seciList.value.length > 0),
    refetchInterval: computed(() =>
      settings.isLiveUpdate.value && isDuringDate() && !settings.isEdit.value
        ? 30_000
        : false,
    ),
  });

  const indFundData = computed<IndexItem[]>(() => indexQuery.data.value ?? []);
  const loadingInd = computed(
    () => indexQuery.isLoading.value || indexQuery.isFetching.value,
  );

  const fetchIndexData = async (): Promise<void> => {
    await indexQuery.refetch();
  };

  const addIndex = (code: string): void => {
    seciList.value.push(code);
    storage.set({ seciList: seciList.value }, () => {
      void fetchIndexData();
    });
  };

  const deleteIndex = (index: number): void => {
    seciList.value.splice(index, 1);
    storage.set({ seciList: seciList.value }, () => {
      void fetchIndexData();
    });
  };

  return {
    indFundData,
    loadingInd,
    fetchIndexData,
    addIndex,
    deleteIndex,
  };
};
