import { computed, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { storage } from "@/utils/storage";
import { setHolidayData } from "@/utils/marketStatus";
import { fetchRemoteHoliday } from "@/api/holiday";
import type { HolidayData } from "@/types/holiday";

interface HolidayQueryResult {
  holiday: HolidayData;
  source: "storage" | "remote";
}

const readStoredHoliday = (): Promise<HolidayData | null> => {
  return new Promise((resolve) => {
    storage.get(["holiday"], (res) => {
      resolve(res.holiday ?? null);
    });
  });
};

export const useHoliday = () => {
  const queryClient = useQueryClient();
  const holidayQuery = useQuery({
    queryKey: ["holiday"],
    queryFn: async (): Promise<HolidayQueryResult> => {
      const cachedHoliday = await readStoredHoliday();
      if (cachedHoliday) {
        return {
          holiday: cachedHoliday,
          source: "storage",
        };
      }

      return {
        holiday: await fetchRemoteHoliday(),
        source: "remote",
      };
    },
    staleTime: Infinity,
  });

  const refreshHolidayMutation = useMutation({
    mutationFn: fetchRemoteHoliday,
    onSuccess: (holiday) => {
      queryClient.setQueryData<HolidayQueryResult>(["holiday"], {
        holiday,
        source: "remote",
      });
    },
  });

  watch(
    () => holidayQuery.data.value,
    (result) => {
      if (!result) return;
      setHolidayData(result.holiday);
      if (result.source === "remote") {
        storage.set({ holiday: result.holiday });
      }
    },
    { immediate: true },
  );

  const loadFromStorage = async (): Promise<void> => {
    await holidayQuery.refetch();
  };

  const fetchHoliday = async (): Promise<void> => {
    await refreshHolidayMutation.mutateAsync();
  };

  return {
    holiday: computed(() => holidayQuery.data.value?.holiday ?? null),
    updating: computed(
      () => holidayQuery.isFetching.value || refreshHolidayMutation.isPending.value,
    ),
    loadFromStorage,
    fetchHoliday,
    isLoading: computed(() => holidayQuery.isLoading.value),
  };
};
