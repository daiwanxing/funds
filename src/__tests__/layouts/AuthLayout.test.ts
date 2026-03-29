import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import AuthLayout from "@/layouts/AuthLayout.vue";

vi.mock("@/components/ui/Globe.vue", () => ({
  default: {
    name: "UiGlobeStub",
    template: '<div class="globe-stub" />',
    props: ["items"],
  },
}));

describe("AuthLayout", () => {
  it("renders hero copy above the globe area", () => {
    const wrapper = mount(AuthLayout, {
      slots: {
        default: '<div class="slot-body">form</div>',
      },
    });

    expect(wrapper.text()).toContain("See Markets First");
    expect(wrapper.text()).toContain("聚合全球主要市场信号，助您建立更清晰的基金决策依据。");
    expect(wrapper.find(".globe-stub").exists()).toBe(true);
  });
});
