import { computed, type ComputedRef, type Ref } from "vue";
import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { resolveFundQuote } from "./quote";
import { usePreferences } from "@/composables/preferences";
import { isDuringDate } from "@/utils/marketStatus";
import { fetchFundQuotes } from "@/api/fund";
import type {
  FundItem,
  FundListItem,
  FundQuoteResponseItem,
  FundSortableField,
} from "@/types/fund";
import type { SortDirection, SortPreferenceState } from "@/types/preferences";

interface UseFundDataOptions {
  persistWatchlist?: (watchlist: FundListItem[]) => void | Promise<void>;
  enabled?: Ref<boolean> | ComputedRef<boolean>;
}

const calculateMoney = (val: { dwjz: number | null; num: number }): number => {
  return parseFloat(((val.dwjz ?? 0) * (val.num ?? 0)).toFixed(2));
};

const calculate = (val: FundItem, hasReplace?: boolean): number => {
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
};

const calculateCost = (val: FundItem): number => {
  if (val.cost && val.dwjz) {
    return parseFloat(((val.dwjz - val.cost) * val.num).toFixed(2));
  }
  return 0;
};

const calculateCostRate = (val: FundItem): number => {
  if (val.cost && val.cost !== 0 && val.dwjz) {
    return parseFloat((((val.dwjz - val.cost) / val.cost) * 100).toFixed(2));
  }
  return 0;
};

const compareFn = (property: FundSortableField, type: SortDirection) => {
  return (a: FundItem, b: FundItem) => {
    return type === "asc"
      ? a[property] - b[property]
      : b[property] - a[property];
  };
};

export const useFundData = (
  fundListM: Ref<FundListItem[]>,
  userId: Ref<string>,
  sortTypeObj: Ref<SortPreferenceState>,
  options: UseFundDataOptions = {},
) => {
  const preferences = usePreferences();
  const queryClient = useQueryClient();

  const watchlistCodes = computed(() => fundListM.value.map((item) => item.code).join(","));
  const queryEnabled = computed(() => {
    const baseEnabled = options.enabled?.value ?? true;
    return (
      baseEnabled &&
      preferences.isReady.value &&
      watchlistCodes.value.length > 0 &&
      userId.value.trim().length > 0
    );
  });
  const queryKey = computed(() => ["fundData", watchlistCodes.value, userId.value.trim()]);

  const persistWatchlist = (watchlist: FundListItem[]): void => {
    void options.persistWatchlist?.(
      watchlist.map((item) => ({
        code: item.code,
        num: item.num ?? 0,
        cost: item.cost ?? 0,
      })),
    );
  };

  const fundListQuery = useQuery({
    queryKey,
    enabled: queryEnabled,
    queryFn: async () => {
      const rawData = await fetchFundQuotes(
        fundListM.value.map((item) => item.code),
        userId.value,
      );
      const list: FundItem[] = [];

      rawData.forEach((quoteItem: FundQuoteResponseItem) => {
        const quote = resolveFundQuote(quoteItem);
        const item: FundItem = {
          fundcode: quoteItem.FCODE,
          name: quoteItem.SHORTNAME,
          jzrq: quoteItem.PDATE,
          dwjz: quote.dwjz,
          gsz: quote.gsz,
          gszzl: quote.gszzl,
          gztime: quote.gztime,
          num: 0,
          cost: 0,
          amount: 0,
          gains: 0,
          costGains: 0,
          costGainsRate: 0,
          hasReplace: quote.hasReplace,
        };

        const match = fundListM.value.find((fund) => fund.code === item.fundcode);
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
      preferences.isLiveUpdate.value && isDuringDate() && !preferences.isEdit.value ? 60_000 : false
    ),
    retry: false,
  });

  const loadingList = computed(() => queryEnabled.value && fundListQuery.isPending.value);


  // dataListDft: 原始顺序（未排序），直接派生自 query 缓存
  // dataList: 排序后的视图，派生自 dataListDft + sortTypeObj
  // 当 watchlistCodes 为空时，两者自动返回 []，无需额外 watcher

  const dataListDft = computed<FundItem[]>(() => {
    if (watchlistCodes.value.length === 0) return [];
    return fundListQuery.data.value ?? [];
  });

  const dataList = computed<FundItem[]>(() => {
    const raw = dataListDft.value;
    if (raw.length === 0) return [];
    if (
      sortTypeObj.value.type &&
      sortTypeObj.value.type !== "none" &&
      sortTypeObj.value.name
    ) {
      return [...raw].sort(
        compareFn(sortTypeObj.value.name, sortTypeObj.value.type),
      );
    }
    return [...raw];
  });



  const fetchData = async (): Promise<void> => {
    await fundListQuery.refetch();
  };

  const addFund = (codes: string[]): void => {
    let changed = false;
    codes.forEach((code) => {
      if (fundListM.value.some((item) => item.code === code)) return;
      fundListM.value.push({ code, num: 0, cost: 0 });
      changed = true;
    });
    if (!changed) return;
    persistWatchlist(fundListM.value);
    void fetchData();
  };

  const deleteFund = (id: string): void => {
    // 先拿到旧 query key 对应的缓存数据
    const oldKey = queryKey.value;
    const oldData = queryClient.getQueryData<FundItem[]>(oldKey);

    // 更新源列表（会导致 queryKey 变化）
    fundListM.value = fundListM.value.filter((f) => f.code !== id);
    persistWatchlist(fundListM.value);

    // 乐观更新：把过滤后的数据写入新的 queryKey 缓存
    if (oldData) {
      const filtered = oldData.filter((f) => f.fundcode !== id);
      queryClient.setQueryData(queryKey.value, filtered);
    }
  };

  const updateFundNum = (item: FundItem): void => {
    const fund = fundListM.value.find((f) => f.code === item.fundcode);
    if (!fund) return;

    fund.num = item.num;
    persistWatchlist(fundListM.value);

    // 乐观更新 query 缓存中的对应条目
    queryClient.setQueryData<FundItem[]>(queryKey.value, (old) => {
      if (!old) return old;
      return old.map((f) => {
        if (f.fundcode !== item.fundcode) return f;
        const updated = { ...f, num: item.num };
        updated.amount = calculateMoney(updated);
        updated.gains = calculate(updated, updated.hasReplace);
        updated.costGains = calculateCost(updated);
        return updated;
      });
    });
  };

  const updateFundCost = (item: FundItem): void => {
    const fund = fundListM.value.find((f) => f.code === item.fundcode);
    if (!fund) return;

    fund.cost = item.cost;
    persistWatchlist(fundListM.value);

    // 乐观更新 query 缓存中的对应条目
    queryClient.setQueryData<FundItem[]>(queryKey.value, (old) => {
      if (!old) return old;
      return old.map((f) => {
        if (f.fundcode !== item.fundcode) return f;
        const updated = { ...f, cost: item.cost };
        updated.costGains = calculateCost(updated);
        updated.costGainsRate = calculateCostRate(updated);
        return updated;
      });
    });
  };

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
    loadingList,
    allGains,
    allCostGains,
    fetchData,
    addFund,
    deleteFund,
    updateFundNum,
    updateFundCost,
  };
};
