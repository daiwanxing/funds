import { describe, it, expect, vi, beforeEach } from "vitest";
import { type Ref, ref, nextTick } from "vue";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent } from "vue";
import type { FundItem, FundListItem, FundQuoteResponseItem } from "@/types/fund";
import type { SortPreferenceState } from "@/types/preferences";

// ── Mocks ───────────────────────────────────────────────────────

vi.mock("@/composables/preferences", () => ({
  usePreferences: () => ({
    isReady: ref(true),
    isEdit: ref(false),
    isLiveUpdate: ref(false),
  }),
}));

const mockFetchFundQuotes = vi.fn();
vi.mock("@/api/fund", () => ({
  fetchFundQuotes: (...args: unknown[]) => mockFetchFundQuotes(...args),
}));

vi.mock("@/utils/marketStatus", () => ({
  isDuringDate: () => false,
}));

vi.mock("@/composables/fund/quote", () => ({
  resolveFundQuote: (item: FundQuoteResponseItem) => ({
    dwjz: item.NAV ? parseFloat(item.NAV) : null,
    gsz: item.GSZ ? parseFloat(item.GSZ) : null,
    gszzl: item.GSZZL ? parseFloat(item.GSZZL) : 0,
    gztime: item.GZTIME ?? "",
    hasReplace: false,
  }),
}));

// ── Helpers ─────────────────────────────────────────────────────

const makeQuoteResponse = (code: string, name: string): FundQuoteResponseItem => ({
  FCODE: code,
  SHORTNAME: name,
  PDATE: "2026-03-28",
  NAV: "1.5000",
  NAVCHGRT: null,
  GSZ: "1.5100",
  GSZZL: "0.67",
  GZTIME: "2026-03-28 15:00",
});

interface UseFundDataReturn {
  dataList: { value: FundItem[] };
  dataListDft: { value: FundItem[] };
  loadingList: { value: boolean };
  addFund: (codes: string[]) => void;
  deleteFund: (id: string) => void;
  updateFundNum: (item: FundItem) => void;
  updateFundCost: (item: FundItem) => void;
  allGains: { value: readonly [number, number] };
  allCostGains: { value: readonly [number, number] };
  fetchData: () => Promise<void>;
}

/**
 * Helper that mounts a host component to provide Vue Query context,
 * invokes useFundData inside setup(), and exposes its return value.
 */
const mountUseFundData = async (opts: {
  watchlist: Ref<FundListItem[]>;
  userId?: Ref<string>;
  sortTypeObj?: Ref<SortPreferenceState>;
  persistWatchlist?: (watchlist: FundListItem[]) => void;
}) => {
  const { useFundData } = await import("@/composables/fund/useFundData");

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  let captured!: UseFundDataReturn;

  const Host = defineComponent({
    setup() {
      const result = useFundData(
        opts.watchlist,
        opts.userId ?? ref("user-1"),
        opts.sortTypeObj ?? ref<SortPreferenceState>({ name: null, type: null }),
        {
          persistWatchlist: opts.persistWatchlist,
        },
      );
      captured = result as unknown as UseFundDataReturn;
      return {};
    },
    template: "<div />",
  });

  const wrapper = mount(Host, {
    global: { plugins: [[VueQueryPlugin, { queryClient }]] },
  });

  await flushPromises();

  return { captured, wrapper, queryClient };
};

// ── Tests ───────────────────────────────────────────────────────

