import { describe, it, expect, vi } from "vitest";
import {
  checkHoliday,
  isDuringDate,
  setHolidayData,
} from "@/utils/marketStatus";

describe("checkHoliday", () => {
  it("identifies holidays correctly", () => {
    setHolidayData({
      data: {
        "2026": {
          "01-01": { holiday: true },
          "10-01": { holiday: true },
        },
      },
    });
    expect(checkHoliday(new Date("2026-01-01"))).toBe(true);
    expect(checkHoliday(new Date("2026-10-01"))).toBe(true);
  });

  it("returns false for non-holidays", () => {
    setHolidayData({
      data: {
        "2026": {
          "01-01": { holiday: true },
        },
      },
    });
    expect(checkHoliday(new Date("2026-01-02"))).toBe(false);
  });

  it("returns false when no holiday data", () => {
    setHolidayData({});
    expect(checkHoliday(new Date("2026-01-01"))).toBe(false);
  });
});

describe("isDuringDate", () => {
  it("returns false on a Saturday", () => {
    // 2026-03-28 is a Saturday
    vi.setSystemTime(new Date("2026-03-28T10:00:00+08:00"));
    setHolidayData({ data: {} });
    expect(isDuringDate()).toBe(false);
    vi.useRealTimers();
  });

  it("returns false on a Sunday", () => {
    // 2026-03-29 is a Sunday
    vi.setSystemTime(new Date("2026-03-29T10:00:00+08:00"));
    setHolidayData({ data: {} });
    expect(isDuringDate()).toBe(false);
    vi.useRealTimers();
  });

  it("returns true during morning trading hours on a weekday", () => {
    // 2026-03-27 is a Friday, 10:00 AM CST
    vi.setSystemTime(new Date("2026-03-27T10:00:00+08:00"));
    setHolidayData({ data: {} });
    expect(isDuringDate()).toBe(true);
    vi.useRealTimers();
  });

  it("returns true during afternoon trading hours on a weekday", () => {
    // 2026-03-27 is a Friday, 2:00 PM CST
    vi.setSystemTime(new Date("2026-03-27T14:00:00+08:00"));
    setHolidayData({ data: {} });
    expect(isDuringDate()).toBe(true);
    vi.useRealTimers();
  });

  it("returns false outside trading hours on a weekday", () => {
    // 2026-03-27 is a Friday, 8:00 AM CST (before 9:30)
    vi.setSystemTime(new Date("2026-03-27T08:00:00+08:00"));
    setHolidayData({ data: {} });
    expect(isDuringDate()).toBe(false);
    vi.useRealTimers();
  });

  it("returns false on holidays", () => {
    // 2026-03-27 is a Friday, but marked holiday
    vi.setSystemTime(new Date("2026-03-27T10:00:00+08:00"));
    setHolidayData({
      data: {
        "2026": {
          "03-27": { holiday: true },
        },
      },
    });
    expect(isDuringDate()).toBe(false);
    vi.useRealTimers();
  });
});
