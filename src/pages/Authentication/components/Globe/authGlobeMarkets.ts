import { getGlobalIndexSecid } from "@/composables/index/globalIndices";
import type { GlobalIndexSnapshot } from "@/types/market";
import type { GlobeMarketItem } from "@/types/globe";

interface AuthGlobeMarketDefinition {
  id: string;
  secid: string;
  label: string;
  location: [number, number];
  size?: number;
  labelOffset?: [number, number];
}

const AUTH_GLOBE_MARKET_DEFINITIONS: AuthGlobeMarketDefinition[] = [
  {
    id: "spx",
    secid: "100.SPX",
    label: "S&P 500",
    location: [40.7128, -74.006],
    size: 0.017,
    labelOffset: [-16, -14],
  },
  {
    id: "nasdaq",
    secid: "100.NDX",
    label: "NASDAQ",
    location: [37.7749, -122.4194],
    size: 0.017,
    labelOffset: [-56, -6],
  },
  {
    id: "djia",
    secid: "100.DJIA",
    label: "Dow Jones",
    location: [41.8781, -87.6298],
    size: 0.016,
    labelOffset: [-8, 24],
  },
  {
    id: "hang-seng",
    secid: "100.HSI",
    label: "Hang Seng",
    location: [22.3193, 114.1694],
    size: 0.016,
    labelOffset: [28, 0],
  },
  {
    id: "nikkei",
    secid: "100.N225",
    label: "Nikkei 225",
    location: [35.6762, 139.6503],
    size: 0.016,
    labelOffset: [22, -28],
  },
  {
    id: "shanghai",
    secid: "1.000001",
    label: "上证指数",
    location: [31.2304, 121.4737],
    size: 0.018,
    labelOffset: [-58, 18],
  },
  {
    id: "a50",
    secid: "100.XIN9",
    label: "富时中国 A50",
    location: [39.9042, 116.4074],
    size: 0.016,
    labelOffset: [-12, -10],
  },
];

const resolveTone = (changeValue: number): GlobeMarketItem["tone"] => {
  if (changeValue > 0) return "up";
  if (changeValue < 0) return "down";
  return "flat";
};

const formatChange = (changeValue: number) => {
  if (changeValue > 0) return `+${changeValue.toFixed(2)}%`;
  return `${changeValue.toFixed(2)}%`;
};

export const mapSnapshotsToAuthGlobeMarkets = (
  snapshots: GlobalIndexSnapshot[],
): GlobeMarketItem[] => {
  const snapshotMap = new Map(
    snapshots.map((snapshot) => [getGlobalIndexSecid(snapshot), snapshot]),
  );

  return AUTH_GLOBE_MARKET_DEFINITIONS.flatMap((definition) => {
    const snapshot = snapshotMap.get(definition.secid);
    if (!snapshot) return [];

    const changeValue = Number(snapshot.f3);
    if (Number.isNaN(changeValue)) return [];

    return [{
      id: definition.id,
      label: definition.label,
      change: formatChange(changeValue),
      tone: resolveTone(changeValue),
      location: definition.location,
      size: definition.size,
      labelOffset: definition.labelOffset,
    }];
  });
};

export const AUTH_GLOBE_MARKET_COUNT = AUTH_GLOBE_MARKET_DEFINITIONS.length;
