import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildRequestAppUrl, getRequestAppUrl } from "../../_lib/app-url.js";
import { setPkceVerifierCookie } from "../../_lib/oauth-pkce-cookie.js";
import { setOAuthStateCookie } from "../../_lib/oauth-state-cookie.js";
import { getOAuthAuthorizationUrl, isOAuthProvider } from "../../_lib/supabase-auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const provider = typeof req.query.provider === "string" ? req.query.provider : "";

  if (!isOAuthProvider(provider)) {
    res.status(400).json({
      error: {
        code: "UNSUPPORTED_PROVIDER",
        message: "仅支持 Google 或 GitHub 登录",
      },
    });
    return;
  }

  const redirectUrl = typeof req.query.redirectUrl === "string" ? req.query.redirectUrl : "/";

  // Store provider & redirectUrl in a cookie so the callback can read them
  // without needing query params in the redirect_to URL.
  // Supabase's redirect URL matching can reject URLs with unexpected query params,
  // falling back to the Site URL (production domain) instead.
  setOAuthStateCookie(req, res, { provider, redirectUrl });

  // redirect_to MUST be a clean URL without custom query params to match
  // the Supabase Redirect URLs whitelist exactly.
  const callbackUrl = `${getRequestAppUrl(req)}/api/auth/oauth/callback`;
  const result = await getOAuthAuthorizationUrl(provider, callbackUrl);

  if (result.error || !result.url || !result.verifier) {
    res
      .status(302)
      .setHeader(
        "Location",
        buildRequestAppUrl(req, "/auth/callback?status=error&reason=provider_unavailable"),
      )
      .end();
    return;
  }

  setPkceVerifierCookie(req, res, result.verifier);
  res.status(302).setHeader("Location", result.url).end();
}
