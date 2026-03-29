import axios from "axios";
import type {
  BootstrapResponse,
  AuthSuccessResponse,
  WatchlistItemDTO,
} from "@/types/auth";

const userApi = axios.create({
  baseURL: "/api/me",
  withCredentials: true,
});

/** 获取登录状态和初始数据 */
export const fetchBootstrap = async (): Promise<BootstrapResponse> => {
  const { data } = await userApi.get<BootstrapResponse>("/bootstrap");
  return data;
};

/** 整体覆盖保存自选基金 */
export const putWatchlist = async (watchlist: WatchlistItemDTO[]): Promise<AuthSuccessResponse> => {
  const { data } = await userApi.put<AuthSuccessResponse>("/watchlist", { watchlist });
  return data;
};

/** 首次登录导入游客自选 */
export const importGuestWatchlist = async (watchlist: WatchlistItemDTO[]): Promise<AuthSuccessResponse> => {
  const { data } = await userApi.post<AuthSuccessResponse>("/watchlist/import-guest", { watchlist });
  return data;
};
