import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { ok, fail } from "../_lib/json.js";
import { signUp as supabaseSignUp } from "../_lib/supabase-auth.js";

const bodySchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少 6 位"),
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

  // Build the redirect URL for email verification
  const emailRedirectTo = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/#/auth/callback`;

  const { user, error } = await supabaseSignUp(email, password, emailRedirectTo);

  if (error) {
    // Handle "already registered" case
    if (error.toLowerCase().includes("already registered") || error.toLowerCase().includes("already been registered")) {
      return fail(res, 409, "EMAIL_EXISTS", "邮箱已注册，请先验证邮箱或直接登录");
    }
    return fail(res, 400, "SIGNUP_FAILED", error);
  }

  // If user exists but identities array is empty, the email is already registered
  if (user && user.identities && user.identities.length === 0) {
    return fail(res, 409, "EMAIL_EXISTS", "邮箱已注册，请先验证邮箱或直接登录");
  }

  return ok(res, { ok: true, requiresEmailVerification: true });
}
