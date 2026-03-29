import { getEnv } from "./env.js";

const LOCAL_APP_URL = "http://localhost:3000";

export const getAppUrl = (): string => {
  const { APP_URL } = getEnv();
  if (APP_URL) {
    return APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return LOCAL_APP_URL;
};

export const buildAppUrl = (hashPath: string): string => {
  const normalizedHash = hashPath.startsWith("#") ? hashPath : `#${hashPath}`;
  return `${getAppUrl()}/${normalizedHash}`.replace(/\/#/, "/#");
};

export const isSecureAppUrl = (): boolean => getAppUrl().startsWith("https://");
