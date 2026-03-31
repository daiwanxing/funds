import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setAuthCookies } from "../../_lib/auth-cookie.js";
import { buildRequestAppUrl } from "../../_lib/app-url.js";
import { clearPkceVerifierCookie } from "../../_lib/oauth-pkce-cookie.js";
import { getAdminClient } from "../../_lib/supabase-admin.js";
import { exchangeOAuthCodeForSession, isOAuthProvider } from "../../_lib/supabase-auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const provider = typeof req.query.provider === "string" ? req.query.provider : "";
  const code = typeof req.query.code === "string" ? req.query.code : "";

  if (!isOAuthProvider(provider) || !code) {
    res
      .status(302)
      .setHeader(
        "Location",
        buildRequestAppUrl(req, "/auth/callback?status=error&reason=oauth_callback_failed"),
      )
      .end();
    return;
  }

  const result = await exchangeOAuthCodeForSession(code, req);

  if (result.error || !result.session || !result.user) {
    clearPkceVerifierCookie(req, res);
    res
      .status(302)
      .setHeader(
        "Location",
        buildRequestAppUrl(req, "/auth/callback?status=error&reason=oauth_callback_failed"),
      )
      .end();
    return;
  }

  setAuthCookies(res, result.session.access_token, result.session.refresh_token);
  clearPkceVerifierCookie(req, res);

  const adminClient = getAdminClient();
  await adminClient.from("user_profiles").upsert(
    {
      id: result.user.id,
      email: result.user.email,
    },
    { onConflict: "id" },
  );

  res
    .status(302)
    .setHeader(
      "Location",
      buildRequestAppUrl(req, `/auth/callback?status=success&source=oauth&provider=${provider}`),
    )
    .end();
}
