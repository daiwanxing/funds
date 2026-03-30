import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRequestAppUrl } from "./app-url.js";

const PKCE_COOKIE_NAME = "fs_pkce_code_verifier";
const PKCE_CODE_VERIFIER_SUFFIX = "-code-verifier";
const PKCE_MAX_AGE = 60 * 10;

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

const isPkceVerifierKey = (key: string): boolean => key.endsWith(PKCE_CODE_VERIFIER_SUFFIX);

const isSecureRequest = (req: Pick<VercelRequest, "headers">): boolean => {
  return getRequestAppUrl(req).startsWith("https://");
};

const appendSetCookie = (res: VercelResponse, value: string) => {
  const current = typeof res.getHeader === "function"
    ? res.getHeader("Set-Cookie")
    : (res as VercelResponse & { headers?: Record<string, string | string[]> }).headers?.["Set-Cookie"];
  if (!current) {
    res.setHeader("Set-Cookie", value);
    return;
  }

  if (Array.isArray(current)) {
    res.setHeader("Set-Cookie", [...current, value]);
    return;
  }

  res.setHeader("Set-Cookie", [current.toString(), value]);
};

const serializeCookie = (
  req: Pick<VercelRequest, "headers">,
  value: string,
  maxAge: number,
) => {
  const secureAttr = isSecureRequest(req) ? "Secure" : null;
  return [
    `${PKCE_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "HttpOnly",
    secureAttr,
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAge}`,
  ]
    .filter(Boolean)
    .join("; ");
};

const serializeExpiredCookie = (req: Pick<VercelRequest, "headers">) => {
  const secureAttr = isSecureRequest(req) ? "; Secure" : "";
  return `${PKCE_COOKIE_NAME}=; HttpOnly${secureAttr}; SameSite=Lax; Path=/; Max-Age=0`;
};

export const createPkceCookieStorage = (
  req: Pick<VercelRequest, "headers">,
  res?: VercelResponse,
) => {
  return {
    isServer: true,
    getItem: async (key: string) => {
      if (!isPkceVerifierKey(key)) return null;
      return parseCookies(req)[PKCE_COOKIE_NAME] ?? null;
    },
    setItem: async (key: string, value: string) => {
      if (!isPkceVerifierKey(key) || !res) return;
      appendSetCookie(res, serializeCookie(req, value, PKCE_MAX_AGE));
    },
    removeItem: async (key: string) => {
      if (!isPkceVerifierKey(key) || !res) return;
      appendSetCookie(res, serializeExpiredCookie(req));
    },
  };
};
