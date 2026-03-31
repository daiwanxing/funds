import { createHash, randomBytes } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRequestAppUrl } from "./app-url.js";

const PKCE_COOKIE_NAME = "fs_pkce_code_verifier";
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

export const createPkceVerifier = (): string => {
  return randomBytes(32).toString("base64url");
};

export const createPkceChallenge = (verifier: string): string => {
  return createHash("sha256").update(verifier).digest("base64url");
};

export const readPkceVerifier = (req: Pick<VercelRequest, "headers">): string | null => {
  return parseCookies(req)[PKCE_COOKIE_NAME] ?? null;
};

export const setPkceVerifierCookie = (
  req: Pick<VercelRequest, "headers">,
  res: VercelResponse,
  verifier: string,
): void => {
  appendSetCookie(res, serializeCookie(req, verifier, PKCE_MAX_AGE));
};

export const clearPkceVerifierCookie = (
  req: Pick<VercelRequest, "headers">,
  res: VercelResponse,
): void => {
  appendSetCookie(res, serializeExpiredCookie(req));
};
