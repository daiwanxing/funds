import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Globe from "@/pages/Authentication/components/Globe/Globe.vue";
import type { GlobeMarketItem } from "@/types/globe";
import type { COBEOptions } from "cobe";

const { createGlobeMock } = vi.hoisted(() => ({
  createGlobeMock: vi.fn(() => ({
    update: vi.fn(),
    destroy: vi.fn(),
  })),
}));

vi.mock("cobe", () => ({
  default: createGlobeMock,
}));

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

let scheduledFrame: FrameRequestCallback | null = null;

const marketItems = [
  {
    id: "spx",
    label: "S&P 500",
    change: "+1.24%",
    tone: "up" as const,
    location: [40.7128, -74.006] as [number, number],
    size: 0.034,
    labelOffset: [-42, -18] as [number, number],
  },
  {
    id: "ndx",
    label: "NASDAQ",
    change: "+0.82%",
    tone: "up" as const,
    location: [37.7749, -122.4194] as [number, number],
    size: 0.034,
    labelOffset: [12, -8] as [number, number],
  },
  {
    id: "shcomp",
    label: "SH COMP",
    change: "-0.45%",
    tone: "down" as const,
    location: [31.2304, 121.4737] as [number, number],
    size: 0.034,
    labelOffset: [-14, 10] as [number, number],
  },
] satisfies GlobeMarketItem[];

describe("Globe", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      scheduledFrame = callback;
      return 1;
    }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    createGlobeMock.mockClear();
    scheduledFrame = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders market labels and configures cobe with arcs and markers", async () => {
    const wrapper = mount(Globe, {
      props: {
        items: marketItems,
      },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("S&P 500");
    expect(wrapper.text()).toContain("+1.24%");
    expect(wrapper.text()).toContain("SH COMP");
    expect(wrapper.findAll(".market-badge")).toHaveLength(marketItems.length);
    expect(wrapper.findAll(".market-badge-label")).toHaveLength(0);
    expect(createGlobeMock).toHaveBeenCalledTimes(1);

    expect(createGlobeMock.mock.calls[0]).toBeDefined();
    const [, options] = createGlobeMock.mock.calls[0] as unknown as [
      HTMLCanvasElement,
      COBEOptions,
    ];
    expect(options.markers).toBeDefined();
    if (!options.markers) {
      throw new Error("createGlobe markers missing");
    }

    expect(options.markers).toHaveLength(marketItems.length);
    expect(options.markers[0]).toMatchObject({
      id: "spx",
      location: [40.7128, -74.006],
    });
    expect(options.markers[0]?.size).toBeCloseTo(0.034, 3);
    expect(options.arcs).toBeUndefined();
    expect(options.markerElevation).toBeGreaterThan(0);

    wrapper.unmount();
  });

  it("animates by updating only globe rotation on each frame", async () => {
    const wrapper = mount(Globe, {
      props: {
        items: marketItems,
      },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();

    const globeInstance = createGlobeMock.mock.results[0]?.value as
      | { update: ReturnType<typeof vi.fn> }
      | undefined;

    expect(globeInstance).toBeDefined();
    if (!globeInstance) {
      throw new Error("globe instance missing");
    }

    expect(scheduledFrame).not.toBeNull();
    scheduledFrame?.(16.7);

    expect(globeInstance.update).toHaveBeenCalled();
    expect(globeInstance.update).toHaveBeenLastCalledWith({
      phi: expect.any(Number),
      theta: 0.28,
    });

    wrapper.unmount();
  });
});
