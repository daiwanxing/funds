import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref, nextTick } from "vue";
import HomePage from "@/pages/HomePage.vue";
import FundSavedList from "@/pages/Home/components/FundSavedList.vue";
import type { FundItem, FundListItem } from "@/types/fund";

const settingsState = {
  isReady: ref(false),
  isEdit: ref(false),
  fundListM: ref<FundListItem[]>([]),
  userId: ref("user-1"),
  sortTypeObj: ref({ name: null, type: null } as { name: string | null; type: string | null }),
  RealtimeFundcode: ref<string | null>(null),
  load: vi.fn(),
  updateSetting: vi.fn(),
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

const globalIndicesState = {
  dataList: ref([]),
  isLoading: ref(false),
  refetch: vi.fn(),
};

const holidayState = {
  loadFromStorage: vi.fn(),
};

vi.mock("@/composables/settings", () => ({
  useSettings: () => settingsState,
}));

vi.mock("@/composables/fund", () => ({
  useFundData: () => fundDataState,
}));

vi.mock("@/composables/index", () => ({
  useGlobalIndices: () => globalIndicesState,
}));

vi.mock("@/composables/holiday", () => ({
  useHoliday: () => holidayState,
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
        ZoneBHeader: { template: "<div />" },
        FundSearchList: { template: "<div />" },
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
    settingsState.fundListM.value = [];
    settingsState.RealtimeFundcode.value = null;
    settingsState.load.mockReset();
    settingsState.updateSetting.mockReset();
    settingsState.load.mockImplementation(async () => {
      settingsState.isReady.value = true;
    });
    settingsState.updateSetting.mockImplementation((key, value) => {
      if (key === "RealtimeFundcode") {
        settingsState.RealtimeFundcode.value = value as string | null;
      }
    });

    fundDataState.fetchData.mockReset();
    fundDataState.dataList.value = [];
    fundDataState.dataListDft.value = [];
    fundDataState.allGains.value = [0, 0];
    fundDataState.allCostGains.value = [0, 0];

    globalIndicesState.refetch.mockReset();
    holidayState.loadFromStorage.mockReset();
  });

  it("selects the first fund on initial load when no valid selection exists", async () => {
    settingsState.fundListM.value = [
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ];
    fundDataState.dataList.value = [createFundItem("000001"), createFundItem("000002")];
    fundDataState.dataListDft.value = [createFundItem("000001"), createFundItem("000002")];

    const wrapper = await mountPage();

    const savedList = wrapper.getComponent(FundSavedList);
    expect(savedList.props("activeCode")).toBe("000001");
  });

  it("shows loading state instead of empty state while the first saved-fund request is pending", async () => {
    settingsState.fundListM.value = [{ code: "000001", num: 0 }];
    fundDataState.loadingList.value = true;
    fundDataState.dataList.value = [];
    fundDataState.dataListDft.value = [];

    const wrapper = await mountPage();

    expect(wrapper.text()).not.toContain("添加你的第一只基金");
    expect(wrapper.text()).toContain("正在同步自选持仓");
  });

  it("falls back to the first remaining fund when the current selection disappears", async () => {
    settingsState.fundListM.value = [
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ];
    settingsState.RealtimeFundcode.value = "000002";
    fundDataState.dataList.value = [createFundItem("000001"), createFundItem("000002")];
    fundDataState.dataListDft.value = [createFundItem("000001"), createFundItem("000002")];

    const wrapper = await mountPage();

    settingsState.fundListM.value = [{ code: "000001", num: 0 }];
    fundDataState.dataList.value = [createFundItem("000001")];
    fundDataState.dataListDft.value = [createFundItem("000001")];
    await nextTick();

    expect(wrapper.getComponent(FundSavedList).props("activeCode")).toBe("000001");
  });

  it("selects the first fund when the list transitions from empty to non-empty and clears when emptied", async () => {
    const wrapper = await mountPage();

    settingsState.fundListM.value = [{ code: "000003", num: 0 }];
    fundDataState.dataList.value = [createFundItem("000003")];
    fundDataState.dataListDft.value = [createFundItem("000003")];
    await nextTick();

    expect(wrapper.getComponent(FundSavedList).props("activeCode")).toBe("000003");

    settingsState.fundListM.value = [];
    fundDataState.dataList.value = [];
    fundDataState.dataListDft.value = [];
    await nextTick();

    expect(wrapper.getComponent(FundSavedList).props("activeCode")).toBeNull();
  });
});
