import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { useGlobalIndexSnapshots } from "@/composables/index/useGlobalIndexSnapshots";

vi.mock("@/api/index", () => ({
  fetchIndexSnapshots: vi.fn(),
}));

const { fetchIndexSnapshots } = await import("@/api/index");
const mockedFetchIndexSnapshots = vi.mocked(fetchIndexSnapshots);

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

const mountUseGlobalIndexSnapshots = () => {
  const queryClient = createQueryClient();
  let exposed!: ReturnType<typeof useGlobalIndexSnapshots>;

  const Host = defineComponent({
    setup() {
      exposed = useGlobalIndexSnapshots();
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

describe("useGlobalIndexSnapshots", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedFetchIndexSnapshots.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches the shared global index snapshots once by default", async () => {
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

    const { exposed, wrapper, queryClient } = mountUseGlobalIndexSnapshots();
    await flushPromises();

    vi.advanceTimersByTime(60_000);
    await flushPromises();

    expect(mockedFetchIndexSnapshots).toHaveBeenCalledTimes(1);
    expect(exposed.dataList.value).toHaveLength(1);
    expect(exposed.dataList.value[0]?.f12).toBe("SPX");

    wrapper.unmount();
    queryClient.clear();
  });

  it("exposes an error state when the snapshot request fails", async () => {
    mockedFetchIndexSnapshots.mockRejectedValueOnce(new Error("network"));

    const { exposed, wrapper, queryClient } = mountUseGlobalIndexSnapshots();
    await flushPromises();

    expect(exposed.isError.value).toBe(true);
    expect(exposed.dataList.value).toEqual([]);

    wrapper.unmount();
    queryClient.clear();
  });
});
