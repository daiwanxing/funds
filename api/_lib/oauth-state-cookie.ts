import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRequestAppUrl } from "./app-url.js";

const COOKIE_NAME = "fs_oauth_state";
const MAX_AGE = 60 * 10; // 10 minutes

export interface OAuthState {
  provider: string;
  redirectUrl: string;
}

const parseCookies = (req: Pick<VercelRequest, "headers">): Record<string, string> => {
  const header = req.headers?.cookie ?? "";
  const result: Record<string, string> = {};
  for (const pair of header.split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    if (!key) continue;
    result[key.trim()] = decodeURIComponent(rest.join("=").trim());
  }
  return result;
};

const isSecureRequest = (req: Pick<VercelRequest, "headers">): boolean => {
  return getRequestAppUrl(req).startsWith("https://");
};

const appendSetCookie = (res: VercelResponse, value: string) => {
  const current = typeof res.getHeader === "function"
    ? res.getHeader("Set-Cookie")
    : (res as VercelResponse & { headers?: Record<string, string | string[]> }).headers?.["Set-Cookie"];
  if (!current) {
    res.setHeader("Set-Cookie", [value]);
    return;
  }

  if (Array.isArray(current)) {
    res.setHeader("Set-Cookie", [...current, value]);
    return;
  }

  res.setHeader("Set-Cookie", [current.toString(), value]);
};

export const setOAuthStateCookie = (
  req: Pick<VercelRequest, "headers">,
  res: VercelResponse,
  state: OAuthState,
): void => {
  const encoded = encodeURIComponent(JSON.stringify(state));
  const secureAttr = isSecureRequest(req) ? "Secure" : null;
  const cookie = [
    `${COOKIE_NAME}=${encoded}`,
    "HttpOnly",
    secureAttr,
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${MAX_AGE}`,
  ]
    .filter(Boolean)
    .join("; ");
  appendSetCookie(res, cookie);
};

export const readOAuthState = (req: Pick<VercelRequest, "headers">): OAuthState | null => {
  const raw = parseCookies(req)[COOKIE_NAME];
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OAuthState;
  } catch {
    return null;
  }
};

export const clearOAuthStateCookie = (
  req: Pick<VercelRequest, "headers">,
  res: VercelResponse,
): void => {
  const secureAttr = isSecureRequest(req) ? "; Secure" : "";
  appendSetCookie(
    res,
    `${COOKIE_NAME}=; HttpOnly${secureAttr}; SameSite=Lax; Path=/; Max-Age=0`,
  );
};
