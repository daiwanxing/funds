export type GlobeTone = "up" | "down" | "flat";

export interface GlobeMarketItem {
  id: string;
  label: string;
  change: string;
  tone: GlobeTone;
  location: [number, number];
  size?: number;
  labelOffset?: [number, number];
}
