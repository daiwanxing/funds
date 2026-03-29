# Auth Environment Variables

> Required env vars for the authentication and sync feature.

---

## Required Variables

| Variable | Description | Where to find |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL (e.g. `https://xxx.supabase.co`) | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, never expose to client) | Supabase Dashboard → Settings → API |
| `AUTH_COOKIE_SECRET` | Secret for signing auth cookies. Generate with `openssl rand -hex 32` | Self-generated |

---

## Supabase Dashboard Configuration

### Email Redirect URLs

Configure in **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL**: `https://your-domain.com`
- **Redirect URLs** (allowlist):
  - Local: `http://localhost:3000/#/auth/callback`
  - Production: `https://your-domain.com/#/auth/callback`
  - Reset: `http://localhost:3000/#/auth/reset-password`
  - Reset (prod): `https://your-domain.com/#/auth/reset-password`

### SMTP

Supabase provides built-in email sending for development. For production, configure a custom SMTP provider in **Supabase Dashboard → Authentication → Email Templates**.

---

## Local Development Setup

1. Create a `.env` file in the project root (already in `.gitignore`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_COOKIE_SECRET=your-random-hex-secret
```

2. Run Vercel Functions locally:

```bash
vercel dev
```

This starts the Vercel dev server which serves both the Vite frontend and the `/api/*` functions.

---

## Vercel Deployment

Add all variables above in **Vercel Dashboard → Settings → Environment Variables**.

Ensure `SUPABASE_SERVICE_ROLE_KEY` is only available in server (Serverless Functions) scope — **never** expose it to the browser.

---

## Current Limitations

- OAuth (Google/GitHub) is deferred to phase 2 — no OAuth-related env vars needed yet.
