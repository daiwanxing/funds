import { mount } from "@vue/test-utils";
import { computed } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthLayout from "@/layouts/AuthLayout.vue";
import type { GlobeMarketItem } from "@/types/globe";

const { useAuthGlobeMarketsMock } = vi.hoisted(() => ({
  useAuthGlobeMarketsMock: vi.fn(),
}));

vi.mock("@/pages/Authentication/components/Globe/Globe.vue", () => ({
  default: {
    name: "UiGlobeStub",
    template: '<div class="globe-stub" :data-count="items.length" />',
    props: ["items"],
  },
}));

vi.mock("@/pages/Authentication/composables/useAuthGlobeMarkets", () => ({
  useAuthGlobeMarkets: useAuthGlobeMarketsMock,
}));

const createItems = (count: number): GlobeMarketItem[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `market-${index}`,
    label: `Market ${index + 1}`,
    change: "+1.00%",
    tone: "up" as const,
    location: [30 + index, 120 + index] as [number, number],
  }));
};

describe("AuthLayout", () => {
  beforeEach(() => {
    useAuthGlobeMarketsMock.mockReset();
    useAuthGlobeMarketsMock.mockReturnValue({
      items: computed(() => createItems(7)),
      isLoading: computed(() => false),
      refetch: vi.fn(),
    });
  });

  it("renders hero copy above the globe area and passes the curated globe markets", () => {
    const wrapper = mount(AuthLayout, {
      slots: {
        default: '<div class="slot-body">form</div>',
      },
    });

    expect(wrapper.text()).toContain("See Markets First");
    expect(wrapper.text()).toContain("聚合全球主要市场信号，助您建立更清晰的基金决策依据。");
    expect(wrapper.find(".globe-stub").exists()).toBe(true);
    expect(wrapper.get(".globe-stub").attributes("data-count")).toBe("7");
  });

  it("keeps the globe visible when no market badges are available", () => {
    useAuthGlobeMarketsMock.mockReturnValueOnce({
      items: computed(() => []),
      isLoading: computed(() => false),
      refetch: vi.fn(),
    });

    const wrapper = mount(AuthLayout, {
      slots: {
        default: '<div class="slot-body">form</div>',
      },
    });

    expect(wrapper.find(".globe-stub").exists()).toBe(true);
    expect(wrapper.get(".globe-stub").attributes("data-count")).toBe("0");
  });
});
