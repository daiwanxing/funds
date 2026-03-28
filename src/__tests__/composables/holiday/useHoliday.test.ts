import { describe, it, expect, beforeEach, vi } from "vitest";
import { defineComponent } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { useHoliday } from "@/composables/holiday/useHoliday";
import { storage } from "@/utils/storage";
import type { HolidayData } from "@/types/holiday";

const { setHolidayDataMock } = vi.hoisted(() => ({
  setHolidayDataMock: vi.fn(),
}));

vi.mock("@/api/holiday", () => ({
  fetchRemoteHoliday: vi.fn(),
}));

vi.mock("@/utils/storage", () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock("@/utils/marketStatus", async () => {
  const actual = await vi.importActual<typeof import("@/utils/marketStatus")>(
    "@/utils/marketStatus",
  );

  return {
    ...actual,
    setHolidayData: setHolidayDataMock,
  };
});

const { fetchRemoteHoliday } = await import("@/api/holiday");
const mockedFetchRemoteHoliday = vi.mocked(fetchRemoteHoliday);
const mockedStorageGet = vi.mocked(storage.get);
const mockedStorageSet = vi.mocked(storage.set);

const cachedHoliday: HolidayData = {
  data: {
    "2026": {
      "03-27": { holiday: true },
    },
  },
};

const remoteHoliday: HolidayData = {
  data: {
    "2026": {
      "04-06": { holiday: true },
    },
  },
};

const mountUseHoliday = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  let exposed!: ReturnType<typeof useHoliday>;

  const Host = defineComponent({
    setup() {
      exposed = useHoliday();
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

describe("useHoliday", () => {
  beforeEach(() => {
    mockedFetchRemoteHoliday.mockReset();
    mockedStorageGet.mockReset();
    mockedStorageSet.mockReset();
    setHolidayDataMock.mockReset();
  });

  it("hydrates from storage without hitting the network", async () => {
    mockedStorageGet.mockImplementation((_keys, callback) => {
      callback({ holiday: cachedHoliday });
    });

    const { exposed, wrapper, queryClient } = mountUseHoliday();
    await flushPromises();

    expect(exposed.holiday.value).toEqual(cachedHoliday);
    expect(mockedFetchRemoteHoliday).not.toHaveBeenCalled();
    expect(setHolidayDataMock).toHaveBeenCalledWith(cachedHoliday);

    wrapper.unmount();
    queryClient.clear();
  });

  it("fetches remotely when no storage cache exists and persists the result", async () => {
    mockedStorageGet.mockImplementation((_keys, callback) => {
      callback({});
    });
    mockedFetchRemoteHoliday.mockResolvedValueOnce(remoteHoliday);

    const { exposed, wrapper, queryClient } = mountUseHoliday();
    await flushPromises();

    expect(mockedFetchRemoteHoliday).toHaveBeenCalledTimes(1);
    expect(exposed.holiday.value).toEqual(remoteHoliday);
    expect(setHolidayDataMock).toHaveBeenCalledWith(remoteHoliday);
    expect(mockedStorageSet).toHaveBeenCalledWith({ holiday: remoteHoliday });

    wrapper.unmount();
    queryClient.clear();
  });
});
