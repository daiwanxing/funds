import { describe, it, expect, beforeEach, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { useIndexData } from "@/composables/index/useIndexData";

vi.mock("@/api/index", () => ({
  fetchCustomIndices: vi.fn(),
}));

const settingsState = {
  isLiveUpdate: ref(false),
  isEdit: ref(false),
};

vi.mock("@/composables/settings", () => ({
  useSettings: () => settingsState,
}));

const { fetchCustomIndices } = await import("@/api/index");
const mockedFetchCustomIndices = vi.mocked(fetchCustomIndices);

const firstResponse = {
  data: {
    data: {
      diff: [
        {
          f2: 3913.72,
          f3: 0.63,
          f4: 24.52,
          f12: "000001",
          f13: "1",
          f14: "上证指数",
        },
      ],
    },
  },
};

const secondResponse = {
  data: {
    data: {
      diff: [
        {
          f2: 4502.57,
          f3: 0.56,
          f4: 25.12,
          f12: "000300",
          f13: "1",
          f14: "沪深300",
        },
      ],
    },
  },
};

const mountUseIndexData = (seciList = ref(["1.000001"])) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  let exposed!: ReturnType<typeof useIndexData>;

  const Host = defineComponent({
    setup() {
      exposed = useIndexData(seciList);
      return () => null;
    },
  });

  const wrapper = mount(Host, {
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
    },
  });

  return { exposed, wrapper, queryClient, seciList };
};

describe("useIndexData", () => {
  beforeEach(() => {
    mockedFetchCustomIndices.mockReset();
  });

  it("fetches index data automatically for the current seciList", async () => {
    mockedFetchCustomIndices.mockResolvedValueOnce(firstResponse.data.data.diff);

    const { exposed, wrapper, queryClient } = mountUseIndexData();
    await flushPromises();

    expect(mockedFetchCustomIndices).toHaveBeenCalledTimes(1);
    expect(exposed.indFundData.value).toEqual(firstResponse.data.data.diff);

    wrapper.unmount();
    queryClient.clear();
  });

  it("refetches automatically when the seciList changes", async () => {
    mockedFetchCustomIndices
      .mockResolvedValueOnce(firstResponse.data.data.diff)
      .mockResolvedValueOnce(secondResponse.data.data.diff);

    const { exposed, wrapper, queryClient, seciList } = mountUseIndexData();
    await flushPromises();

    seciList.value = ["1.000300"];
    await flushPromises();

    expect(mockedFetchCustomIndices).toHaveBeenCalledTimes(2);
    expect(exposed.indFundData.value).toEqual(secondResponse.data.data.diff);

    wrapper.unmount();
    queryClient.clear();
  });
});
