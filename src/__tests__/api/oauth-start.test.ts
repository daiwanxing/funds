import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.fn(() => ({
  auth: {
    signInWithOAuth,
  },
}));
const signInWithOAuth = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient,
}));

beforeEach(() => {
  vi.resetModules();
  createClient.mockClear();
  signInWithOAuth.mockReset();
  process.env.APP_URL = "https://funds.example";
  process.env.SUPABASE_URL = "https://supabase.example";
  process.env.SUPABASE_ANON_KEY = "anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  process.env.AUTH_COOKIE_SECRET = "1234567890abcdef";
});

const createResponse = () => {
  return {
    statusCode: 200,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    end() {
      return this;
    },
  };
};

describe("OAuth start helpers", () => {
  it("recognizes google and github as the only supported OAuth providers", async () => {
    const supabaseAuth = await import("../../../api/_lib/supabase-auth.ts");

    expect(supabaseAuth.isOAuthProvider?.("google")).toBe(true);
    expect(supabaseAuth.isOAuthProvider?.("github")).toBe(true);
    expect(supabaseAuth.isOAuthProvider?.("wechat")).toBe(false);
    expect(supabaseAuth.isOAuthProvider?.("")).toBe(false);
  });

  it("creates the Supabase auth client in PKCE mode for OAuth flows", async () => {
    await import("../../../api/_lib/supabase-auth.ts");

    expect(createClient).toHaveBeenCalledWith(
      "https://supabase.example",
      "anon-key",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          flowType: "pkce",
        },
      },
    );
  });

  it("requests an OAuth authorization URL from Supabase for a supported provider", async () => {
    signInWithOAuth.mockResolvedValue({
      data: { url: "https://supabase.example/oauth/google" },
      error: null,
    });

    const supabaseAuth = await import("../../../api/_lib/supabase-auth.ts");

    await expect(
      supabaseAuth.getOAuthAuthorizationUrl?.(
        "google",
        "https://funds.example/api/auth/oauth/callback",
      ),
    ).resolves.toEqual({
      url: "https://supabase.example/oauth/google",
      error: null,
    });

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "https://funds.example/api/auth/oauth/callback",
        skipBrowserRedirect: true,
      },
    });
  });

  it("exports an OAuth start handler", async () => {
    const modules = import.meta.glob("../../../api/auth/oauth/start.ts");
    const loader = modules["../../../api/auth/oauth/start.ts"];
    const loadedModule = loader ? ((await loader()) as { default?: unknown }) : undefined;
    const handler = loadedModule?.default;

    expect(handler).toBeTypeOf("function");
  });

  it("rejects unsupported OAuth providers", async () => {
    const { default: handler } = await import("../../../api/auth/oauth/start.ts");
    const res = createResponse();

    await handler(
      {
        method: "GET",
        query: { provider: "wechat" },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: {
        code: "UNSUPPORTED_PROVIDER",
        message: "仅支持 Google 或 GitHub 登录",
      },
    });
  });

  it("redirects supported providers to the Supabase authorization URL", async () => {
    signInWithOAuth.mockResolvedValue({
      data: { url: "https://supabase.example/oauth/google/start" },
      error: null,
    });

    const { default: handler } = await import("../../../api/auth/oauth/start.ts");
    const res = createResponse();

    await handler(
      {
        method: "GET",
        query: { provider: "google" },
      } as never,
      res as never,
    );

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "https://funds.example/api/auth/oauth/callback?provider=google",
        skipBrowserRedirect: true,
      },
    });
    expect(res.statusCode).toBe(302);
    expect(res.headers.Location).toBe("https://supabase.example/oauth/google/start");
  });

  it("redirects back to the callback page with an error when Supabase cannot start OAuth", async () => {
    signInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: { message: "provider unavailable" },
    });

    const { default: handler } = await import("../../../api/auth/oauth/start.ts");
    const res = createResponse();

    await handler(
      {
        method: "GET",
        query: { provider: "github" },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(302);
    expect(res.headers.Location).toBe(
      "https://funds.example/#/auth/callback?status=error&reason=provider_unavailable",
    );
  });
});
