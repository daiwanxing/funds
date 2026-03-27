import { ref, computed, watch, type Ref } from "vue";
import axios from "axios";
import { storage } from "@/utils/storage";

interface FundItem {
  fundcode: string;
  name: string;
  jzrq: string;
  dwjz: number | null;
  gsz: number | null;
  gszzl: number;
  gztime: string;
  num: number;
  cost: number;
  amount: number;
  gains: number;
  costGains: number;
  costGainsRate: number;
  hasReplace?: boolean;
}

interface FundListMItem {
  code: string;
  num: number;
  cost?: number;
}

function calculateMoney(val: { dwjz: number | null; num: number }): number {
  return parseFloat(((val.dwjz ?? 0) * (val.num ?? 0)).toFixed(2));
}

function calculate(val: FundItem, hasReplace?: boolean): number {
  const num = val.num ?? 0;
  if (hasReplace) {
    return parseFloat(
      (
        ((val.dwjz ?? 0) - (val.dwjz ?? 0) / (1 + val.gszzl * 0.01)) *
        num
      ).toFixed(2),
    );
  }
  if (val.gsz && val.dwjz) {
    return parseFloat(((val.gsz - val.dwjz) * num).toFixed(2));
  }
  return 0;
}

function calculateCost(val: FundItem): number {
  if (val.cost && val.dwjz) {
    return parseFloat(((val.dwjz - val.cost) * val.num).toFixed(2));
  }
  return 0;
}

function calculateCostRate(val: FundItem): number {
  if (val.cost && val.cost !== 0 && val.dwjz) {
    return parseFloat((((val.dwjz - val.cost) / val.cost) * 100).toFixed(2));
  }
  return 0;
}

function compareFn(property: string, type: string) {
  return (a: any, b: any) => {
    return type === "asc"
      ? a[property] - b[property]
      : b[property] - a[property];
  };
}

import { useQuery } from "@tanstack/vue-query";
import { useSettings } from "@/composables/settings";
import { isDuringDate } from "@/utils/marketStatus";
// Ensure imports above are valid, assuming they are placed near other imports.

export function useFundData(
  fundListM: Ref<FundListMItem[]>,
  userId: Ref<string>,
  sortTypeObj: Ref<{ name: string | null; type: string | null }>,
) {
  const settings = useSettings();
  const dataList = ref<FundItem[]>([]);
  const dataListDft = ref<FundItem[]>([]);
  const loading = ref(false);

  const fundListQuery = useQuery({
    queryKey: ["fundData", computed(() => fundListM.value.map(f => f.code).join(",")), userId],
    queryFn: async () => {
      const fundlist = fundListM.value.map((v) => v.code).join(",");
      if (!fundlist) return [];

      const url =
        "/api/fund/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=200&plat=Android&appType=ttjj&product=EFund&Version=1&deviceid=" +
        userId.value +
        "&Fcodes=" +
        fundlist;

      const res = await axios.get(url);
      const rawData = res.data.Datas ?? [];
      const list: FundItem[] = [];

      rawData.forEach((val: any) => {
        const item: FundItem = {
          fundcode: val.FCODE,
          name: val.SHORTNAME,
          jzrq: val.PDATE,
          dwjz: Number.isFinite(Number(val.NAV)) ? parseFloat(val.NAV) : null,
          gsz: Number.isFinite(Number(val.GSZ)) ? parseFloat(val.GSZ) : null,
          gszzl: Number.isFinite(Number(val.GSZZL)) ? parseFloat(val.GSZZL) : 0,
          gztime: val.GZTIME ?? '',
          num: 0,
          cost: 0,
          amount: 0,
          gains: 0,
          costGains: 0,
          costGainsRate: 0,
        };

        if (val.PDATE !== "--" && val.PDATE === val.GZTIME?.substr(0, 10)) {
          item.gsz = Number.isFinite(Number(val.NAV)) ? parseFloat(val.NAV) : null;
          item.gszzl = Number.isFinite(Number(val.NAVCHGRT)) ? parseFloat(val.NAVCHGRT) : 0;
          item.hasReplace = true;
        }

        const match = fundListM.value.find((f) => f.code === item.fundcode);
        if (match) {
          item.num = match.num ?? 0;
          item.cost = match.cost ?? 0;
        }

        item.amount = calculateMoney(item);
        item.gains = calculate(item, item.hasReplace);
        item.costGains = calculateCost(item);
        item.costGainsRate = calculateCostRate(item);

        list.push(item);
      });

      return list;
    },
    refetchInterval: computed(() => 
      settings.isLiveUpdate.value && isDuringDate() && !settings.isEdit.value ? 60_000 : false
    ),
  });

  const loadingList = computed(() => fundListQuery.isLoading.value);

  watch(() => fundListQuery.data.value, (newList: FundItem[] | undefined) => {
    if (!newList) return;
    dataListDft.value = [...newList];

    if (
      sortTypeObj.value.type &&
      sortTypeObj.value.type !== "none" &&
      sortTypeObj.value.name
    ) {
      dataList.value = [...newList].sort(
        compareFn(sortTypeObj.value.name, sortTypeObj.value.type),
      );
    } else {
      dataList.value = [...newList];
    }
  }, { immediate: true });

  async function fetchData(type?: string): Promise<void> {
    await fundListQuery.refetch();
  }

  function addFund(codes: string[]): void {
    codes.forEach((code) => {
      fundListM.value.push({ code, num: 0 });
    });
    storage.set({ fundListM: fundListM.value }, () => {
      fetchData("add");
    });
  }

  function deleteFund(id: string): void {
    fundListM.value = fundListM.value.filter((f) => f.code !== id);
    storage.set({ fundListM: fundListM.value }, () => {
      dataList.value = dataList.value.filter((f) => f.fundcode !== id);
      dataListDft.value = dataListDft.value.filter((f) => f.fundcode !== id);
    });
  }

  function updateFundNum(item: FundItem): void {
    const fund = fundListM.value.find((f) => f.code === item.fundcode);
    if (fund) {
      fund.num = item.num;
      storage.set({ fundListM: fundListM.value }, () => {
        item.amount = calculateMoney(item);
        item.gains = calculate(item, item.hasReplace);
        item.costGains = calculateCost(item);
      });
    }
  }

  function updateFundCost(item: FundItem): void {
    const fund = fundListM.value.find((f) => f.code === item.fundcode);
    if (fund) {
      fund.cost = item.cost;
      storage.set({ fundListM: fundListM.value }, () => {
        item.costGains = calculateCost(item);
        item.costGainsRate = calculateCostRate(item);
      });
    }
  }

  const allGains = computed(() => {
    let totalGains = 0;
    let totalAmount = 0;
    dataList.value.forEach((v) => {
      totalGains += v.gains;
      totalAmount += v.amount;
    });
    const gains = parseFloat(totalGains.toFixed(2));
    const rate = parseFloat(((totalGains * 100) / totalAmount).toFixed(2));
    return [gains, rate] as const;
  });

  const allCostGains = computed(() => {
    let totalCostGains = 0;
    let totalAmount = 0;
    dataList.value.forEach((v) => {
      totalCostGains += v.costGains;
      totalAmount += v.amount;
    });
    const gains = parseFloat(totalCostGains.toFixed(2));
    const rate = parseFloat(
      ((totalCostGains * 100) / (totalAmount - totalCostGains)).toFixed(2),
    );
    return [gains, rate] as const;
  });

  return {
    dataList,
    dataListDft,
    loading,
    loadingList,
    allGains,
    allCostGains,
    fetchData,
    addFund,
    deleteFund,
    updateFundNum,
    updateFundCost,
  };
}
