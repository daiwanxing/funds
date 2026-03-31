import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import axios from "axios";
import { fetchIndexTrends } from "@/api/index";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedAxiosGet = vi.mocked(axios.get);

describe("fetchIndexTrends", () => {
  beforeEach(() => {
    mockedAxiosGet.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses only current session points after the A-share market opens", async () => {
    vi.setSystemTime(new Date("2026-03-30T09:48:00+08:00"));
    mockedAxiosGet.mockResolvedValueOnce({
      data: {
        data: {
          prePrice: 3913.72,
          trends: [
            "2026-03-30 09:15,3913.72",
            "2026-03-30 09:29,3884.28",
            "2026-03-30 09:30,3884.28",
            "2026-03-30 09:31,3890.20",
            "2026-03-30 09:48,3892.46",
          ],
        },
      },
    });

    await expect(fetchIndexTrends(["1.000001"])).resolves.toEqual([
      {
        code: "1.000001",
        prePrice: 3913.72,
        points: [
          { price: 3884.28, elapsedMinutes: 0, time: "09:30" },
          { price: 3890.2, elapsedMinutes: 1, time: "09:31" },
          { price: 3892.46, elapsedMinutes: 18, time: "09:48" },
        ],
        sessionMinutes: 240,
        isTodayData: true,
      },
    ]);

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining("/api/index/api/qt/stock/trends2/get?secid=1.000001"),
    );
    expect(mockedAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining("ndays=2"),
    );
  });

  it("keeps the full current trading day after the A-share market closes", async () => {
    vi.setSystemTime(new Date("2026-03-30T16:00:00+08:00"));
    mockedAxiosGet.mockResolvedValueOnce({
      data: {
        data: {
          prePrice: 3913.72,
          trends: [
            "2026-03-27 15:00,3880.00",
            "2026-03-30 09:30,3884.28",
            "2026-03-30 11:30,3895.00",
            "2026-03-30 13:00,3890.00",
            "2026-03-30 15:00,3884.06",
          ],
        },
      },
    });

    await expect(fetchIndexTrends(["1.000001"])).resolves.toEqual([
      {
        code: "1.000001",
        prePrice: 3913.72,
        points: [
          { price: 3884.28, elapsedMinutes: 0, time: "09:30" },
          { price: 3895, elapsedMinutes: 120, time: "11:30" },
          { price: 3890, elapsedMinutes: 120, time: "13:00" },
          { price: 3884.06, elapsedMinutes: 240, time: "15:00" },
        ],
        sessionMinutes: 240,
        isTodayData: true,
      },
    ]);
  });

  it("falls back to the previous trading day before the A-share market opens", async () => {
    vi.setSystemTime(new Date("2026-03-30T09:20:00+08:00"));
    mockedAxiosGet.mockResolvedValueOnce({
      data: {
        data: {
          prePrice: 3913.72,
          trends: [
            "2026-03-27 09:30,3852.09",
            "2026-03-27 11:30,3875.00",
            "2026-03-27 13:00,3870.00",
            "2026-03-27 15:00,3880.00",
            "2026-03-30 09:15,3913.72",
            "2026-03-30 09:20,3891.97",
            "2026-03-30 09:29,3884.28",
          ],
        },
      },
    });

    await expect(fetchIndexTrends(["1.000001"])).resolves.toEqual([
      {
        code: "1.000001",
        prePrice: 3913.72,
        points: [
          { price: 3852.09, elapsedMinutes: 0, time: "09:30" },
          { price: 3875, elapsedMinutes: 120, time: "11:30" },
          { price: 3870, elapsedMinutes: 120, time: "13:00" },
          { price: 3880, elapsedMinutes: 240, time: "15:00" },
        ],
        sessionMinutes: 240,
        isTodayData: false,
      },
    ]);
  });

  it("uses the current U.S. session with cross-midnight Beijing timestamps", async () => {
    vi.setSystemTime(new Date("2026-03-28T03:00:00+08:00"));
    mockedAxiosGet.mockResolvedValueOnce({
      data: {
        data: {
          prePrice: 21000,
          trends: [
            "2026-03-27 21:30,21100.00",
            "2026-03-27 22:30,21200.00",
            "2026-03-28 03:00,20980.00",
            "2026-03-28 04:00,20948.36",
          ],
        },
      },
    });

    await expect(fetchIndexTrends(["100.NDX"])).resolves.toEqual([
      {
        code: "100.NDX",
        prePrice: 21000,
        points: [
          { price: 21100, elapsedMinutes: 0, time: "21:30" },
          { price: 21200, elapsedMinutes: 60, time: "22:30" },
          { price: 20980, elapsedMinutes: 330, time: "03:00" },
        ],
        sessionMinutes: 390,
        isTodayData: true,
      },
    ]);
  });

  it("keeps successful trend payloads when one index request fails", async () => {
    vi.setSystemTime(new Date("2026-03-30T09:48:00+08:00"));
    mockedAxiosGet
      .mockRejectedValueOnce(new Error("upstream failed"))
      .mockResolvedValueOnce({
        data: {
          data: {
            prePrice: 13500,
            trends: [
              "2026-03-30 09:30,13510.00",
              "2026-03-30 09:48,13600.00",
            ],
          },
        },
      });

    await expect(fetchIndexTrends(["1.000001", "0.399001"])).resolves.toEqual([
      {
        code: "1.000001",
        prePrice: 0,
        points: [],
        sessionMinutes: 240,
        isTodayData: false,
      },
      {
        code: "0.399001",
        prePrice: 13500,
        points: [
          { price: 13510, elapsedMinutes: 0, time: "09:30" },
          { price: 13600, elapsedMinutes: 18, time: "09:48" },
        ],
        sessionMinutes: 240,
        isTodayData: true,
      },
    ]);
  });
});
