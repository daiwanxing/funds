import { ref, type Ref } from "vue";
import { storage } from "@/utils/storage";

type SortDirection = "asc" | "desc" | "none";

export const useTableSort = (dataList: Ref<any[]>, dataListDft: Ref<any[]>) => {
  const sortType = ref<Record<string, SortDirection>>({
    gszzl: "none",
    amount: "none",
    gains: "none",
    costGains: "none",
    costGainsRate: "none",
  });

  const sortTypeObj = ref<{ name: string | null; type: string | null }>({
    name: null,
    type: null,
  });

  const sortList = (type: string): void => {
    // Reset other columns
    for (const key in sortType.value) {
      if (key !== type) sortType.value[key] = "none";
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
      sortType.value[key] = "none";
    }
    dataList.value = [...dataListDft.value];
  }

  return {
    sortType,
    sortTypeObj,
    sortList,
    resetSort,
  };
}
