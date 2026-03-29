import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  AUTH_COOKIE_SECRET: z.string().min(16, "AUTH_COOKIE_SECRET must be at least 16 characters"),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

/**
 * Lazily parse and cache env vars.
 * Throws on first access if any required var is missing or invalid.
 */
export const getEnv = (): Env => {
  if (!_env) {
    _env = envSchema.parse(process.env);
  }
  return _env;
};
