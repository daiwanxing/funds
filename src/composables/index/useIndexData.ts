import { ref, type Ref } from "vue";
import axios from "axios";
import { storage } from "@/utils/storage";

interface IndexItem {
  f2: number;
  f3: number;
  f4: number;
  f12: string;
  f13: string;
  f14: string;
}

export function useIndexData(seciList: Ref<string[]>) {
  const indFundData = ref<IndexItem[]>([]);
  const loadingInd = ref(false);

  async function fetchIndexData(): Promise<void> {
    const seciStr = seciList.value.join(",");
    if (!seciStr) return;

    loadingInd.value = true;
    const url =
      "/api/index/api/qt/ulist.np/get?fltt=2&fields=f2,f3,f4,f12,f13,f14&secids=" +
      seciStr +
      "&_=" +
      Date.now();

    try {
      const res = await axios.get(url);
      indFundData.value = res.data.data?.diff ?? [];
    } finally {
      loadingInd.value = false;
    }
  }

  function addIndex(code: string): void {
    seciList.value.push(code);
    storage.set({ seciList: seciList.value }, () => {
      fetchIndexData();
    });
  }

  function deleteIndex(index: number): void {
    seciList.value.splice(index, 1);
    storage.set({ seciList: seciList.value }, () => {
      fetchIndexData();
    });
  }

  return {
    indFundData,
    loadingInd,
    fetchIndexData,
    addIndex,
    deleteIndex,
  };
}
