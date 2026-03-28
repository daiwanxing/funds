import axios from "axios";
import type {
  FundQuoteApiResponse,
  FundQuoteResponseItem,
  FundSearchApiResponse,
  FundSearchResponseItem,
} from "@/types/fund";

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
  return data.Datas ?? [];
};
