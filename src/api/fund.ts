import axios from "axios";
import type {
  FundQuoteApiResponse,
  FundQuoteResponseItem,
  FundSearchApiResponse,
  FundSearchResponseItem,
} from "@/types/fund";

interface FundEstimateResponseItem {
  fundcode: string;
  gsz?: string;
  gszzl?: string;
  gztime?: string;
}

const parseFundEstimateResponse = (
  payload: string,
): FundEstimateResponseItem | null => {
  const matched = payload.match(/^jsonpgz\((.+)\);?$/s);
  if (!matched) return null;

  try {
    return JSON.parse(matched[1]) as FundEstimateResponseItem;
  } catch {
    return null;
  }
};

const hasPrimaryRealtimeQuote = (item: FundQuoteResponseItem): boolean => {
  const hasFundEstimate =
    item.GSZ !== null && item.GSZZL !== null && item.GZTIME !== null;
  const hasExchangeQuote =
    item.NEWPRICE !== null &&
    item.CHANGERATIO !== null &&
    item.HQDATE !== null;

  return hasFundEstimate || hasExchangeQuote;
};

const fetchFundEstimate = async (
  code: string,
): Promise<FundEstimateResponseItem | null> => {
  try {
    const { data } = await axios.get<string>(
      `/api/fundgz/js/${code}.js?rt=${Date.now()}`,
      { responseType: "text" },
    );
    return parseFundEstimateResponse(data);
  } catch {
    return null;
  }
};

export const searchFunds = async (
  keyword: string,
): Promise<FundSearchResponseItem[]> => {
  const searchUrl = `/api/search/FundSearch/api/FundSearchAPI.ashx?&m=9&key=${encodeURIComponent(keyword)}&_=${Date.now()}`;
  const { data } = await axios.get<FundSearchApiResponse>(searchUrl);
  return data.Datas ?? [];
};

export const fetchFundQuotes = async (
  codes: string[],
  deviceId: string,
): Promise<FundQuoteResponseItem[]> => {
  if (codes.length === 0) return [];

  const url =
    `/api/fund/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=${Math.max(codes.length, 20)}&plat=Android&appType=ttjj&product=EFund&Version=1&deviceid=${deviceId}&Fcodes=${codes.join(",")}`;
  const { data } = await axios.get<FundQuoteApiResponse>(url);
  const quotes = data.Datas ?? [];
  const missingEstimateCodes = quotes
    .filter((item) => !hasPrimaryRealtimeQuote(item))
    .map((item) => item.FCODE);

  if (missingEstimateCodes.length === 0) {
    return quotes;
  }

  const estimateResults = await Promise.all(
    missingEstimateCodes.map(async (code) => {
      return [code, await fetchFundEstimate(code)] as const;
    }),
  );
  const estimateMap = new Map(
    estimateResults
      .filter((entry): entry is readonly [string, FundEstimateResponseItem] => {
        return entry[1] !== null;
      })
      .map(([code, estimate]) => [code, estimate]),
  );

  return quotes.map((item) => {
    const estimate = estimateMap.get(item.FCODE);
    if (!estimate) return item;

    return {
      ...item,
      GSZ: estimate.gsz ?? item.GSZ,
      GSZZL: estimate.gszzl ?? item.GSZZL,
      GZTIME: estimate.gztime ?? item.GZTIME,
    };
  });
};
