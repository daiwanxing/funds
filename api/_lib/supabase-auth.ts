import type { VercelRequest } from "@vercel/node";
import { createClient, type SupabaseClient, type Session, type User } from "@supabase/supabase-js";
import { getEnv } from "./env.js";
import { createPkceChallenge, createPkceVerifier, readPkceVerifier } from "./oauth-pkce-cookie.js";

let _authClient: SupabaseClient | null = null;

export type OAuthProvider = "google" | "github";

const OAUTH_PROVIDERS = new Set<OAuthProvider>(["google", "github"]);

export const isOAuthProvider = (value: string): value is OAuthProvider => {
  return OAUTH_PROVIDERS.has(value as OAuthProvider);
};

/**
 * Get a Supabase client with anon key.
 * Used for auth flows (sign-up, sign-in, password reset, etc.).
 */
export const getAuthClient = (): SupabaseClient => {
  if (!_authClient) {
    const env = getEnv();
    _authClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        flowType: "pkce",
      },
    });
  }
  return _authClient;
};

export interface SignUpResult {
  user: User | null;
  error: string | null;
}

export interface SignInResult {
  session: Session | null;
  user: User | null;
  error: string | null;
  emailNotConfirmed?: boolean;
}

export interface OAuthAuthorizationResult {
  url: string | null;
  verifier: string | null;
  error: string | null;
}

export interface OAuthExchangeResult {
  session: Session | null;
  user: User | null;
  error: string | null;
}

/**
 * Sign up a new user with email and password.
 */
export const signUp = async (
  email: string,
  password: string,
  emailRedirectTo: string,
): Promise<SignUpResult> => {
  const client = getAuthClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { emailRedirectTo },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
};

/**
 * Sign in a user with email and password.
 * Rejects if email is not confirmed.
 */
export const signIn = async (
  email: string,
  password: string,
): Promise<SignInResult> => {
  const client = getAuthClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Supabase returns "Email not confirmed" for unverified accounts
    const isUnverified = error.message.toLowerCase().includes("email not confirmed");
    return {
      session: null,
      user: null,
      error: isUnverified ? "请先完成邮箱验证" : "邮箱或密码错误",
      emailNotConfirmed: isUnverified,
    };
  }

  return { session: data.session, user: data.user, error: null };
};

/**
 * Request an OAuth authorization URL from Supabase.
 */
export const getOAuthAuthorizationUrl = async (
  provider: OAuthProvider,
  redirectTo: string,
): Promise<OAuthAuthorizationResult> => {
  const env = getEnv();
  const verifier = createPkceVerifier();
  const challenge = createPkceChallenge(verifier);
  const authorizeUrl = new URL("/auth/v1/authorize", env.SUPABASE_URL);
  authorizeUrl.searchParams.set("provider", provider);
  authorizeUrl.searchParams.set("redirect_to", redirectTo);
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "s256");

  return { url: authorizeUrl.toString(), verifier, error: null };
};

/**
 * Exchange an OAuth callback code for a Supabase session.
 */
export const exchangeOAuthCodeForSession = async (
  code: string,
  req: Pick<VercelRequest, "headers">,
): Promise<OAuthExchangeResult> => {
  const verifier = readPkceVerifier(req);
  if (!verifier) {
    return {
      session: null,
      user: null,
      error: "missing pkce verifier",
    };
  }

  const env = getEnv();
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=pkce`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: env.SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      auth_code: code,
      code_verifier: verifier,
    }),
  });

  const payload = await response.json() as {
    access_token?: string;
    refresh_token?: string;
    user?: User;
    msg?: string;
    error_description?: string;
    error?: string;
  };

  if (!response.ok || !payload.access_token || !payload.refresh_token || !payload.user) {
    return {
      session: null,
      user: null,
      error: payload.error_description ?? payload.msg ?? payload.error ?? "oauth exchange failed",
    };
  }

  return {
    session: {
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
    } as Session,
    user: payload.user,
    error: null,
  };
};

/**
 * Send a password reset email.
 */
export const sendPasswordReset = async (
  email: string,
  redirectTo: string,
): Promise<{ error: string | null }> => {
  const client = getAuthClient();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  // Always return success to avoid leaking whether an email exists
  if (error) {
    console.error("Password reset error:", error.message);
  }

  return { error: null };
};

/**
 * Update a user's password using a recovery session.
 */
export const updatePassword = async (
  accessToken: string,
  refreshToken: string,
  newPassword: string,
): Promise<{ error: string | null }> => {
  const client = getAuthClient();

  // Set the session from the recovery tokens
  const { error: sessionError } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) {
    return { error: "重置链接已失效，请重新发起找回密码" };
  }

  const { error } = await client.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
};

/**
 * Refresh a session using a refresh token.
 */
export const refreshSession = async (
  refreshToken: string,
): Promise<{ session: Session | null; error: string | null }> => {
  const client = getAuthClient();
  const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });

  if (error) {
    return { session: null, error: error.message };
  }

  return { session: data.session, error: null };
};

/**
 * Get user from an access token.
 */
export const getUser = async (
  accessToken: string,
): Promise<{ user: User | null; error: string | null }> => {
  const client = getAuthClient();
  const { data, error } = await client.auth.getUser(accessToken);

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
};

/**
 * Resend the verification email for a given email address.
 */
export const resendVerification = async (
  email: string,
  emailRedirectTo: string,
): Promise<{ error: string | null }> => {
  const client = getAuthClient();
  const { error } = await client.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo },
  });

  if (error) {
    console.error("Resend verification error:", error.message);
  }

  // Always return success to avoid leaking account existence
  return { error: null };
};

/**
 * Sign out via Supabase (server-side).
 */
export const signOut = async (accessToken: string): Promise<void> => {
  const client = getAuthClient();
  // Set session first so we can sign out properly
  await client.auth.setSession({
    access_token: accessToken,
    refresh_token: "",
  });
  await client.auth.signOut();
};
