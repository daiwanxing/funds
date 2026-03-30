import { beforeEach, describe, expect, it, vi } from "vitest";

describe("app URL helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.APP_URL;
    delete process.env.VERCEL_URL;
    process.env.SUPABASE_URL = "https://supabase.example";
    process.env.SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    process.env.AUTH_COOKIE_SECRET = "1234567890abcdef";
  });

  it("falls back to the fixed local OAuth port when no app URL is configured", async () => {
    const appUrl = await import("../../../api/_lib/app-url.ts");

    expect(appUrl.getAppUrl()).toBe("http://localhost:4310");
  });
});
