export const DEFAULT_VITE_DEV_SERVER_HOST = "127.0.0.1";
export const DEFAULT_VITE_DEV_SERVER_PORT = 4310;
export const DEFAULT_VITE_HMR_PORT = 24678;

type ViteLikeEnv = Record<string, string | undefined>;

const resolvePort = (value: string | undefined, fallback: number) => {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : fallback;
};

export const resolveViteDevServer = (env: ViteLikeEnv = process.env) => {
  const host = env.VITE_DEV_SERVER_HOST ?? DEFAULT_VITE_DEV_SERVER_HOST;
  const port = resolvePort(
    env.VITE_DEV_SERVER_PORT ?? env.PORT,
    DEFAULT_VITE_DEV_SERVER_PORT,
  );
  const hmrHost = env.VITE_HMR_HOST ?? host;
  const hmrPort = resolvePort(env.VITE_HMR_PORT, DEFAULT_VITE_HMR_PORT);

  return {
    host,
    port,
    strictPort: true,
    hmr: {
      protocol: "ws" as const,
      host: hmrHost,
      port: hmrPort,
      clientPort: hmrPort,
    },
  };
};
