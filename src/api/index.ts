import axios from "axios";
import type {
  GlobalIndexSnapshot,
  GlobalIndicesSnapshotApiResponse,
  GlobalIndexTrendApiResponse,
  GlobalIndexTrendPoint,
  GlobalIndexTrendItem,
  IndexItem,
} from "@/types/market";

import { INDEX_FIELDS, MARKET_SESSION_CONFIG, type MarketSessionConfig, type TradingWindow } from "@/constants";

export const fetchIndexSnapshots = async (
  secids: string[],
): Promise<GlobalIndexSnapshot[]> => {
  if (secids.length === 0) return [];

  const url = `/api/index/api/qt/ulist.np/get?fltt=2&fields=${INDEX_FIELDS}&secids=${secids.join(",")}&_=${Date.now()}`;
  const { data } = await axios.get<GlobalIndicesSnapshotApiResponse>(url);
  return data?.data?.diff ?? [];
};

interface ParsedTrendPoint {
  marketDate: string;
  marketTime: string;
  displayTime: string;
  price: number;
}

const toMinutes = (value: string): number => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const getTotalSessionMinutes = (sessions: TradingWindow[]): number => {
  return sessions.reduce((total, [start, end]) => {
    return total + (toMinutes(end) - toMinutes(start));
  }, 0);
};

const getElapsedTradingMinutes = (
  time: string,
  sessions: TradingWindow[],
): number | null => {
  let elapsed = 0;
  const target = toMinutes(time);

  for (const [start, end] of sessions) {
    const startMinutes = toMinutes(start);
    const endMinutes = toMinutes(end);

    if (target < startMinutes) {
      return null;
    }

    if (target <= endMinutes) {
      return elapsed + (target - startMinutes);
    }

    elapsed += endMinutes - startMinutes;
  }

  return null;
};

const getDateTimePartsInTimeZone = (
  date: Date,
  timeZone: string,
): { date: string; time: string } => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const valueByType = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    date: `${valueByType.year}-${valueByType.month}-${valueByType.day}`,
    time: `${valueByType.hour}:${valueByType.minute}`,
  };
};

const parseTrendPoint = (
  trend: string,
  config: MarketSessionConfig,
): ParsedTrendPoint | null => {
  const [dateTimePart, pricePart] = trend.split(",");
  if (!dateTimePart || !pricePart) return null;

  const price = parseFloat(pricePart);
  const normalizedDateTime = dateTimePart.replace(" ", "T") + ":00+08:00";
  const date = new Date(normalizedDateTime);

  if (Number.isNaN(date.getTime()) || Number.isNaN(price)) return null;

  const marketParts = getDateTimePartsInTimeZone(date, config.timeZone);
  const [, displayTime = ""] = dateTimePart.split(" ");

  return {
    marketDate: marketParts.date,
    marketTime: marketParts.time,
    displayTime,
    price,
  };
};

const pickSessionDate = (
  dates: string[],
  currentMarketDate: string,
  currentMarketTime: string,
  sessions: TradingWindow[],
): string => {
  const latestDate = dates.at(-1) ?? "";
  if (!latestDate) return "";

  const firstSessionStart = sessions[0]?.[0] ?? "00:00";
  if (
    dates.includes(currentMarketDate) &&
    currentMarketTime >= firstSessionStart
  ) {
    return currentMarketDate;
  }

  const earlierDates = dates.filter((date) => date < currentMarketDate);
  return earlierDates.at(-1) ?? latestDate;
};

const isIntradaySession = (
  currentMarketTime: string,
  sessions: TradingWindow[],
): boolean => {
  const firstSessionStart = sessions[0]?.[0] ?? "00:00";
  const lastSessionEnd = sessions.at(-1)?.[1] ?? "23:59";
  return currentMarketTime >= firstSessionStart && currentMarketTime <= lastSessionEnd;
};

export const fetchIndexTrends = async (
  secids: string[],
): Promise<GlobalIndexTrendItem[]> => {
  const responses = await Promise.all(
    secids.map(async (code) => {
      const config = MARKET_SESSION_CONFIG[code] ?? MARKET_SESSION_CONFIG["1.000001"];
      const url = `/api/kline/api/qt/stock/trends2/get?secid=${code}&fields1=f1,f2&fields2=f51,f53&ndays=2&_=${Date.now()}`;
      const { data } = await axios.get<GlobalIndexTrendApiResponse>(url);
      const trendData = data?.data;

      if (!trendData) {
        return {
          code,
          prePrice: 0,
          points: [],
          sessionMinutes: getTotalSessionMinutes(config.sessions),
          isTodayData: false,
        };
      }

      const currentMarket = getDateTimePartsInTimeZone(new Date(), config.timeZone);
      const parsedPoints = (trendData.trends ?? [])
        .map((trend) => parseTrendPoint(trend, config))
        .filter((point): point is ParsedTrendPoint => point !== null);
      const availableDates = [...new Set(parsedPoints.map((point) => point.marketDate))].sort();
      const targetDate = pickSessionDate(
        availableDates,
        currentMarket.date,
        currentMarket.time,
        config.sessions,
      );
      const sessionMinutes = getTotalSessionMinutes(config.sessions);
      const points: GlobalIndexTrendPoint[] = parsedPoints
        .filter((point) => point.marketDate === targetDate)
        .filter((point) => {
          if (targetDate !== currentMarket.date) return true;
          if (!isIntradaySession(currentMarket.time, config.sessions)) return true;
          return point.marketTime <= currentMarket.time;
        })
        .map((point) => {
          const elapsedMinutes = getElapsedTradingMinutes(
            point.marketTime,
            config.sessions,
          );
          if (elapsedMinutes === null) return null;

          return {
            price: point.price,
            elapsedMinutes,
            time: point.displayTime,
          };
        })
        .filter((point): point is GlobalIndexTrendPoint => point !== null);

      return {
        code,
        prePrice: trendData.prePrice ?? 0,
        points,
        sessionMinutes,
        isTodayData: targetDate === currentMarket.date,
      };
    }),
  );

  return responses;
};

export const fetchCustomIndices = async (
  secids: string[],
): Promise<IndexItem[]> => {
  return (await fetchIndexSnapshots(secids)) as IndexItem[];
};
