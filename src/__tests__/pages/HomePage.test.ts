import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent, ref, nextTick } from "vue";
import HomePage from "@/pages/Dashboard/HomePage.vue";
import FundSavedList from "@/pages/Dashboard/components/FundSavedList.vue";
import type { FundItem, FundListItem } from "@/types/fund";

const settingsState = {
  isReady: ref(false),
  isEdit: ref(false),
  userId: ref("user-1"),
  sortTypeObj: ref({ name: null, type: null } as { name: string | null; type: string | null }),
  RealtimeFundcode: ref<string | null>(null),
  load: vi.fn(),
  updatePreference: vi.fn(),
};

const fundDataState = {
  dataList: ref<FundItem[]>([]),
  dataListDft: ref<FundItem[]>([]),
  allGains: ref([0, 0] as const),
  allCostGains: ref([0, 0] as const),
  fetchData: vi.fn(),
  addFund: vi.fn(),
  deleteFund: vi.fn(),
  updateFundNum: vi.fn(),
  updateFundCost: vi.fn(),
  loading: ref(false),
  loadingList: ref(false),
};

const authIsAuthenticated = ref(false);
const authCloudWatchlist = ref<FundListItem[]>([]);
const authIsFirstLogin = ref(false);
const authShouldShowImportPrompt = ref(false);

const authState = {
  bootstrap: {
    refetch: vi.fn(),
    isPending: ref(false),
  },
  get isAuthenticated() {
    return authIsAuthenticated.value;
  },
  get cloudWatchlist() {
    return authCloudWatchlist.value;
  },
  get isFirstLogin() {
    return authIsFirstLogin.value;
  },
  get shouldShowImportPrompt() {
    return authShouldShowImportPrompt.value;
  },
  saveWatchlist: {
    mutateAsync: vi.fn(),
  },
  importGuest: {
    mutateAsync: vi.fn(),
  },
  dismissImportPrompt: vi.fn(),
};

const guestWatchlistState = {
  items: ref<FundListItem[]>([]),
  replaceAll: vi.fn(),
  clear: vi.fn(),
};

const globalIndicesState = {
  dataList: ref([]),
  isLoading: ref(false),
  refetch: vi.fn(),
};

const holidayState = {
  loadFromStorage: vi.fn(),
};

vi.mock("@/composables/preferences", () => ({
  usePreferences: () => settingsState,
}));

vi.mock("@/composables/fund", () => ({
  useFundData: vi.fn((watchlistRef) => {
    capturedWatchlistRef = watchlistRef;
    return fundDataState;
  }),
}));

vi.mock("@/composables/index", () => ({
  useGlobalIndices: () => globalIndicesState,
}));

vi.mock("@/composables/holiday", () => ({
  useHoliday: () => holidayState,
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => authState,
}));

vi.mock("@/composables/watchlist/useGuestWatchlist", () => ({
  useGuestWatchlist: () => guestWatchlistState,
}));

vi.mock("@/composables/fund/useFundSearch", () => ({
  useFundSearch: () => ({
    searchOptions: ref([]),
    loading: ref(false),
    error: ref(null),
  }),
}));

vi.mock("@/utils/marketStatus", async () => {
  const actual = await vi.importActual<typeof import("@/utils/marketStatus")>(
    "@/utils/marketStatus",
  );

  return {
    ...actual,
    loadHoliday: vi.fn().mockResolvedValue(undefined),
  };
});

let capturedWatchlistRef: { value: FundListItem[] } | undefined;

const WatchlistHeaderStub = defineComponent({
  name: "WatchlistHeader",
  props: {
    savedCount: {
      type: Number,
      default: 0,
    },
  },
  template: "<div data-test='saved-count'>{{ savedCount }}</div>",
});

const FundSearchListStub = defineComponent({
  name: "FundSearchList",
  props: {
    addedCodes: {
      type: Array,
      default: () => [],
    },
  },
  template: "<div data-test='search-added-codes'>{{ (addedCodes as string[]).join(',') }}</div>",
});

const GuestImportDialogStub = defineComponent({
  name: "GuestImportDialog",
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    guestCount: {
      type: Number,
      default: 0,
    },
  },
  emits: ["confirm", "cancel"],
  template: `
    <div v-if="open">
      <button data-test="confirm-import" @click="$emit('confirm')">confirm {{ guestCount }}</button>
      <button data-test="cancel-import" @click="$emit('cancel')">cancel</button>
    </div>
  `,
});

