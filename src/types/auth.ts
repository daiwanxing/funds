// ─── 认证领域类型 ────────────────────────────────────────────────

import type { FundListItem } from "./fund";

export type OAuthProvider = "google" | "github";

/** Bootstrap API 返回的自选基金条目 */
export interface WatchlistItemDTO {
  fundCode: string;
  num: number;
  cost: number;
  sortOrder: number;
}

/** Bootstrap API 返回的用户信息 */
export interface ProfileDTO {
  email: string;
  isFirstLogin: boolean;
}

/** GET /api/me/bootstrap 返回体 */
export interface BootstrapResponse {
  authenticated: boolean;
  profile?: ProfileDTO;
  watchlist?: WatchlistItemDTO[];
}

/** 登录/注册成功响应 */
export interface AuthSuccessResponse {
  ok: boolean;
  requiresEmailVerification?: boolean;
  profile?: ProfileDTO;
  message?: string;
}

/** 通用错误响应结构 */
export interface AuthErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

/** 将 WatchlistItemDTO 映射为前端 FundListItem */
export const mapWatchlistToFundList = (items: WatchlistItemDTO[]): FundListItem[] => {
  return items.map((item) => ({
    code: item.fundCode,
    num: item.num,
    cost: item.cost,
  }));
};

/** 将前端 FundListItem 映射为 API 需要的格式 */
export const mapFundListToWatchlist = (items: FundListItem[]): WatchlistItemDTO[] => {
  return items.map((item, index) => ({
    fundCode: item.code,
    num: item.num,
    cost: item.cost ?? 0,
    sortOrder: index,
  }));
};
