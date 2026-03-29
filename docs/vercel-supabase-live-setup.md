# Vercel + Supabase Real Environment Setup

> Run this once before testing the real auth flow against your hosted Supabase project.

## 1. Local CLI Login

```bash
npx vercel login
npx supabase login
```

## 2. Link the Vercel Project

```bash
npx vercel link
```

Expected result:

- `.vercel/project.json` is created
- subsequent `pnpm vercel:pull-env` targets the correct Vercel project

## 3. Prepare Local Env

```bash
cp .env.example .env.local
```

Then fill these values in `.env.local`:

- `APP_URL=http://localhost:3000`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_COOKIE_SECRET`

Generate `AUTH_COOKIE_SECRET` with:

```bash
openssl rand -hex 32
```

## 4. Configure Supabase Auth

Supabase Dashboard:

- Authentication → Providers → Email
  - enable Email provider
  - enable Confirm email
- Authentication → URL Configuration
  - Site URL: `http://localhost:3000`
  - Redirect URL: `http://localhost:3000/#/auth/callback`
  - Redirect URL: `http://localhost:3000/#/auth/reset-password`

For production, also add:

- `https://your-domain.com/#/auth/callback`
- `https://your-domain.com/#/auth/reset-password`

## 5. Link Supabase and Push Migrations

Find the project ref in the Supabase dashboard URL or project settings, then run:

```bash
npx supabase link --project-ref <your-project-ref>
pnpm supabase:db:push
```

This should create:

- `public.user_profiles`
- `public.user_watchlist_items`

## 6. Mirror Env Vars to Vercel

Add the same variables in Vercel Project Settings → Environment Variables.

Recommended `APP_URL` values:

- Development: `http://localhost:3000`
- Preview: your preview deployment origin
- Production: your final custom domain

After that, refresh local env if you want to use the Vercel-managed values:

```bash
pnpm vercel:pull-env
```

## 7. Start Local Full-Stack Dev

```bash
pnpm dev:vercel
```

Then verify:

1. Open `http://localhost:3000/#/auth/sign-up`
2. Register with email/password
3. Confirm the email from Supabase
4. Sign in
5. Call `GET /api/me/bootstrap` implicitly from the app
6. Add a watchlist item and confirm it persists after refresh

## 8. Deploy to Vercel Preview

Once local auth works:

```bash
npx vercel
```

Then update Supabase URL Configuration with the preview or production callback URLs if needed.
