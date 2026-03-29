import { ref } from "vue";
import type { FundListItem } from "@/types/fund";

const GUEST_STORAGE_KEY = "fs_guest_watchlist";

/**
 * Guest watchlist composable — sessionStorage-backed watchlist
 * for unauthenticated users. Data lives only in the current tab.
 */
export const useGuestWatchlist = () => {
  const items = ref<FundListItem[]>([]);

  /** Load guest watchlist from sessionStorage */
  const load = (): void => {
    try {
      const raw = sessionStorage.getItem(GUEST_STORAGE_KEY);
      items.value = raw ? (JSON.parse(raw) as FundListItem[]) : [];
    } catch {
      items.value = [];
    }
  };

  /** Persist current items to sessionStorage */
  const persist = (): void => {
    sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items.value));
  };

  /** Replace all items */
  const replaceAll = (newItems: FundListItem[]): void => {
    items.value = [...newItems];
    persist();
  };

  /** Add a fund to guest watchlist */
  const addFund = (code: string, num = 0, cost = 0): void => {
    if (items.value.some((item) => item.code === code)) return;
    items.value.push({ code, num, cost });
    persist();
  };

  /** Remove a fund from guest watchlist */
  const removeFund = (code: string): void => {
    items.value = items.value.filter((item) => item.code !== code);
    persist();
  };

  /** Update a fund's num/cost in guest watchlist */
  const updateFund = (code: string, updates: Partial<Omit<FundListItem, "code">>): void => {
    const target = items.value.find((item) => item.code === code);
    if (target) {
      Object.assign(target, updates);
      persist();
    }
  };

  /** Clear guest watchlist */
  const clear = (): void => {
    items.value = [];
    sessionStorage.removeItem(GUEST_STORAGE_KEY);
  };

  /** Check if a fund is in the guest watchlist */
  const hasFund = (code: string): boolean => {
    return items.value.some((item) => item.code === code);
  };

  // Load on creation
  load();

  return {
    items,
    load,
    replaceAll,
    addFund,
    removeFund,
    updateFund,
    clear,
    hasFund,
  };
};
