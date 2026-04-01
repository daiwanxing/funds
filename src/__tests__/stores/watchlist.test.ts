import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { ref, nextTick } from "vue";
import type { FundListItem } from "@/types/fund";

// ── Mock: auth store ────────────────────────────────────────────

const authIsAuthenticated = ref(false);
const authIsFirstLogin = ref(false);
const authBootstrapIsPending = ref(false);
const authCloudWatchlist = ref<FundListItem[]>([]);

const saveWatchlistMutateAsync = vi.fn();
const importGuestMutateAsync = vi.fn();
const invalidateBootstrap = vi.fn();

vi.mock("@tanstack/vue-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: invalidateBootstrap,
  }),
  useMutation: (opts: { mutationFn: (...args: unknown[]) => unknown; onSuccess?: () => void }) => {
    const mutateAsync = vi.fn(async (...args: unknown[]) => {
      const result = await opts.mutationFn(...args);
      opts.onSuccess?.();
      return result;
    });
    return { mutateAsync };
  },
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    get isAuthenticated() {
      return authIsAuthenticated.value;
    },
    get isFirstLogin() {
      return authIsFirstLogin.value;
    },
    get cloudWatchlist() {
      return authCloudWatchlist.value;
    },
    bootstrap: {
      get isPending() {
        return authBootstrapIsPending.value;
      },
    },
  }),
  BOOTSTRAP_QUERY_KEY: ["auth", "bootstrap"],
}));

vi.mock("@/api/user", () => ({
  putWatchlist: saveWatchlistMutateAsync,
  importGuestWatchlist: importGuestMutateAsync,
}));

// ── sessionStorage mock ─────────────────────────────────────────

const sessionStorageMap = new Map<string, string>();
const sessionStorageMock = {
  getItem: vi.fn((key: string) => sessionStorageMap.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => sessionStorageMap.set(key, value)),
  removeItem: vi.fn((key: string) => sessionStorageMap.delete(key)),
};
Object.defineProperty(globalThis, "sessionStorage", {
  value: sessionStorageMock,
  writable: true,
});

// ── Import the store under test (after mocks) ───────────────────

// We dynamically import to ensure mocks are in place
let useWatchlistStore: typeof import("@/stores/watchlist").useWatchlistStore;

beforeEach(async () => {
  // Reset all state
  setActivePinia(createPinia());
  authIsAuthenticated.value = false;
  authIsFirstLogin.value = false;
  authBootstrapIsPending.value = false;
  authCloudWatchlist.value = [];
  sessionStorageMap.clear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  saveWatchlistMutateAsync.mockReset();
  importGuestMutateAsync.mockReset();
  invalidateBootstrap.mockReset();

  // Fresh import each time
  const mod = await import("@/stores/watchlist");
  useWatchlistStore = mod.useWatchlistStore;
});

// ── Tests ───────────────────────────────────────────────────────

