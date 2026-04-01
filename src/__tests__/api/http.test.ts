import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/composables/useToast", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { http } from "@/api/http";
import { toast } from "@/composables/useToast";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * 提取 http 单例上已注册的 response 拦截器的 onRejected 回调。
 * 通过直接调用它来测试拦截器的决策逻辑，无需真实网络请求。
 */
const getInterceptorRejected = () => {
  const handlers = (
    http.interceptors.response as unknown as {
      handlers: Array<{ fulfilled: unknown; rejected: (e: unknown) => Promise<unknown> }>;
    }
  ).handlers;
  const onRejected = handlers[0]?.rejected;
  if (!onRejected) throw new Error("interceptor not registered");
  return onRejected;
};

const makeAxiosError = (status: number, message?: string, suppressToast?: boolean) => ({
  config: suppressToast !== undefined ? { suppressToast } : {},
  response: {
    status,
    data: message ? { error: { message } } : {},
  },
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("http response interceptor", () => {
  let onRejected: (e: unknown) => Promise<unknown>;

  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
    onRejected = getInterceptorRejected();
  });

  it("shows a toast for 401 using the server error message when available", async () => {
    const err = makeAxiosError(401, "Token expired");
    await expect(onRejected(err)).rejects.toEqual(err);
    expect(toast.error).toHaveBeenCalledWith("Token expired");
  });

  it("falls back to the default 401 message when server provides no message", async () => {
    const err = makeAxiosError(401);
    await expect(onRejected(err)).rejects.toEqual(err);
    expect(toast.error).toHaveBeenCalledWith("登录已过期，请重新登录");
  });

  it("shows a toast for 409 using the server error message when available", async () => {
    const err = makeAxiosError(409, "邮箱已注册，请先验证邮箱或直接登录");
    await expect(onRejected(err)).rejects.toEqual(err);
    expect(toast.error).toHaveBeenCalledWith("邮箱已注册，请先验证邮箱或直接登录");
  });

  it("falls back to the default 409 message when server provides no message", async () => {
    const err = makeAxiosError(409);
    await expect(onRejected(err)).rejects.toEqual(err);
    expect(toast.error).toHaveBeenCalledWith("邮箱已注册，请直接登录");
  });

  it("does NOT show a toast for unregistered error codes (e.g. 500)", async () => {
    const err = makeAxiosError(500, "Internal server error");
    await expect(onRejected(err)).rejects.toEqual(err);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("skips the toast when suppressToast is true on the request config", async () => {
    const err = makeAxiosError(401, "Token expired", true);
    await expect(onRejected(err)).rejects.toEqual(err);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("still rejects the promise when toast is suppressed (error propagates to caller)", async () => {
    const err = makeAxiosError(409, "邮箱已注册", true);
    await expect(onRejected(err)).rejects.toEqual(err);
  });

  it("does NOT call toast for errors without a response (network timeout, etc.)", async () => {
    const networkError = { config: {}, message: "Network Error" };
    await expect(onRejected(networkError)).rejects.toEqual(networkError);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