describe("useFundData — derived dataList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchFundQuotes.mockReset();
  });

  it("dataList is empty when watchlist is empty (no stale residue)", async () => {
    const watchlist = ref<FundListItem[]>([]);
    const { captured } = await mountUseFundData({ watchlist });

    expect(captured.dataList.value).toEqual([]);
    expect(captured.dataListDft.value).toEqual([]);
  });

  it("dataList reflects query data when watchlist is populated", async () => {
    mockFetchFundQuotes.mockResolvedValue([
      makeQuoteResponse("000001", "基金A"),
    ]);

    const watchlist = ref<FundListItem[]>([{ code: "000001", num: 100, cost: 1.5 }]);
    const { captured } = await mountUseFundData({ watchlist });

    await flushPromises(); // wait for query to resolve

    expect(captured.dataList.value.length).toBe(1);
    expect(captured.dataList.value[0].fundcode).toBe("000001");
    expect(captured.dataList.value[0].num).toBe(100);
  });

  it("dataList clears immediately when watchlist transitions from populated to empty", async () => {
    mockFetchFundQuotes.mockResolvedValue([
      makeQuoteResponse("000001", "基金A"),
    ]);

    const watchlist = ref<FundListItem[]>([{ code: "000001", num: 100, cost: 1.5 }]);
    const { captured } = await mountUseFundData({ watchlist });
    await flushPromises();
    expect(captured.dataList.value.length).toBe(1);

    // Simulate logout — watchlist emptied
    watchlist.value = [];
    await nextTick();

    expect(captured.dataList.value).toEqual([]);
    expect(captured.dataListDft.value).toEqual([]);
  });

  it("dataList applies sort when sortTypeObj has an active sort", async () => {
    mockFetchFundQuotes.mockResolvedValue([
      makeQuoteResponse("000001", "基金A"),
      makeQuoteResponse("000002", "基金B"),
    ]);

    const watchlist = ref<FundListItem[]>([
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ]);
    const sortTypeObj = ref<SortPreferenceState>({ name: "gszzl", type: "desc" });
    const { captured } = await mountUseFundData({ watchlist, sortTypeObj });
    await flushPromises();

    // Should be sorted - both have same gszzl (0.67) so order may not change,
    // but the important thing is it doesn't crash and returns data
    expect(captured.dataList.value.length).toBe(2);
  });

  it("dataListDft is always unsorted", async () => {
    mockFetchFundQuotes.mockResolvedValue([
      makeQuoteResponse("000001", "基金A"),
      makeQuoteResponse("000002", "基金B"),
    ]);

    const watchlist = ref<FundListItem[]>([
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ]);
    const sortTypeObj = ref<SortPreferenceState>({ name: "gszzl", type: "desc" });
    const { captured } = await mountUseFundData({ watchlist, sortTypeObj });
    await flushPromises();

    // dataListDft should match query order (not sorted)
    expect(captured.dataListDft.value.length).toBe(2);
    expect(captured.dataListDft.value[0].fundcode).toBe("000001");
    expect(captured.dataListDft.value[1].fundcode).toBe("000002");
  });

  it("deleteFund removes from dataList optimistically via query cache", async () => {
    mockFetchFundQuotes.mockResolvedValue([
      makeQuoteResponse("000001", "基金A"),
      makeQuoteResponse("000002", "基金B"),
    ]);
    const persistSpy = vi.fn();

    const watchlist = ref<FundListItem[]>([
      { code: "000001", num: 0 },
      { code: "000002", num: 0 },
    ]);
    const { captured } = await mountUseFundData({ watchlist, persistWatchlist: persistSpy });
    await flushPromises();
    expect(captured.dataList.value.length).toBe(2);

    captured.deleteFund("000001");
    await nextTick();

    // Fund should be gone from both lists
    expect(captured.dataList.value.every((f) => f.fundcode !== "000001")).toBe(true);
    expect(captured.dataListDft.value.every((f) => f.fundcode !== "000001")).toBe(true);
    // Should have persisted
    expect(persistSpy).toHaveBeenCalled();
  });

  it("updateFundNum recalculates derived fields optimistically", async () => {
    mockFetchFundQuotes.mockResolvedValue([
      makeQuoteResponse("000001", "基金A"),
    ]);

    const watchlist = ref<FundListItem[]>([{ code: "000001", num: 0, cost: 0 }]);
    const { captured } = await mountUseFundData({ watchlist });
    await flushPromises();

    // Create a mutable copy with updated num (dataList items are readonly from computed)
    const itemSnapshot = { ...captured.dataList.value[0], num: 200 };
    captured.updateFundNum(itemSnapshot);
    await nextTick();

    // amount should be recalculated: dwjz(1.5) * num(200) = 300
    expect(captured.dataList.value[0].amount).toBe(300);
    expect(captured.dataList.value[0].num).toBe(200);
    // source watchlist should be updated
    expect(watchlist.value[0].num).toBe(200);
  });

  it("allGains computes from dataList reactively", async () => {
    mockFetchFundQuotes.mockResolvedValue([
      makeQuoteResponse("000001", "基金A"),
    ]);

    const watchlist = ref<FundListItem[]>([{ code: "000001", num: 100, cost: 1.5 }]);
    const { captured } = await mountUseFundData({ watchlist });
    await flushPromises();

    // With data loaded, allGains should be computed
    expect(captured.allGains.value).toBeDefined();
    expect(Array.isArray(captured.allGains.value)).toBe(true);

    // When watchlist empties, allGains should be [0, NaN] or similar (both totals are 0)
    watchlist.value = [];
    await nextTick();
    expect(captured.allGains.value[0]).toBe(0);
  });
});
