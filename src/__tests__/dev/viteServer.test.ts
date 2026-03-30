import { describe, expect, it } from "vitest";
import {
  DEFAULT_VITE_DEV_SERVER_HOST,
  DEFAULT_VITE_DEV_SERVER_PORT,
  DEFAULT_VITE_HMR_PORT,
  resolveViteDevServer,
} from "@/dev/viteServer";

describe("resolveViteDevServer", () => {
  it("prefers the explicit dev server port and keeps HMR on a dedicated direct socket", () => {
    expect(
      resolveViteDevServer({
        PORT: "58638",
        VITE_DEV_SERVER_PORT: "4311",
        VITE_HMR_PORT: "24678",
      }),
    ).toEqual({
      host: DEFAULT_VITE_DEV_SERVER_HOST,
      port: 4311,
      strictPort: true,
      hmr: {
        protocol: "ws",
        host: DEFAULT_VITE_DEV_SERVER_HOST,
        port: 24678,
        clientPort: 24678,
      },
    });
  });

  it("falls back to the standalone defaults when no environment overrides are present", () => {
    expect(resolveViteDevServer({})).toEqual({
      host: DEFAULT_VITE_DEV_SERVER_HOST,
      port: DEFAULT_VITE_DEV_SERVER_PORT,
      strictPort: true,
      hmr: {
        protocol: "ws",
        host: DEFAULT_VITE_DEV_SERVER_HOST,
        port: DEFAULT_VITE_HMR_PORT,
        clientPort: DEFAULT_VITE_HMR_PORT,
      },
    });
  });

  it("ignores invalid port values instead of passing broken config to Vite", () => {
    expect(
      resolveViteDevServer({
        VITE_DEV_SERVER_PORT: "abc",
        VITE_HMR_PORT: "-1",
      }),
    ).toEqual({
      host: DEFAULT_VITE_DEV_SERVER_HOST,
      port: DEFAULT_VITE_DEV_SERVER_PORT,
      strictPort: true,
      hmr: {
        protocol: "ws",
        host: DEFAULT_VITE_DEV_SERVER_HOST,
        port: DEFAULT_VITE_HMR_PORT,
        clientPort: DEFAULT_VITE_HMR_PORT,
      },
    });
  });
});
