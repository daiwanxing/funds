import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { ok, fail } from "../_lib/json.js";
import { updatePassword } from "../_lib/supabase-auth.js";
import { readAccessToken, readRefreshToken, clearAuthCookies } from "../_lib/auth-cookie.js";

const bodySchema = z.object({
  password: z.string().min(6, "密码至少 6 位"),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return fail(res, 405, "METHOD_NOT_ALLOWED", "只支持 POST 请求");
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "请求参数无效";
    return fail(res, 400, "VALIDATION_ERROR", message);
  }

  const { password } = parsed.data;

  // Recovery tokens come from the URL hash on the client side,
  // passed in the request body, or from existing cookies
  const accessToken = parsed.data.accessToken ?? readAccessToken(req);
  const refreshToken = parsed.data.refreshToken ?? readRefreshToken(req);

  if (!accessToken || !refreshToken) {
    return fail(res, 400, "MISSING_RECOVERY_TOKENS", "重置链接已失效，请重新发起找回密码");
  }

  const { error } = await updatePassword(accessToken, refreshToken, password);

  if (error) {
    return fail(res, 400, "RESET_FAILED", error);
  }

  // Clear cookies after reset — user must re-login
  clearAuthCookies(res);

  return ok(res, {
    ok: true,
    message: "密码已重置，请重新登录",
  });
}
