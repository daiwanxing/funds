import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useAuthStore, BOOTSTRAP_QUERY_KEY } from "@/stores/auth";
import { putWatchlist, importGuestWatchlist } from "@/api/user";
import { mapFundListToWatchlist } from "@/types/auth";
import type { WatchlistItemDTO } from "@/types/auth";
import type { FundListItem } from "@/types/fund";

const GUEST_STORAGE_KEY = "fs_guest_watchlist";



const loadFromSession = (): FundListItem[] => {
  try {
    const raw = sessionStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FundListItem[]) : [];
  } catch {
    return [];
  }
};

const saveToSession = (items: FundListItem[]): void => {
  sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
};

const clearSession = (): void => {
  sessionStorage.removeItem(GUEST_STORAGE_KEY);
};



const cloneFundList = (items: FundListItem[]): FundListItem[] =>
  items.map((item) => ({
    code: item.code,
    num: item.num ?? 0,
    cost: item.cost ?? 0,
  }));

/**
 * Watchlist Store — 自选基金统一状态管理。
 *
 * 根据登录态自动切换数据源：
 * - 游客模式：内存 + sessionStorage
 * - 登录态：云端（经 auth store bootstrap 缓存）
 *
 * 身份切换时自动同步：
 * - 登录 → 加载云端数据 + 清空 sessionStorage
 * - 退出 → 立即清空 items
 */
export const useWatchlistStore = defineStore("watchlist", () => {
  const auth = useAuthStore();
  const queryClient = useQueryClient();



  /** 当前活跃的自选列表（唯一数据源） */
  const items = ref<FundListItem[]>(
    auth.isAuthenticated ? cloneFundList(auth.cloudWatchlist) : loadFromSession(),
  );

  /** 登录前暂存的游客自选（用于导入提示判断） */
  const guestItemsBeforeLogin = ref<FundListItem[]>([]);

  /** 导入提示是否已被用户关闭 */
  const importPromptDismissed = ref(false);



  /** auth bootstrap 是否完成 */
  const isReady = computed(() => !auth.bootstrap.isPending);

  /** 是否应显示「导入游客自选」提示 */
  const shouldShowImportPrompt = computed(() => {
    if (importPromptDismissed.value) return false;
    if (!auth.isAuthenticated) return false;
    if (!auth.isFirstLogin) return false;
    if (auth.cloudWatchlist.length > 0) return false;
    if (guestItemsBeforeLogin.value.length === 0) return false;
    return true;
  });



  const saveWatchlistMutation = useMutation({
    mutationFn: (watchlist: WatchlistItemDTO[]) => putWatchlist(watchlist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BOOTSTRAP_QUERY_KEY] });
    },
  });

  const importGuestMutation = useMutation({
    mutationFn: (watchlist: WatchlistItemDTO[]) => importGuestWatchlist(watchlist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...BOOTSTRAP_QUERY_KEY] });
    },
  });

  const persistToCloud = (list: FundListItem[]): void => {
    void saveWatchlistMutation.mutateAsync(mapFundListToWatchlist(list));
  };

  const persist = (): void => {
    if (auth.isAuthenticated) {
      persistToCloud(items.value);
    } else {
      saveToSession(items.value);
    }
  };



  const addFund = (codes: string[]): void => {
    let changed = false;
    codes.forEach((code) => {
      if (items.value.some((item) => item.code === code)) return;
      items.value.push({ code, num: 0, cost: 0 });
      changed = true;
    });
    if (changed) persist();
  };

  const removeFund = (code: string): void => {
    items.value = items.value.filter((item) => item.code !== code);
    persist();
  };

  const updateFund = (
    code: string,
    updates: Partial<Omit<FundListItem, "code">>,
  ): void => {
    const target = items.value.find((item) => item.code === code);
    if (target) {
      Object.assign(target, updates);
      persist();
    }
  };

  const replaceAll = (newItems: FundListItem[]): void => {
    items.value = cloneFundList(newItems);
    persist();
  };

  const dismissImportPrompt = (): void => {
    importPromptDismissed.value = true;
  };

  const importGuestFunds = async (): Promise<void> => {
    const guestItems = guestItemsBeforeLogin.value;
    if (guestItems.length === 0) return;

    await importGuestMutation.mutateAsync(mapFundListToWatchlist(guestItems));
    clearSession();
    guestItemsBeforeLogin.value = [];
    importPromptDismissed.value = true;
  };



  watch(
    () => auth.isAuthenticated,
    (isAuth, wasAuth) => {
      if (isAuth && !wasAuth) {
        // Login transition: save guest items for import prompt, then switch
        guestItemsBeforeLogin.value = cloneFundList(items.value);
        items.value = cloneFundList(auth.cloudWatchlist);
        clearSession();
        importPromptDismissed.value = false;
      } else if (!isAuth && wasAuth) {
        // Logout transition: immediately clear
        items.value = [];
        guestItemsBeforeLogin.value = [];
        importPromptDismissed.value = false;
      }
    },
  );

  // Sync with cloud watchlist changes (e.g. after saveWatchlist invalidates bootstrap)
  watch(
    () => auth.isAuthenticated ? auth.cloudWatchlist : null,
    (cloudList) => {
      if (cloudList) {
        items.value = cloneFundList(cloudList);
      }
    },
    { deep: true },
  );

  return {
    // State
    items,
    guestItemsBeforeLogin,

    // Derived
    isReady,
    shouldShowImportPrompt,

    // Methods
    addFund,
    removeFund,
    updateFund,
    replaceAll,
    dismissImportPrompt,
    importGuestFunds,
  };
});
