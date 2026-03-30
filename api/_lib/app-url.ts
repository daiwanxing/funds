import type { VercelRequest } from "@vercel/node";
import { getEnv } from "./env.js";

const LOCAL_APP_URL = "http://localhost:4310";

const getHeaderValue = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

const inferProtoFromHost = (host: string): "http" | "https" => {
  if (
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("[::1]")
  ) {
    return "http";
  }
  return "https";
};

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

export const getRequestAppUrl = (req: Pick<VercelRequest, "headers">): string => {
  const headers = req.headers ?? {};
  const forwardedHost = getHeaderValue(headers["x-forwarded-host"]);
  const host = forwardedHost ?? getHeaderValue(headers.host);
  if (!host) {
    return getAppUrl();
  }

  const forwardedProto = getHeaderValue(headers["x-forwarded-proto"]);
  const proto = forwardedProto ?? inferProtoFromHost(host);
  return `${proto}://${host}`;
};

export const buildAppUrl = (hashPath: string): string => {
  const normalizedHash = hashPath.startsWith("#") ? hashPath : `#${hashPath}`;
  return `${getAppUrl()}/${normalizedHash}`.replace(/\/#/, "/#");
};

export const buildRequestAppUrl = (
  req: Pick<VercelRequest, "headers">,
  hashPath: string,
): string => {
  const normalizedHash = hashPath.startsWith("#") ? hashPath : `#${hashPath}`;
  return `${getRequestAppUrl(req)}/${normalizedHash}`.replace(/\/#/, "/#");
};

export const isSecureAppUrl = (): boolean => getAppUrl().startsWith("https://");
