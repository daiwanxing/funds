import axios from "axios";
import { toast } from "@/composables/useToast";

/**
 * 各 HTTP 错误码对应的默认 toast 文案。
 * 优先使用服务端响应中的 `error.message` 字段，不存在时回退到此处的默认值。
 */
const STATUS_MESSAGES: Record<number, string> = {
  401: "登录已过期，请重新登录",
  409: "邮箱已注册，请直接登录",
};

/**
 * 全局唯一的 HTTP 客户端实例。
 *
 * 带统一 response 拦截器：
 * - 对 401 / 409 等已知错误码弹出错误 toast
 * - 始终 re-throw，保持 TanStack Query 等上层的错误感知能力
 *
 * 各 API 模块直接 import 此实例，使用完整路径（如 `/api/auth/sign-in`）。
 */
export const http = axios.create({ withCredentials: true });

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as {
      response?: { status?: number; data?: { error?: { message?: string } } };
    };

    const status = axiosError.response?.status;
    const serverMessage = axiosError.response?.data?.error?.message;

    if (status !== undefined && status in STATUS_MESSAGES) {
      toast.error(serverMessage ?? STATUS_MESSAGES[status]!);
    }

    return Promise.reject(error);
  },
);
