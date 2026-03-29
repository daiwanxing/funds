import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import FundSavedList from "@/pages/Dashboard/components/FundSavedList.vue";
import type { FundItem } from "@/types/fund";

const createFundItem = (fundcode: string): FundItem => ({
  fundcode,
  name: `基金${fundcode}`,
  jzrq: "2026-03-28",
  dwjz: 1,
  gsz: 1,
  gszzl: 0,
  gztime: "2026-03-28 15:00",
  num: 0,
  cost: 0,
  amount: 0,
  gains: 0,
  costGains: 0,
  costGainsRate: 0,
});

describe("FundSavedList", () => {
  it("shows loading feedback instead of empty state while the first request is pending", () => {
    const wrapper = mount(FundSavedList, {
      props: {
        items: [],
        loading: true,
        activeCode: null,
      },
    });

    expect(wrapper.text()).toContain("正在同步自选持仓");
    expect(wrapper.text()).not.toContain("添加你的第一只基金");
  });

  it("keeps rendering data rows during background refreshes", () => {
    const wrapper = mount(FundSavedList, {
      props: {
        items: [createFundItem("000001")],
        loading: true,
        activeCode: "000001",
      },
    });

    expect(wrapper.text()).toContain("基金000001");
    expect(wrapper.text()).not.toContain("正在同步自选持仓");
  });
});
