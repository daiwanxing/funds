import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import UserBar from "@/pages/Dashboard/components/StatusBar/UserBar.vue";

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    nickname: null,
    email: null,
    avatarUrl: null,
    signOut: { mutateAsync: vi.fn() },
  }),
}));

describe("UserBar", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders guest mode badge when not authenticated", async () => {
    setActivePinia(createPinia());
    const wrapper = mount(UserBar, {
      global: {
        stubs: {
          Dialog: { template: "<div />" },
          Dropdown: { template: "<div />" },
          DropdownItem: { template: "<div />" },
          BrandLogo: { template: "<div />" },
        },
      },
    });

    expect(wrapper.text()).toContain("游客模式入口");
  });
});