describe("useWatchlistStore", () => {
  describe("guest mode (unauthenticated)", () => {
    it("loads items from sessionStorage on initialization", () => {
      const guestData: FundListItem[] = [
        { code: "000001", num: 100, cost: 1.5 },
        { code: "000002", num: 200, cost: 2.0 },
      ];
      sessionStorageMap.set("fs_guest_watchlist", JSON.stringify(guestData));

      const store = useWatchlistStore();

      expect(store.items).toEqual(guestData);
    });

    it("returns empty array if sessionStorage is empty", () => {
      const store = useWatchlistStore();

      expect(store.items).toEqual([]);
    });

    it("handles corrupted sessionStorage gracefully", () => {
      sessionStorageMap.set("fs_guest_watchlist", "not-valid-json{{{");

      const store = useWatchlistStore();

      expect(store.items).toEqual([]);
    });

    it("addFund appends to items and persists to sessionStorage", () => {
      const store = useWatchlistStore();

      store.addFund(["000001", "000002"]);

      expect(store.items).toEqual([
        { code: "000001", num: 0, cost: 0 },
        { code: "000002", num: 0, cost: 0 },
      ]);
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        "fs_guest_watchlist",
        expect.any(String),
      );
      const persisted = JSON.parse(
        sessionStorageMock.setItem.mock.calls[0][1],
      );
      expect(persisted).toEqual([
        { code: "000001", num: 0, cost: 0 },
        { code: "000002", num: 0, cost: 0 },
      ]);
    });

    it("addFund skips duplicates", () => {
      const store = useWatchlistStore();
      store.addFund(["000001"]);
      store.addFund(["000001", "000002"]);

      expect(store.items.length).toBe(2);
      expect(store.items.map((i: FundListItem) => i.code)).toEqual(["000001", "000002"]);
    });

    it("removeFund removes from items and updates sessionStorage", () => {
      sessionStorageMap.set(
        "fs_guest_watchlist",
        JSON.stringify([
          { code: "000001", num: 0, cost: 0 },
          { code: "000002", num: 0, cost: 0 },
        ]),
      );
      const store = useWatchlistStore();

      store.removeFund("000001");

      expect(store.items).toEqual([{ code: "000002", num: 0, cost: 0 }]);
    });

    it("updateFund updates num/cost and persists", () => {
      sessionStorageMap.set(
        "fs_guest_watchlist",
        JSON.stringify([{ code: "000001", num: 0, cost: 0 }]),
      );
      const store = useWatchlistStore();

      store.updateFund("000001", { num: 500, cost: 1.8 });

      expect(store.items[0]).toEqual({ code: "000001", num: 500, cost: 1.8 });
    });

    it("replaceAll replaces all items and persists", () => {
      const store = useWatchlistStore();
      store.addFund(["000001"]);

      const newItems: FundListItem[] = [
        { code: "000003", num: 10, cost: 3.0 },
      ];
      store.replaceAll(newItems);

      expect(store.items).toEqual(newItems);
    });

    it("does not call cloud API in guest mode", () => {
      const store = useWatchlistStore();
      store.addFund(["000001"]);
      store.removeFund("000001");

      expect(saveWatchlistMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe("auth transition: login", () => {
    it("switches to cloud watchlist data on login", async () => {
      const store = useWatchlistStore();
      store.addFund(["guest-001"]);

      // Simulate login
      authCloudWatchlist.value = [{ code: "cloud-001", num: 50, cost: 2.0 }];
      authIsAuthenticated.value = true;
      await nextTick();

      expect(store.items).toEqual([{ code: "cloud-001", num: 50, cost: 2.0 }]);
    });

    it("clears sessionStorage on login", async () => {
      sessionStorageMap.set(
        "fs_guest_watchlist",
        JSON.stringify([{ code: "guest-001", num: 0, cost: 0 }]),
      );
      const store = useWatchlistStore();
      expect(store.items.length).toBe(1);

      authIsAuthenticated.value = true;
      authCloudWatchlist.value = [];
      await nextTick();

      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
        "fs_guest_watchlist",
      );
    });
  });

  describe("auth transition: logout", () => {
    it("clears items immediately on logout", async () => {
      // Start as authenticated
      authIsAuthenticated.value = true;
      authCloudWatchlist.value = [{ code: "cloud-001", num: 50, cost: 2.0 }];
      const store = useWatchlistStore();
      await nextTick();
      expect(store.items.length).toBe(1);

      // Simulate logout
      authIsAuthenticated.value = false;
      authCloudWatchlist.value = [];
      await nextTick();

      expect(store.items).toEqual([]);
    });
  });

  describe("authenticated mode", () => {
    it("addFund calls cloud API to persist", async () => {
      authIsAuthenticated.value = true;
      authCloudWatchlist.value = [];
      const store = useWatchlistStore();
      await nextTick();

      store.addFund(["000001"]);

      expect(saveWatchlistMutateAsync).toHaveBeenCalled();
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
    });

    it("removeFund calls cloud API to persist", async () => {
      authIsAuthenticated.value = true;
      authCloudWatchlist.value = [{ code: "000001", num: 0, cost: 0 }];
      const store = useWatchlistStore();
      await nextTick();

      store.removeFund("000001");

      expect(saveWatchlistMutateAsync).toHaveBeenCalled();
    });

    it("does not write to sessionStorage in authenticated mode", async () => {
      authIsAuthenticated.value = true;
      authCloudWatchlist.value = [];
      const store = useWatchlistStore();
      await nextTick();

      store.addFund(["000001"]);
      store.removeFund("000001");

      expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe("import prompt", () => {
    it("shouldShowImportPrompt is true when first login with guest data and empty cloud", async () => {
      // Guest has data
      sessionStorageMap.set(
        "fs_guest_watchlist",
        JSON.stringify([{ code: "guest-001", num: 0, cost: 0 }]),
      );

      const store = useWatchlistStore();
      expect(store.shouldShowImportPrompt).toBe(false);

      // Simulate first-time login
      authIsFirstLogin.value = true;
      authIsAuthenticated.value = true;
      authCloudWatchlist.value = [];

      // The store needs to detect the guest data that was present before login
      await nextTick();

      expect(store.shouldShowImportPrompt).toBe(true);
    });

    it("shouldShowImportPrompt is false when cloud already has data", async () => {
      sessionStorageMap.set(
        "fs_guest_watchlist",
        JSON.stringify([{ code: "guest-001", num: 0, cost: 0 }]),
      );

      const store = useWatchlistStore();

      authIsFirstLogin.value = true;
      authIsAuthenticated.value = true;
      authCloudWatchlist.value = [{ code: "cloud-001", num: 0, cost: 0 }];
      await nextTick();

      expect(store.shouldShowImportPrompt).toBe(false);
    });

    it("shouldShowImportPrompt is false for non-first login", async () => {
      sessionStorageMap.set(
        "fs_guest_watchlist",
        JSON.stringify([{ code: "guest-001", num: 0, cost: 0 }]),
      );

      const store = useWatchlistStore();

      authIsFirstLogin.value = false;
      authIsAuthenticated.value = true;
      authCloudWatchlist.value = [];
      await nextTick();

      expect(store.shouldShowImportPrompt).toBe(false);
    });

    it("dismissImportPrompt hides the prompt", async () => {
      sessionStorageMap.set(
        "fs_guest_watchlist",
        JSON.stringify([{ code: "guest-001", num: 0, cost: 0 }]),
      );

      const store = useWatchlistStore();

      authIsFirstLogin.value = true;
      authIsAuthenticated.value = true;
      authCloudWatchlist.value = [];
      await nextTick();
      expect(store.shouldShowImportPrompt).toBe(true);

      store.dismissImportPrompt();
      expect(store.shouldShowImportPrompt).toBe(false);
    });

    it("importGuestFunds calls API, clears sessionStorage, and dismisses prompt", async () => {
      const guestFunds: FundListItem[] = [
        { code: "guest-001", num: 10, cost: 1.5 },
      ];
      sessionStorageMap.set(
        "fs_guest_watchlist",
        JSON.stringify(guestFunds),
      );

      const store = useWatchlistStore();

      authIsFirstLogin.value = true;
      authIsAuthenticated.value = true;
      authCloudWatchlist.value = [];
      await nextTick();

      await store.importGuestFunds();

      expect(importGuestMutateAsync).toHaveBeenCalledWith([
        { fundCode: "guest-001", num: 10, cost: 1.5, sortOrder: 0 },
      ]);
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
        "fs_guest_watchlist",
      );
      expect(store.shouldShowImportPrompt).toBe(false);
    });
  });

  describe("isReady", () => {
    it("is false while bootstrap is pending", () => {
      authBootstrapIsPending.value = true;
      const store = useWatchlistStore();

      expect(store.isReady).toBe(false);
    });

    it("is true when bootstrap is complete", () => {
      authBootstrapIsPending.value = false;
      const store = useWatchlistStore();

      expect(store.isReady).toBe(true);
    });
  });
});
