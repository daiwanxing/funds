import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { useGlobalIndices } from "@/composables/index/useGlobalIndices";

vi.mock("@/api/index", () => ({
  fetchIndexSnapshots: vi.fn(),
  fetchIndexTrends: vi.fn(),
}));

const preferenceState = {
  isLiveUpdate: ref(false),
  isEdit: ref(false),
};

vi.mock("@/composables/preferences", () => ({
  usePreferences: () => preferenceState,
}));

vi.mock("@/utils/marketStatus", () => ({
  isDuringDate: vi.fn(() => true),
}));

const { fetchIndexSnapshots, fetchIndexTrends } = await import("@/api/index");
const mockedFetchIndexSnapshots = vi.mocked(fetchIndexSnapshots);
const mockedFetchIndexTrends = vi.mocked(fetchIndexTrends);

const mountUseGlobalIndices = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  let exposed!: ReturnType<typeof useGlobalIndices>;

  const Host = defineComponent({
    setup() {
      exposed = useGlobalIndices();
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

describe("useGlobalIndices", () => {
  beforeEach(() => {
    mockedFetchIndexSnapshots.mockReset();
    mockedFetchIndexTrends.mockReset();
  });

  it("keeps combining the shared snapshots with trend data for the dashboard ticker", async () => {
    mockedFetchIndexSnapshots.mockResolvedValueOnce([
      {
        f2: 5890.11,
        f3: 1.24,
        f4: 72.1,
        f12: "SPX",
        f13: 100,
        f14: "标普500",
      },
    ]);
    mockedFetchIndexTrends.mockResolvedValueOnce([
      {
        code: "100.SPX",
        prePrice: 5818.01,
        points: [5818.01, 5844.2, 5890.11],
      },
    ]);

    const { exposed, wrapper, queryClient } = mountUseGlobalIndices();
    await flushPromises();

    expect(exposed.dataList.value).toEqual([
      expect.objectContaining({
        f12: "SPX",
        prePrice: 5818.01,
        trendPoints: [5818.01, 5844.2, 5890.11],
      }),
    ]);

    wrapper.unmount();
    queryClient.clear();
  });
});
