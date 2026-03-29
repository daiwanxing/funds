import { computed } from "vue";
import { useGlobalIndexSnapshots } from "@/composables/index";
import { mapSnapshotsToAuthGlobeMarkets } from "@/pages/Authentication/components/Globe/authGlobeMarkets";

export const useAuthGlobeMarkets = () => {
  const snapshots = useGlobalIndexSnapshots();

  const items = computed(() => {
    if (snapshots.isError.value) return [];
    return mapSnapshotsToAuthGlobeMarkets(snapshots.dataList.value);
  });

  return {
    items,
    isLoading: snapshots.isLoading,
    refetch: snapshots.refetch,
  };
};
