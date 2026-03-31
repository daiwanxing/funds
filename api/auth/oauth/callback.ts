import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setAuthCookies } from "../../_lib/auth-cookie.js";
import { buildRequestAppUrl } from "../../_lib/app-url.js";
import { clearPkceVerifierCookie } from "../../_lib/oauth-pkce-cookie.js";
import { readOAuthState, clearOAuthStateCookie } from "../../_lib/oauth-state-cookie.js";
import { exchangeOAuthCodeForSession, isOAuthProvider } from "../../_lib/supabase-auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const code = typeof req.query.code === "string" ? req.query.code : "";

  // Read provider & redirectUrl from the state cookie (set by start.ts)
  const oauthState = readOAuthState(req);
  const provider = oauthState?.provider ?? "";
  const redirectUrl = oauthState?.redirectUrl ?? "/";

  if (!isOAuthProvider(provider) || !code) {
    clearOAuthStateCookie(req, res);
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
    clearOAuthStateCookie(req, res);
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
  clearOAuthStateCookie(req, res);

  res
    .status(302)
    .setHeader(
      "Location",
      buildRequestAppUrl(
        req,
        `/auth/callback?status=success&source=oauth&provider=${provider}&redirectUrl=${encodeURIComponent(redirectUrl)}`,
      ),
    )
    .end();
}
