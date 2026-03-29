import type { VercelRequest, VercelResponse } from "@vercel/node";

const ACCESS_TOKEN_COOKIE = "fs_access_token";
const REFRESH_TOKEN_COOKIE = "fs_refresh_token";

/** Max-Age in seconds */
const ACCESS_MAX_AGE = 60 * 60; // 1 hour
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const serializeCookie = (
  name: string,
  value: string,
  maxAge: number,
): string => {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Lax`,
    `Path=/`,
    `Max-Age=${maxAge}`,
  ];
  return parts.join("; ");
};

const serializeExpiredCookie = (name: string): string => {
  return `${name}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
};

/**
 * Set auth session cookies on the response.
 */
export const setAuthCookies = (
  res: VercelResponse,
  accessToken: string,
  refreshToken: string,
): void => {
  res.setHeader("Set-Cookie", [
    serializeCookie(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_MAX_AGE),
    serializeCookie(REFRESH_TOKEN_COOKIE, refreshToken, REFRESH_MAX_AGE),
  ]);
};

/**
 * Clear auth session cookies.
 */
export const clearAuthCookies = (res: VercelResponse): void => {
  res.setHeader("Set-Cookie", [
    serializeExpiredCookie(ACCESS_TOKEN_COOKIE),
    serializeExpiredCookie(REFRESH_TOKEN_COOKIE),
  ]);
};

/**
 * Parse cookies from the request.
 */
const parseCookies = (req: VercelRequest): Record<string, string> => {
  const header = req.headers.cookie ?? "";
  const result: Record<string, string> = {};
  for (const pair of header.split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    if (key) {
      result[key.trim()] = decodeURIComponent(rest.join("=").trim());
    }
  }
  return result;
};

/**
 * Read the access token from the request cookies.
 */
export const readAccessToken = (req: VercelRequest): string | null => {
  return parseCookies(req)[ACCESS_TOKEN_COOKIE] ?? null;
};

/**
 * Read the refresh token from the request cookies.
 */
export const readRefreshToken = (req: VercelRequest): string | null => {
  return parseCookies(req)[REFRESH_TOKEN_COOKIE] ?? null;
};
