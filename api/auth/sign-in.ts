import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { ok, fail } from "../_lib/json.js";
import { signIn as supabaseSignIn } from "../_lib/supabase-auth.js";
import { setAuthCookies } from "../_lib/auth-cookie.js";
import { getAdminClient } from "../_lib/supabase-admin.js";

const bodySchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
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

  const { email, password } = parsed.data;

  const result = await supabaseSignIn(email, password);

  if (result.error) {
    const status = result.emailNotConfirmed ? 403 : 401;
    const code = result.emailNotConfirmed ? "EMAIL_NOT_CONFIRMED" : "INVALID_CREDENTIALS";
    return fail(res, status, code, result.error);
  }

  if (!result.session) {
    return fail(res, 500, "SESSION_ERROR", "登录成功但无法建立会话");
  }

  // Set HttpOnly auth cookies
  setAuthCookies(res, result.session.access_token, result.session.refresh_token);

  // Check if this is a first login
  const adminClient = getAdminClient();
  const { data: profile } = await adminClient
    .from("user_profiles")
    .select("first_login_completed")
    .eq("id", result.user!.id)
    .single();

  const isFirstLogin = profile ? !profile.first_login_completed : true;

  return ok(res, {
    ok: true,
    profile: {
      email: result.user!.email,
      isFirstLogin,
    },
  });
}
