import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { ok, fail } from "../_lib/json.js";
import { sendPasswordReset } from "../_lib/supabase-auth.js";
import { buildAppUrl } from "../_lib/app-url.js";

const bodySchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
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

  const { email } = parsed.data;

  const redirectTo = buildAppUrl("/auth/reset-password");

  await sendPasswordReset(email, redirectTo);

  // Always return success to avoid leaking account existence
  return ok(res, {
    ok: true,
    message: "如果该邮箱已注册，您将收到重置密码邮件",
  });
}
