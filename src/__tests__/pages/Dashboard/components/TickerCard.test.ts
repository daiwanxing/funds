import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TickerCard from "@/pages/Dashboard/components/GlobalTicker/TickerCard.vue";

describe("TickerCard", () => {
  it("keeps unused width on the right during an unfinished trading session", () => {
    const wrapper = mount(TickerCard, {
      props: {
        item: {
          f2: 3884.56,
          f3: -0.75,
          f4: -29.16,
          f12: "000001",
          f13: 1,
          f14: "上证指数",
          prePrice: 3913.72,
          trendSessionMinutes: 240,
          trendPoints: [
            { price: 3884.28, elapsedMinutes: 0, time: "09:30" },
            { price: 3890.2, elapsedMinutes: 30, time: "10:00" },
            { price: 3882.91, elapsedMinutes: 120, time: "11:30" },
          ],
        },
      },
    });

    const [linePath] = wrapper.findAll("path");
    expect(linePath.attributes("d")).toContain("L 40.00");
    expect(linePath.attributes("d")).not.toContain("L 80.00");
  });
});
