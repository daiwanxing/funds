import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { User } from "@supabase/supabase-js";
import { readAccessToken, readRefreshToken, setAuthCookies } from "./auth-cookie.js";
import { getUser, refreshSession } from "./supabase-auth.js";

export interface SessionResult {
  user: User | null;
}

/**
 * Resolve the current user from auth cookies.
 *
 * Flow:
 * 1. Read access token from cookie
 * 2. Validate with Supabase
 * 3. If expired but refresh token exists, refresh and update cookies
 * 4. Return user or null
 */
export const resolveSession = async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<SessionResult> => {
  const accessToken = readAccessToken(req);
  const refreshToken = readRefreshToken(req);

  // No tokens at all — unauthenticated
  if (!refreshToken) {
    return { user: null };
  }

  // Try the access token first
  if (accessToken) {
    const { user, error } = await getUser(accessToken);
    if (!error && user) {
      return { user };
    }
  }

  // Access token missing or expired — try refreshing
  const { session, error } = await refreshSession(refreshToken);
  if (error || !session) {
    return { user: null };
  }

  // Refresh succeeded — update cookies with new tokens
  setAuthCookies(res, session.access_token, session.refresh_token);

  const { user } = await getUser(session.access_token);
  return { user: user ?? null };
};

/**
 * Require an authenticated session.
 * Returns the user if authenticated, or sends a 401 and returns null.
 */
export const requireAuth = async (
  req: VercelRequest,
  res: VercelResponse,
): Promise<User | null> => {
  const { user } = await resolveSession(req, res);
  if (!user) {
    res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "请先登录" } });
    return null;
  }
  return user;
};
