import type { GlobeMarketItem } from "@/types/globe";

export const AUTH_GLOBE_MARKETS: GlobeMarketItem[] = [
  {
    id: "spx",
    label: "S&P 500",
    change: "+1.24%",
    tone: "up",
    location: [40.7128, -74.006],
    size: 0.034,
    labelOffset: [-22, -12],
  },
  {
    id: "shcomp",
    label: "SH COMP",
    change: "-0.45%",
    tone: "down",
    location: [31.2304, 121.4737],
    size: 0.036,
    labelOffset: [-48, 22],
  },
  {
    id: "hsi",
    label: "HSI",
    change: "-0.31%",
    tone: "down",
    location: [22.3193, 114.1694],
    size: 0.032,
    labelOffset: [26, 4],
  },
  {
    id: "n225",
    label: "N225",
    change: "+0.58%",
    tone: "up",
    location: [35.6762, 139.6503],
    size: 0.033,
    labelOffset: [-4, -28],
  },
  {
    id: "nasdaq",
    label: "NASDAQ",
    change: "+0.82%",
    tone: "up",
    location: [37.7749, -122.4194],
    size: 0.034,
    labelOffset: [-54, -18],
  },
];
