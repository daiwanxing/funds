import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "@/utils/storage";

describe("storage", () => {
  beforeEach(() => localStorage.clear());

  it("stores and retrieves data", () => {
    storage.set({ darkMode: true });
    storage.get(["darkMode"], (res) => {
      expect(res.darkMode).toBe(true);
    });
  });

  it("stores multiple keys", () => {
    storage.set({ darkMode: true, userId: "u-1", seciList: ["1.000001"] });
    storage.get(["darkMode", "userId", "seciList"], (res) => {
      expect(res.darkMode).toBe(true);
      expect(res.userId).toBe("u-1");
      expect(res.seciList).toEqual(["1.000001"]);
    });
  });

  it("returns empty object for missing keys", () => {
    storage.get(["RealtimeFundcode"], (res) => {
      expect(res).toEqual({});
    });
  });

  it("returns all data when keys is null", () => {
    storage.set({ darkMode: true, userId: "u-2" });
    storage.get(null, (res) => {
      expect(res).toEqual({ darkMode: true, userId: "u-2" });
    });
  });

  it("accepts string key shorthand", () => {
    storage.set({ userId: "value" });
    storage.get("userId", (res) => {
      expect(res.userId).toBe("value");
    });
  });

  it("overwrites existing keys", () => {
    storage.set({ showBadge: 1 });
    storage.set({ showBadge: 2 });
    storage.get(["showBadge"], (res) => {
      expect(res.showBadge).toBe(2);
    });
  });

  it("calls callback after set", () => {
    let called = false;
    storage.set({ darkMode: true }, () => {
      called = true;
    });
    expect(called).toBe(true);
  });
});
