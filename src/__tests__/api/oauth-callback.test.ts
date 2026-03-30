import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
let latestAuthOptions: Record<string, unknown> | undefined;
const upsert = vi.fn();
const from = vi.fn(() => ({
  upsert,
}));
const createClient = vi.fn((_: string, key: string, options?: { auth?: Record<string, unknown> }) => {
  if (key === process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      from,
    };
  }

  latestAuthOptions = options?.auth;

  return {
    auth: {
      exchangeCodeForSession,
    },
  };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient,
}));

beforeEach(() => {
  vi.resetModules();
  createClient.mockClear();
  exchangeCodeForSession.mockReset();
  latestAuthOptions = undefined;
  from.mockClear();
  upsert.mockReset();
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
    headers: {} as Record<string, string | string[]>,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    setHeader(name: string, value: string | string[]) {
      this.headers[name] = value;
      return this;
    },
    end() {
      return this;
    },
  };
};

describe("OAuth callback helpers", () => {
  it("exchanges an OAuth code for a Supabase session", async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: {
        session: {
          access_token: "access-token",
          refresh_token: "refresh-token",
        },
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
      error: null,
    });

    const supabaseAuth = await import("../../../api/_lib/supabase-auth.ts");

    await expect(supabaseAuth.exchangeOAuthCodeForSession?.("oauth-code")).resolves.toEqual({
      session: {
        access_token: "access-token",
        refresh_token: "refresh-token",
      },
      user: {
        id: "user-1",
        email: "user@example.com",
      },
      error: null,
    });

    expect(exchangeCodeForSession).toHaveBeenCalledWith("oauth-code");
  });

  it("reads the stored PKCE verifier from cookies when exchanging the callback code", async () => {
    exchangeCodeForSession.mockImplementationOnce(async () => {
      const storage = latestAuthOptions?.storage as
        | { getItem?: (key: string) => Promise<string | null> | string | null }
        | undefined;
      const verifier = await storage?.getItem?.("sb-test-auth-token-code-verifier");

      if (!verifier) {
        return {
          data: { session: null, user: null },
          error: { message: "missing pkce verifier" },
        };
      }

      return {
        data: {
          session: {
            access_token: "access-token",
            refresh_token: "refresh-token",
          },
          user: {
            id: "user-1",
            email: "user@example.com",
          },
        },
        error: null,
      };
    });

    const { default: handler } = await import("../../../api/auth/oauth/callback.ts");
    const res = createResponse();

    await handler(
      {
        method: "GET",
        query: {
          code: "oauth-code",
          provider: "google",
        },
        headers: {
          cookie: "fs_pkce_code_verifier=pkce-verifier%2F",
        },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(302);
    expect(res.headers.Location).toBe(
      "https://funds.example/#/auth/callback?status=success&source=oauth&provider=google",
    );
  });

  it("exports an OAuth callback handler", async () => {
    const modules = import.meta.glob("../../../api/auth/oauth/callback.ts");
    const loader = modules["../../../api/auth/oauth/callback.ts"];
    const loadedModule = loader ? ((await loader()) as { default?: unknown }) : undefined;
    const handler = loadedModule?.default;

    expect(handler).toBeTypeOf("function");
  });

  it("exchanges the callback code, writes auth cookies, and redirects back to the app", async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: {
        session: {
          access_token: "access-token",
          refresh_token: "refresh-token",
        },
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
      error: null,
    });

    const { default: handler } = await import("../../../api/auth/oauth/callback.ts");
    const res = createResponse();

    await handler(
      {
        method: "GET",
        query: {
          code: "oauth-code",
          provider: "google",
        },
      } as never,
      res as never,
    );

    expect(exchangeCodeForSession).toHaveBeenCalledWith("oauth-code");
    expect(from).toHaveBeenCalledWith("user_profiles");
    expect(upsert).toHaveBeenCalledWith(
      {
        id: "user-1",
        email: "user@example.com",
      },
      { onConflict: "id" },
    );
    expect(res.headers["Set-Cookie"]).toEqual([
      expect.stringContaining("fs_access_token=access-token"),
      expect.stringContaining("fs_refresh_token=refresh-token"),
    ]);
    expect(res.statusCode).toBe(302);
    expect(res.headers.Location).toBe(
      "https://funds.example/#/auth/callback?status=success&source=oauth&provider=google",
    );
  });

  it("redirects back to the auth callback page without cookies when the code exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: {
        session: null,
        user: null,
      },
      error: {
        message: "exchange failed",
      },
    });

    const { default: handler } = await import("../../../api/auth/oauth/callback.ts");
    const res = createResponse();

    await handler(
      {
        method: "GET",
        query: {
          code: "oauth-code",
          provider: "github",
        },
      } as never,
      res as never,
    );

    expect(res.headers["Set-Cookie"]).toBeUndefined();
    expect(res.statusCode).toBe(302);
    expect(res.headers.Location).toBe(
      "https://funds.example/#/auth/callback?status=error&reason=oauth_callback_failed",
    );
  });

  it("redirects back to the current request origin after a successful local OAuth callback", async () => {
    exchangeCodeForSession.mockResolvedValue({
      data: {
        session: {
          access_token: "access-token",
          refresh_token: "refresh-token",
        },
        user: {
          id: "user-1",
          email: "user@example.com",
        },
      },
      error: null,
    });

    const { default: handler } = await import("../../../api/auth/oauth/callback.ts");
    const res = createResponse();

    await handler(
      {
        method: "GET",
        query: {
          code: "oauth-code",
          provider: "github",
        },
        headers: {
          host: "localhost:3000",
          "x-forwarded-proto": "http",
        },
      } as never,
      res as never,
    );

    expect(res.statusCode).toBe(302);
    expect(res.headers.Location).toBe(
      "http://localhost:3000/#/auth/callback?status=success&source=oauth&provider=github",
    );
  });
});
