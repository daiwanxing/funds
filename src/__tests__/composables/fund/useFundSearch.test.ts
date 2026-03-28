import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { useFundSearch } from "@/composables/fund/useFundSearch";

vi.mock("@/api/fund", () => ({
  searchFunds: vi.fn(),
  fetchFundQuotes: vi.fn(),
}));

const { searchFunds, fetchFundQuotes } = await import("@/api/fund");
const mockedSearchFunds = vi.mocked(searchFunds);
const mockedFetchFundQuotes = vi.mocked(fetchFundQuotes);

const searchResponse = {
  data: {
    Datas: [
      {
        CODE: "005827",
        NAME: "易方达蓝筹精选混合",
        CATEGORY: 700,
      },
    ],
  },
};

const quoteResponse = {
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

const mountUseFundSearch = () => {
  const query = ref("005827");
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  let exposed!: ReturnType<typeof useFundSearch>;

  const Host = defineComponent({
    setup() {
      exposed = useFundSearch(query);
      return () => null;
    },
  });

  const wrapper = mount(Host, {
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
    },
  });

  return { exposed, wrapper, queryClient };
};

describe("useFundSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedSearchFunds.mockReset();
    mockedFetchFundQuotes.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("falls back to NAV and NAVCHGRT when live quote fields are null", async () => {
    mockedSearchFunds.mockResolvedValueOnce(searchResponse.data.Datas);
    mockedFetchFundQuotes.mockResolvedValueOnce(quoteResponse.data.Datas);

    const { exposed, wrapper, queryClient } = mountUseFundSearch();

    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();
    await vi.advanceTimersByTimeAsync(1800);
    await flushPromises();

    expect(mockedSearchFunds).toHaveBeenCalledTimes(1);
    expect(mockedFetchFundQuotes).toHaveBeenCalledTimes(1);
    expect(exposed.searchOptions.value).toEqual([
      expect.objectContaining({
        value: "005827",
        gsz: "1.7866",
        gszzl: 0.74,
      }),
    ]);

    wrapper.unmount();
    queryClient.clear();
  });
});
