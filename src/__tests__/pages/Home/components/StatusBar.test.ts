import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import StatusBar from "@/pages/Home/components/StatusBar/StatusBar.vue";

vi.mock("@/utils/marketStatus", () => ({
  isDuringDate: () => false,
}));

describe("StatusBar", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders only market status, last update, version, and settings entry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-28T16:35:12+08:00"));

    const wrapper = mount(StatusBar, {
      props: {
        lastUpdateTime: new Date("2026-03-28T16:34:56+08:00"),
      },
    });

    expect(wrapper.text()).toContain("股市已收盘");
    expect(wrapper.text()).toContain("最后更新");
    expect(wrapper.text()).toContain("16:34:56");
    expect(wrapper.text()).toMatch(/v\d+\.\d+\.\d+/);
    expect(wrapper.text()).not.toContain("vundefined");
    expect(wrapper.text()).toContain("设置");

    expect(wrapper.text()).not.toContain("自选");
    expect(wrapper.text()).not.toContain("编辑");
    expect(wrapper.text()).not.toContain("03/28");
    expect(wrapper.text()).not.toContain("周六");

    vi.useRealTimers();
  });
});
