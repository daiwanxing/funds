import { http } from "./http";
import type { AuthSuccessResponse, OAuthProvider } from "@/types/auth";

/** 注册 */
export const signUp = async (email: string, password: string): Promise<AuthSuccessResponse> => {
  const { data } = await http.post<AuthSuccessResponse>("/api/auth/sign-up", { email, password });
  return data;
};

/** 登录 */
export const signIn = async (email: string, password: string): Promise<AuthSuccessResponse> => {
  const { data } = await http.post<AuthSuccessResponse>("/api/auth/sign-in", { email, password });
  return data;
};

/** 退出登录 */
export const signOut = async (): Promise<AuthSuccessResponse> => {
  const { data } = await http.post<AuthSuccessResponse>("/api/auth/sign-out");
  return data;
};

/** 忘记密码 */
export const forgotPassword = async (email: string): Promise<AuthSuccessResponse> => {
  const { data } = await http.post<AuthSuccessResponse>("/api/auth/forgot-password", { email });
  return data;
};

/** 重置密码 */
export const resetPassword = async (
  password: string,
  accessToken?: string,
  refreshToken?: string,
): Promise<AuthSuccessResponse> => {
  const { data } = await http.post<AuthSuccessResponse>("/api/auth/reset-password", {
    password,
    accessToken,
    refreshToken,
  });
  return data;
};

/** 重发验证邮件 */
export const resendVerification = async (email: string): Promise<AuthSuccessResponse> => {
  const { data } = await http.post<AuthSuccessResponse>("/api/auth/resend-verification", { email });
  return data;
};

/** 发起第三方 OAuth 登录（当前页面跳转，授权完成后由 CallbackPage 跳回目标页） */
export const startOAuthSignIn = (provider: OAuthProvider, redirectUrl = "/"): void => {
  const url = `/api/auth/oauth/start?provider=${provider}&redirectUrl=${encodeURIComponent(redirectUrl)}`;
  window.location.href = url;
};
