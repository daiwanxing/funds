import type { VercelResponse } from "@vercel/node";

/**
 * Send a JSON success response.
 */
export const ok = (res: VercelResponse, data: unknown, status = 200): void => {
  res.status(status).json(data);
};

/**
 * Send a JSON error response.
 */
export const fail = (
  res: VercelResponse,
  status: number,
  code: string,
  message: string,
): void => {
  res.status(status).json({ error: { code, message } });
};
