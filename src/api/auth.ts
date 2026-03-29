import axios from "axios";
import type {
  AuthSuccessResponse,
} from "@/types/auth";

const authApi = axios.create({
  baseURL: "/api/auth",
  withCredentials: true,
});

/** 注册 */
export const signUp = async (email: string, password: string): Promise<AuthSuccessResponse> => {
  const { data } = await authApi.post<AuthSuccessResponse>("/sign-up", { email, password });
  return data;
};

/** 登录 */
export const signIn = async (email: string, password: string): Promise<AuthSuccessResponse> => {
  const { data } = await authApi.post<AuthSuccessResponse>("/sign-in", { email, password });
  return data;
};

/** 退出登录 */
export const signOut = async (): Promise<AuthSuccessResponse> => {
  const { data } = await authApi.post<AuthSuccessResponse>("/sign-out");
  return data;
};

/** 忘记密码 */
export const forgotPassword = async (email: string): Promise<AuthSuccessResponse> => {
  const { data } = await authApi.post<AuthSuccessResponse>("/forgot-password", { email });
  return data;
};

/** 重置密码 */
export const resetPassword = async (
  password: string,
  accessToken?: string,
  refreshToken?: string,
): Promise<AuthSuccessResponse> => {
  const { data } = await authApi.post<AuthSuccessResponse>("/reset-password", {
    password,
    accessToken,
    refreshToken,
  });
  return data;
};

/** 重发验证邮件 */
export const resendVerification = async (email: string): Promise<AuthSuccessResponse> => {
  const { data } = await authApi.post<AuthSuccessResponse>("/resend-verification", { email });
  return data;
};
