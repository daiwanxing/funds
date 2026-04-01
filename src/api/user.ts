import { http } from "./http";
import type { BootstrapResponse, AuthSuccessResponse, WatchlistItemDTO } from "@/types/auth";

/** 获取登录状态和初始数据 */
export const fetchBootstrap = async (): Promise<BootstrapResponse> => {
  const { data } = await http.get<BootstrapResponse>("/api/me/bootstrap");
  return data;
};

/** 整体覆盖保存自选基金 */
export const putWatchlist = async (watchlist: WatchlistItemDTO[]): Promise<AuthSuccessResponse> => {
  const { data } = await http.put<AuthSuccessResponse>("/api/me/watchlist", { watchlist });
  return data;
};

/** 首次登录导入游客自选 */
export const importGuestWatchlist = async (watchlist: WatchlistItemDTO[]): Promise<AuthSuccessResponse> => {
  const { data } = await http.post<AuthSuccessResponse>("/api/me/watchlist/import-guest", { watchlist });
  return data;
};
