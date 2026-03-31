import { describe, it, expect, beforeEach, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { useFundData } from "@/composables/fund/useFundData";
import type { FundListItem } from "@/types/fund";

vi.mock("@/api/fund", () => ({
  fetchFundQuotes: vi.fn(),
  searchFunds: vi.fn(),
}));

const settingsState = {
  isReady: ref(true),
  isLiveUpdate: ref(false),
  isEdit: ref(false),
};

vi.mock("@/composables/preferences", () => ({
  usePreferences: () => settingsState,
}));

vi.mock("@/utils/marketStatus", () => ({
  isDuringDate: () => false,
}));

const { fetchFundQuotes } = await import("@/api/fund");
const mockedFetchFundQuotes = vi.mocked(fetchFundQuotes);

const fundQuoteResponse = {
  data: {
    Datas: [
      {
        FCODE: "005827",
        SHORTNAME: "易方达蓝筹精选混合",
        PDATE: "2026-03-27",
        NAV: "1.7866",
        NAVCHGRT: "0.74",
        GSZ: null,
        GSZZL: null,
        GZTIME: null,
      },
    ],
  },
};

const mountUseFundData = ({
  fundList = [{ code: "005827", num: 100, cost: 1.7 }],
  userIdValue = "test-user",
  options,
}: {
  fundList?: FundListItem[];
  userIdValue?: string;
  options?: Parameters<typeof useFundData>[3];
} = {}) => {
  const fundListM = ref(fundList);
  const userId = ref(userIdValue);
  const sortTypeObj = ref({ name: null, type: null });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  let exposed!: ReturnType<typeof useFundData>;

  const Host = defineComponent({
    setup() {
      exposed = useFundData(fundListM, userId, sortTypeObj, options);
      return () => null;
    },
  });

  const wrapper = mount(Host, {
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
    },
  });

  return { exposed, wrapper, queryClient, fundListM, userId };
};

describe("useFundData", () => {
  beforeEach(() => {
    mockedFetchFundQuotes.mockReset();
    settingsState.isReady.value = true;
    settingsState.isLiveUpdate.value = false;
    settingsState.isEdit.value = false;
  });

  it("uses NAV and NAVCHGRT as fallback when live valuation fields are null", async () => {
    mockedFetchFundQuotes.mockResolvedValueOnce(fundQuoteResponse.data.Datas);

    const { exposed, wrapper, queryClient } = mountUseFundData();

    await flushPromises();

    expect(exposed.dataList.value).toHaveLength(1);
    expect(exposed.dataList.value[0]).toEqual(
      expect.objectContaining({
        fundcode: "005827",
        gsz: 1.7866,
        gszzl: 0.74,
        hasReplace: true,
      }),
    );
    expect(exposed.dataList.value[0].gains).toBeCloseTo(1.31, 2);

    wrapper.unmount();
    queryClient.clear();
  });

  it("uses exchange realtime price fields for ETF quotes when valuation fields are unavailable", async () => {
    mockedFetchFundQuotes.mockResolvedValueOnce([
      {
        FCODE: "560580",
        SHORTNAME: "电力ETF南方",
        PDATE: "2026-03-27",
        NAV: "1.2364",
        NAVCHGRT: "-0.96",
        GSZ: null,
        GSZZL: null,
        GZTIME: null,
        NEWPRICE: "1.1880",
        CHANGERATIO: "-3.81",
        HQDATE: "2026-03-30 09:55:09",
      },
    ]);

    const fundListM = ref([{ code: "560580", num: 100, cost: 1.2 }]);
    const userId = ref("test-user");
    const sortTypeObj = ref({ name: null, type: null });
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    let exposed!: ReturnType<typeof useFundData>;

    const Host = defineComponent({
      setup() {
        exposed = useFundData(fundListM, userId, sortTypeObj);
        return () => null;
      },
    });

    const wrapper = mount(Host, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();

    expect(exposed.dataList.value).toHaveLength(1);
    expect(exposed.dataList.value[0]).toEqual(
      expect.objectContaining({
        fundcode: "560580",
        gsz: 1.188,
        gszzl: -3.81,
        gztime: "2026-03-30 09:55:09",
        hasReplace: false,
      }),
    );
    expect(exposed.dataList.value[0].gains).toBeCloseTo(-4.84, 2);

    wrapper.unmount();
    queryClient.clear();
  });

  it("persists the updated watchlist through the injected callback when adding funds", async () => {
    mockedFetchFundQuotes.mockResolvedValue(fundQuoteResponse.data.Datas);
    const persistWatchlist = vi.fn();

    const { exposed, wrapper, queryClient } = mountUseFundData({
      options: {
        persistWatchlist,
      },
    });

    await flushPromises();

    exposed.addFund(["000001"]);

    expect(persistWatchlist).toHaveBeenCalledWith([
      { code: "005827", num: 100, cost: 1.7 },
      { code: "000001", num: 0, cost: 0 },
    ]);

    wrapper.unmount();
    queryClient.clear();
  });

  it("does not request quotes until preferences are ready", async () => {
    settingsState.isReady.value = false;
    mockedFetchFundQuotes.mockResolvedValueOnce(fundQuoteResponse.data.Datas);

    const { wrapper, queryClient } = mountUseFundData();

    await flushPromises();
    expect(mockedFetchFundQuotes).not.toHaveBeenCalled();

    settingsState.isReady.value = true;
    await flushPromises();

    expect(mockedFetchFundQuotes).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    queryClient.clear();
  });

  it("does not request quotes when the watchlist is empty", async () => {
    const { wrapper, queryClient } = mountUseFundData({
      fundList: [],
    });

    await flushPromises();

    expect(mockedFetchFundQuotes).not.toHaveBeenCalled();

    wrapper.unmount();
    queryClient.clear();
  });

  it("does not request quotes until the user id is available", async () => {
    mockedFetchFundQuotes.mockResolvedValueOnce(fundQuoteResponse.data.Datas);

    const { wrapper, queryClient, userId } = mountUseFundData({
      userIdValue: "",
    });

    await flushPromises();
    expect(mockedFetchFundQuotes).not.toHaveBeenCalled();

    userId.value = "test-user";
    await flushPromises();

    expect(mockedFetchFundQuotes).toHaveBeenCalledTimes(1);
    expect(mockedFetchFundQuotes).toHaveBeenLastCalledWith(
      ["005827"],
      "test-user",
    );

    wrapper.unmount();
    queryClient.clear();
  });
});
