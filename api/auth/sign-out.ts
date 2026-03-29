import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ok, fail } from "../_lib/json.js";
import { clearAuthCookies, readAccessToken } from "../_lib/auth-cookie.js";
import { signOut as supabaseSignOut } from "../_lib/supabase-auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return fail(res, 405, "METHOD_NOT_ALLOWED", "只支持 POST 请求");
  }

  const accessToken = readAccessToken(req);

  // Try to sign out on Supabase side if we have a token
  if (accessToken) {
    try {
      await supabaseSignOut(accessToken);
    } catch {
      // Ignore sign-out errors — we still clear cookies
    }
  }

  // Always clear cookies
  clearAuthCookies(res);

  return ok(res, { ok: true });
}
