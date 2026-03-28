import { ref, type Ref } from "vue";
import { storage } from "@/utils/storage";
import type { FundItem, FundSortableField } from "@/types/fund";
import type { SortDirection, SortTypeState } from "@/types/settings";

export const useTableSort = (
  dataList: Ref<FundItem[]>,
  dataListDft: Ref<FundItem[]>,
) => {
  const sortType = ref<Record<FundSortableField, SortDirection>>({
    gszzl: "none",
    amount: "none",
    gains: "none",
    costGains: "none",
    costGainsRate: "none",
  });

  const sortTypeObj = ref<SortTypeState>({
    name: null,
    type: null,
  });

  const sortList = (type: FundSortableField): void => {
    // Reset other columns
    for (const key in sortType.value) {
      if (key !== type) sortType.value[key as FundSortableField] = "none";
    }

    // Cycle: none → desc → asc → none
    const current = sortType.value[type];
    sortType.value[type] =
      current === "desc" ? "asc" : current === "asc" ? "none" : "desc";

    if (sortType.value[type] === "none") {
      dataList.value = [...dataListDft.value];
    } else {
      dataList.value = [...dataList.value].sort((a, b) => {
        return sortType.value[type] === "asc"
          ? a[type] - b[type]
          : b[type] - a[type];
      });
    }

    sortTypeObj.value = { name: type, type: sortType.value[type] };
    storage.set({ sortTypeObj: sortTypeObj.value });
  }

  const resetSort = (): void => {
    for (const key in sortType.value) {
      sortType.value[key as FundSortableField] = "none";
    }
    dataList.value = [...dataListDft.value];
  };

  return {
    sortType,
    sortTypeObj,
    sortList,
    resetSort,
  };
};