const createFundItem = (fundcode: string): FundItem => ({
  fundcode,
  name: `基金${fundcode}`,
  jzrq: "2026-03-28",
  dwjz: 1,
  gsz: 1,
  gszzl: 0,
  gztime: "2026-03-28 15:00",
  num: 0,
  cost: 0,
  amount: 0,
  gains: 0,
  costGains: 0,
  costGainsRate: 0,
});

const mountPage = async () => {
  const wrapper = mount(HomePage, {
    global: {
      stubs: {
        GlobalTicker: { template: "<div />" },
        StatusBar: { template: "<div />" },
        WatchlistHeader: WatchlistHeaderStub,
        FundSearchList: FundSearchListStub,
        GuestImportDialog: GuestImportDialogStub,
      },
    },
  });

  await flushPromises();
  await nextTick();

  return wrapper;
};

describe("HomePage selection behavior", () => {
  beforeEach(() => {
    settingsState.isReady.value = false;
    settingsState.isEdit.value = false;
    settingsState.RealtimeFundcode.value = null;
    settingsState.load.mockReset();
    settingsState.updatePreference.mockReset();
    settingsState.load.mockImplementation(async () => {
      settingsState.isReady.value = true;
    });
    settingsState.updatePreference.mockImplementation((key, value) => {
      if (key === "RealtimeFundcode") {
        settingsState.RealtimeFundcode.value = value as string | null;
      }
    });

    fundDataState.fetchData.mockReset();
    fundDataState.dataList.value = [];
    fundDataState.dataListDft.value = [];
    fundDataState.allGains.value = [0, 0];
    fundDataState.allCostGains.value = [0, 0];
    fundDataState.loadingList.value = false;

    globalIndicesState.refetch.mockReset();
    holidayState.loadFromStorage.mockReset();
    authState.bootstrap.refetch.mockReset();
    authState.bootstrap.isPending.value = false;
    authIsAuthenticated.value = false;
    authCloudWatchlist.value = [];
    authIsFirstLogin.value = false;
    authShouldShowImportPrompt.value = false;
    authState.saveWatchlist.mutateAsync.mockReset();
    authState.importGuest.mutateAsync.mockReset();
    authState.dismissImportPrompt.mockReset();
    guestWatchlistState.items.value = [];
    guestWatchlistState.replaceAll.mockReset();
    guestWatchlistState.clear.mockReset();
    capturedWatchlistRef = undefined;
  });

  it("uses guest watchlist as the active source when unauthenticated", async () => {
    guestWatchlistState.items.value = [
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ];
    fundDataState.dataList.value = [createFundItem("000001"), createFundItem("000002")];
    fundDataState.dataListDft.value = [createFundItem("000001"), createFundItem("000002")];

    const wrapper = await mountPage();

    expect(capturedWatchlistRef?.value).toEqual([
      { code: "000001", num: 0, cost: 0 },
      { code: "000002", num: 0, cost: 0 },
    ]);
    expect(wrapper.get("[data-test='saved-count']").text()).toBe("2");

    const savedList = wrapper.getComponent(FundSavedList);
    expect(savedList.props("activeCode")).toBe("000001");
  });

  it("shows loading state instead of empty state while the first saved-fund request is pending", async () => {
    guestWatchlistState.items.value = [{ code: "000001", num: 0 }];
    fundDataState.loadingList.value = true;
    fundDataState.dataList.value = [];
    fundDataState.dataListDft.value = [];

    const wrapper = await mountPage();

    expect(wrapper.text()).not.toContain("添加你的第一只基金");
    expect(wrapper.text()).toContain("正在同步自选持仓");
  });

  it("keeps the dashboard shell visible while preferences are still booting", async () => {
    settingsState.load.mockImplementation(() => new Promise(() => {}));
    settingsState.isReady.value = false;
    authState.bootstrap.isPending.value = true;

    const wrapper = await mountPage();

    expect(wrapper.get("[data-test='saved-count']").text()).toBe("0");
    expect(wrapper.text()).toContain("正在同步自选持仓");
    expect(wrapper.text()).not.toContain("自选列表为空");
  });

  it("switches to cloud watchlist when authenticated", async () => {
    authIsAuthenticated.value = true;
    authCloudWatchlist.value = [
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ];
    guestWatchlistState.items.value = [{ code: "000003", num: 0 }];
    fundDataState.dataList.value = [createFundItem("000001"), createFundItem("000002")];
    fundDataState.dataListDft.value = [createFundItem("000001"), createFundItem("000002")];

    const wrapper = await mountPage();

    expect(capturedWatchlistRef?.value).toEqual([
      { code: "000001", num: 0, cost: 0 },
      { code: "000002", num: 0, cost: 0 },
    ]);
    expect(wrapper.get("[data-test='saved-count']").text()).toBe("2");
    expect(wrapper.getComponent(FundSavedList).props("activeCode")).toBe("000001");
  });

  it("falls back to the first remaining fund when the current selection disappears", async () => {
    guestWatchlistState.items.value = [
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ];
    settingsState.RealtimeFundcode.value = "000002";
    fundDataState.dataList.value = [createFundItem("000001"), createFundItem("000002")];
    fundDataState.dataListDft.value = [createFundItem("000001"), createFundItem("000002")];

    const wrapper = await mountPage();

    guestWatchlistState.items.value = [{ code: "000001", num: 0 }];
    fundDataState.dataList.value = [createFundItem("000001")];
    fundDataState.dataListDft.value = [createFundItem("000001")];
    await nextTick();

    expect(wrapper.getComponent(FundSavedList).props("activeCode")).toBe("000001");
  });

  it("selects the first fund when the list transitions from empty to non-empty and clears when emptied", async () => {
    const wrapper = await mountPage();

    guestWatchlistState.items.value = [{ code: "000003", num: 0 }];
    fundDataState.dataList.value = [createFundItem("000003")];
    fundDataState.dataListDft.value = [createFundItem("000003")];
    await nextTick();

    expect(wrapper.getComponent(FundSavedList).props("activeCode")).toBe("000003");

    guestWatchlistState.items.value = [];
    fundDataState.dataList.value = [];
    fundDataState.dataListDft.value = [];
    await nextTick();

    expect(wrapper.getComponent(FundSavedList).props("activeCode")).toBeNull();
  });

  it("opens the guest import dialog for first-login users with local guest funds", async () => {
    authIsAuthenticated.value = true;
    authIsFirstLogin.value = true;
    authShouldShowImportPrompt.value = true;
    authCloudWatchlist.value = [];
    guestWatchlistState.items.value = [
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ];

    const wrapper = await mountPage();

    expect(wrapper.get("[data-test='confirm-import']").text()).toContain("2");
  });

  it("imports guest watchlist on confirmation and clears the guest session", async () => {
    authIsAuthenticated.value = true;
    authIsFirstLogin.value = true;
    authShouldShowImportPrompt.value = true;
    authCloudWatchlist.value = [];
    guestWatchlistState.items.value = [
      { code: "005827", num: 10, cost: 1.7 },
      { code: "000001", num: 5, cost: 0 },
    ];

    const wrapper = await mountPage();

    await wrapper.get("[data-test='confirm-import']").trigger("click");

    expect(authState.importGuest.mutateAsync).toHaveBeenCalledWith([
      { fundCode: "005827", num: 10, cost: 1.7, sortOrder: 0 },
      { fundCode: "000001", num: 5, cost: 0, sortOrder: 1 },
    ]);
    expect(guestWatchlistState.clear).toHaveBeenCalledTimes(1);
    expect(authState.dismissImportPrompt).toHaveBeenCalledTimes(1);
  });

  it("dismisses the guest import dialog without importing when canceled", async () => {
    authIsAuthenticated.value = true;
    authIsFirstLogin.value = true;
    authShouldShowImportPrompt.value = true;
    authCloudWatchlist.value = [];
    guestWatchlistState.items.value = [{ code: "005827", num: 10, cost: 1.7 }];

    const wrapper = await mountPage();

    await wrapper.get("[data-test='cancel-import']").trigger("click");

    expect(authState.importGuest.mutateAsync).not.toHaveBeenCalled();
    expect(guestWatchlistState.clear).not.toHaveBeenCalled();
    expect(authState.dismissImportPrompt).toHaveBeenCalledTimes(1);
  });

  it("does not manually refetch dashboard queries on mount", async () => {
    await mountPage();

    expect(settingsState.load).toHaveBeenCalledTimes(1);
    expect(authState.bootstrap.refetch).not.toHaveBeenCalled();
    expect(globalIndicesState.refetch).not.toHaveBeenCalled();
    expect(fundDataState.fetchData).not.toHaveBeenCalled();
  });
});
