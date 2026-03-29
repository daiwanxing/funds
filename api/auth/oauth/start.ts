import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildAppUrl, getAppUrl } from "../../_lib/app-url.js";
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

  const redirectTo = `${getAppUrl()}/api/auth/oauth/callback?provider=${provider}`;
  const result = await getOAuthAuthorizationUrl(provider, redirectTo);

  if (result.error || !result.url) {
    res
      .status(302)
      .setHeader(
        "Location",
        buildAppUrl("/auth/callback?status=error&reason=provider_unavailable"),
      )
      .end();
    return;
  }

  res.status(302).setHeader("Location", result.url).end();
}
