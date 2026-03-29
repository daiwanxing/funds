# FundStation Auth Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build email/password authentication, verified-email-only sign-in, password reset, guest mode, and cloud-synced watchlist using Supabase Auth + Supabase Postgres behind Vercel Functions.

**Architecture:** Keep authentication and user data behind a Vercel BFF. Supabase Auth handles identity and password flows; Supabase Postgres stores the watchlist. The Vue app remains a client of `/api/auth/*` and `/api/me/*`, with guest-mode watchlist stored in `sessionStorage` and authenticated watchlist loaded via `/api/me/bootstrap`.

**Tech Stack:** Vue 3, Vite, Vue Router, TanStack Query, Vitest, Vercel Functions, Supabase Auth, Supabase Postgres, `zod`, `@supabase/supabase-js`

---

## File Map

### New server files

- Create: `api/_lib/env.ts`
  - Read and validate Supabase env vars.
- Create: `api/_lib/json.ts`
  - Shared JSON success/error response helpers.
- Create: `api/_lib/auth-cookie.ts`
  - Read/write/clear secure auth cookies.
- Create: `api/_lib/supabase-admin.ts`
  - Server client with service-role key for DB operations.
- Create: `api/_lib/supabase-auth.ts`
  - Server client helpers for sign-up, sign-in, password reset, user lookup, and session refresh.
- Create: `api/_lib/session.ts`
  - Resolve current user from auth cookie and refresh session when needed.
- Create: `api/auth/sign-up.ts`
- Create: `api/auth/sign-in.ts`
- Create: `api/auth/sign-out.ts`
- Create: `api/auth/forgot-password.ts`
- Create: `api/auth/reset-password.ts`
- Create: `api/auth/resend-verification.ts`
- Create: `api/me/bootstrap.ts`
- Create: `api/me/watchlist.ts`
- Create: `api/me/watchlist/import-guest.ts`

### New database / backend docs

- Create: `supabase/migrations/20260329_create_user_profiles.sql`
- Create: `supabase/migrations/20260329_create_user_watchlist_items.sql`
- Create: `docs/auth-env.md`
  - Document required env vars, Supabase redirect URLs, SMTP note, and local dev setup.

### New frontend files

- Create: `src/api/auth.ts`
  - Frontend wrappers for `/api/auth/*`
- Create: `src/api/user.ts`
  - Frontend wrappers for `/api/me/*`
- Create: `src/types/auth.ts`
  - Auth session/profile/bootstrap DTOs.
- Create: `src/composables/auth/useAuth.ts`
  - Query/mutation layer for bootstrap, sign-in, sign-up, sign-out, and import prompt state.
- Create: `src/composables/watchlist/useGuestWatchlist.ts`
  - `sessionStorage`-backed guest watchlist helpers.
- Create: `src/pages/auth/AuthSignInPage.vue`
- Create: `src/pages/auth/AuthSignUpPage.vue`
- Create: `src/pages/auth/AuthForgotPasswordPage.vue`
- Create: `src/pages/auth/AuthResetPasswordPage.vue`
- Create: `src/pages/auth/AuthCallbackPage.vue`
- Create: `src/components/Auth/GuestImportDialog.vue`
  - Functional confirmation dialog for first-login import.

### Existing frontend files to modify

- Modify: `src/router.ts`
  - Add auth routes.
- Modify: `src/pages/HomePage.vue`
  - Use bootstrap auth state, guest watchlist fallback, and import dialog orchestration.
- Modify: `src/composables/settings/useSettings.ts`
  - Stop treating `localStorage` as authenticated watchlist source.
- Modify: `src/composables/fund/useFundData.ts`
  - Accept watchlist source from cloud or guest store without assuming local persistent storage.
- Modify: `src/utils/storage.ts`
  - Narrow responsibility to guest/session usage or split into `localStorage` legacy helpers only if still needed.
- Modify: `src/types/settings.ts`
  - Remove watchlist persistence assumptions from long-term storage schema.
- Modify: `CLAUDE.md`
  - Add auth architecture rule and env/setup command references once implementation lands.

### Tests

- Create: `src/__tests__/api/auth.test.ts`
- Create: `src/__tests__/api/bootstrap.test.ts`
- Create: `src/__tests__/composables/auth/useAuth.test.ts`
- Create: `src/__tests__/composables/watchlist/useGuestWatchlist.test.ts`
- Modify: `src/__tests__/pages/HomePage.test.ts`
- Modify: `src/__tests__/composables/fund/useFundData.test.ts`

---

### Task 1: Prepare Supabase/Vercel foundations

**Files:**
- Create: `supabase/migrations/20260329_create_user_profiles.sql`
- Create: `supabase/migrations/20260329_create_user_watchlist_items.sql`
- Create: `docs/auth-env.md`
- Create: `api/_lib/env.ts`
- Test: none yet

- [ ] **Step 1: Write the migration SQL for `user_profiles`**

```sql
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_login_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

- [ ] **Step 2: Write the migration SQL for `user_watchlist_items`**

```sql
create table if not exists public.user_watchlist_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  fund_code text not null,
  num numeric not null default 0,
  cost numeric not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, fund_code)
);
```

- [ ] **Step 3: Add RLS policies in the same migrations, even if BFF uses service role**

```sql
alter table public.user_profiles enable row level security;
alter table public.user_watchlist_items enable row level security;
```

Expected: policies exist for future direct inspection, even if the BFF is the primary access path.

- [ ] **Step 4: Document env vars and redirect URLs**

Document in `docs/auth-env.md`:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_COOKIE_SECRET`
- `SUPABASE_SITE_URL`
- `SUPABASE_EMAIL_REDIRECT_TO`
- local callback URL
- production callback URL

- [ ] **Step 5: Add runtime env validation**

Create `api/_lib/env.ts` with `zod` validation:

```ts
export const env = envSchema.parse(process.env);
```

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260329_create_user_profiles.sql supabase/migrations/20260329_create_user_watchlist_items.sql docs/auth-env.md api/_lib/env.ts
git commit -m "chore: add auth database and env scaffolding"
```

---

### Task 2: Build server auth/session primitives

**Files:**
- Create: `api/_lib/json.ts`
- Create: `api/_lib/auth-cookie.ts`
- Create: `api/_lib/supabase-admin.ts`
- Create: `api/_lib/supabase-auth.ts`
- Create: `api/_lib/session.ts`
- Create: `src/__tests__/api/auth.test.ts`

- [ ] **Step 1: Write the failing auth primitive tests**

Test cases:

- setting auth cookie writes `HttpOnly`, `Secure`, `SameSite=Lax`, path `/`
- clearing auth cookie expires both access and refresh cookies
- missing cookies returns unauthenticated
- expired access token with valid refresh token triggers refresh path

Run:

```bash
pnpm test:run src/__tests__/api/auth.test.ts
```

Expected: FAIL because auth helpers do not exist yet.

- [ ] **Step 2: Implement JSON helpers**

Create small helpers:

```ts
export const ok = (res, data, status = 200) => { ... }
export const fail = (res, status, code, message) => { ... }
```

- [ ] **Step 3: Implement cookie helpers**

Store two cookies:

- `fs_access_token`
- `fs_refresh_token`

Both `HttpOnly`; refresh token gets longer `Max-Age`.

- [ ] **Step 4: Implement Supabase server clients**

Use:

- anon-key client for auth flows
- service-role client for DB read/write

- [ ] **Step 5: Implement session resolver**

Pseudo-flow:

```ts
const accessToken = readAccessCookie(req);
const refreshToken = readRefreshCookie(req);
if (!refreshToken) return { user: null };
// validate or refresh session through Supabase
```

- [ ] **Step 6: Re-run auth primitive tests**

Run:

```bash
pnpm test:run src/__tests__/api/auth.test.ts
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add api/_lib/json.ts api/_lib/auth-cookie.ts api/_lib/supabase-admin.ts api/_lib/supabase-auth.ts api/_lib/session.ts src/__tests__/api/auth.test.ts
git commit -m "feat: add auth server primitives"
```

---

### Task 3: Implement auth endpoints

**Files:**
- Create: `api/auth/sign-up.ts`
- Create: `api/auth/sign-in.ts`
- Create: `api/auth/sign-out.ts`
- Create: `api/auth/forgot-password.ts`
- Create: `api/auth/reset-password.ts`
- Create: `api/auth/resend-verification.ts`
- Modify: `src/__tests__/api/auth.test.ts`

- [ ] **Step 1: Add failing endpoint tests**

Cover:

- sign-up sends verification and returns 200 without setting login cookies
- sign-in rejects unverified email
- sign-in sets cookies for verified email
- sign-out clears cookies
- forgot-password always returns generic success
- reset-password requires valid recovery context
- resend-verification returns success for pending accounts

- [ ] **Step 2: Implement `sign-up`**

Server flow:

```ts
await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: `${siteUrl}/#/auth/callback` },
});
```

Response body:

```json
{ "ok": true, "requiresEmailVerification": true }
```

- [ ] **Step 3: Implement `sign-in`**

Requirements:

- parse email/password with `zod`
- reject users whose `email_confirmed_at` is null
- set auth cookies on success

- [ ] **Step 4: Implement `sign-out`**

Requirements:

- call Supabase sign-out if session is present
- always clear cookies

- [ ] **Step 5: Implement forgot/reset/resend flows**

Reset redirect target:

- `/#/auth/reset-password`

- [ ] **Step 6: Re-run focused endpoint tests**

Run:

```bash
pnpm test:run src/__tests__/api/auth.test.ts
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add api/auth/sign-up.ts api/auth/sign-in.ts api/auth/sign-out.ts api/auth/forgot-password.ts api/auth/reset-password.ts api/auth/resend-verification.ts src/__tests__/api/auth.test.ts
git commit -m "feat: add auth endpoints"
```

---

### Task 4: Implement bootstrap and watchlist APIs

**Files:**
- Create: `api/me/bootstrap.ts`
- Create: `api/me/watchlist.ts`
- Create: `api/me/watchlist/import-guest.ts`
- Create: `src/__tests__/api/bootstrap.test.ts`

- [ ] **Step 1: Write failing API tests**

Cover:

- unauthenticated bootstrap returns `{ authenticated: false }`
- authenticated bootstrap returns profile + watchlist sorted by `sort_order`
- `PUT /api/me/watchlist` replaces existing rows for current user
- `POST /api/me/watchlist/import-guest` only succeeds when `first_login_completed = false` and cloud watchlist is empty

- [ ] **Step 2: Implement `GET /api/me/bootstrap`**

Response shape:

```json
{
  "authenticated": true,
  "profile": {
    "email": "user@example.com",
    "isFirstLogin": true
  },
  "watchlist": []
}
```

- [ ] **Step 3: Implement `PUT /api/me/watchlist`**

Server flow:

- validate payload array
- delete current user rows
- insert replacement rows with sequential `sort_order`

- [ ] **Step 4: Implement `POST /api/me/watchlist/import-guest`**

Server rules:

- require authenticated user
- require profile `first_login_completed = false`
- require current cloud watchlist empty
- insert guest rows
- mark `first_login_completed = true`

- [ ] **Step 5: Re-run focused API tests**

Run:

```bash
pnpm test:run src/__tests__/api/bootstrap.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add api/me/bootstrap.ts api/me/watchlist.ts api/me/watchlist/import-guest.ts src/__tests__/api/bootstrap.test.ts
git commit -m "feat: add bootstrap and watchlist endpoints"
```

---

### Task 5: Add frontend auth and user API clients

**Files:**
- Create: `src/types/auth.ts`
- Create: `src/api/auth.ts`
- Create: `src/api/user.ts`
- Create: `src/composables/auth/useAuth.ts`
- Create: `src/__tests__/composables/auth/useAuth.test.ts`

- [ ] **Step 1: Write failing composable tests**

Cover:

- bootstrap query maps unauthenticated response
- sign-in mutation invalidates bootstrap query
- sign-out mutation clears cached user state
- import-guest mutation updates bootstrap watchlist

- [ ] **Step 2: Define auth DTOs**

Example:

```ts
export interface BootstrapResponse {
  authenticated: boolean;
  profile?: { email: string; isFirstLogin: boolean };
  watchlist?: FundListItem[];
}
```

- [ ] **Step 3: Create frontend API wrappers**

Use existing request style and keep direct `fetch`/`axios` out of pages.

- [ ] **Step 4: Implement `useAuth`**

Return:

- `bootstrap`
- `isAuthenticated`
- `signUp`
- `signIn`
- `signOut`
- `forgotPassword`
- `resetPassword`
- `resendVerification`
- `importGuestWatchlist`

- [ ] **Step 5: Re-run composable tests**

Run:

```bash
pnpm test:run src/__tests__/composables/auth/useAuth.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/types/auth.ts src/api/auth.ts src/api/user.ts src/composables/auth/useAuth.ts src/__tests__/composables/auth/useAuth.test.ts
git commit -m "feat: add auth client composable"
```

---

### Task 6: Add guest watchlist session store

**Files:**
- Create: `src/composables/watchlist/useGuestWatchlist.ts`
- Create: `src/__tests__/composables/watchlist/useGuestWatchlist.test.ts`
- Modify: `src/utils/storage.ts`
- Modify: `src/types/settings.ts`

- [ ] **Step 1: Write failing guest-store tests**

Cover:

- guest watchlist reads from `sessionStorage`
- add/remove/update fund persists for current tab
- closing auth session logic does not touch guest watchlist
- legacy `localStorage` `fundListM` is ignored for authenticated bootstrap

- [ ] **Step 2: Implement `useGuestWatchlist`**

API:

```ts
{
  items,
  load,
  replaceAll,
  addFund,
  removeFund,
  clear,
}
```

- [ ] **Step 3: Narrow `storage.ts` responsibility**

Target state:

- keep it only for remaining app-local cache that still belongs in storage
- stop using it as the authenticated watchlist source

- [ ] **Step 4: Re-run guest-store tests**

Run:

```bash
pnpm test:run src/__tests__/composables/watchlist/useGuestWatchlist.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/composables/watchlist/useGuestWatchlist.ts src/__tests__/composables/watchlist/useGuestWatchlist.test.ts src/utils/storage.ts src/types/settings.ts
git commit -m "feat: add guest watchlist session store"
```

---

### Task 7: Integrate bootstrap and guest/auth watchlist selection into HomePage

**Files:**
- Modify: `src/pages/HomePage.vue`
- Modify: `src/composables/fund/useFundData.ts`
- Modify: `src/__tests__/pages/HomePage.test.ts`
- Modify: `src/__tests__/composables/fund/useFundData.test.ts`

- [ ] **Step 1: Write failing integration tests**

Cover:

- unauthenticated home uses guest watchlist
- authenticated home uses bootstrap watchlist
- sign-out switches back to guest watchlist
- first authenticated load does not read watchlist from `localStorage`

- [ ] **Step 2: Refactor `useFundData` input contract**

Current contract assumes `fundListM` comes from settings storage. Change it to accept a watchlist `Ref<FundListItem[]>` from either guest or auth source.

- [ ] **Step 3: Refactor `HomePage`**

Pseudo-flow:

```ts
const auth = useAuth();
const guestWatchlist = useGuestWatchlist();
const activeWatchlist = computed(() =>
  auth.isAuthenticated.value ? auth.bootstrap.value.watchlist : guestWatchlist.items.value
);
```

- [ ] **Step 4: Re-run focused tests**

Run:

```bash
pnpm test:run src/__tests__/pages/HomePage.test.ts src/__tests__/composables/fund/useFundData.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/HomePage.vue src/composables/fund/useFundData.ts src/__tests__/pages/HomePage.test.ts src/__tests__/composables/fund/useFundData.test.ts
git commit -m "feat: switch home watchlist source by auth state"
```

---

### Task 8: Add functional auth pages and router entries

**Files:**
- Create: `src/pages/auth/AuthSignInPage.vue`
- Create: `src/pages/auth/AuthSignUpPage.vue`
- Create: `src/pages/auth/AuthForgotPasswordPage.vue`
- Create: `src/pages/auth/AuthResetPasswordPage.vue`
- Create: `src/pages/auth/AuthCallbackPage.vue`
- Modify: `src/router.ts`

- [ ] **Step 1: Write minimal route smoke tests**

Add route assertions to existing page/router tests:

- `/auth/sign-in`
- `/auth/sign-up`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/callback`

- [ ] **Step 2: Implement functional pages**

Keep UI intentionally simple:

- email input
- password input
- submit button
- link between sign-in/sign-up/forgot

Do not spend time polishing footer integration yet.

- [ ] **Step 3: Implement callback/reset behavior**

`AuthCallbackPage.vue`:

- read query/hash result
- show verified success or failure message
- route users to sign-in

`AuthResetPasswordPage.vue`:

- collect new password
- call reset endpoint

- [ ] **Step 4: Re-run smoke tests**

Run:

```bash
pnpm test:run src/__tests__/pages/HomePage.test.ts
```

Expected: PASS for route-level smoke assertions

- [ ] **Step 5: Commit**

```bash
git add src/pages/auth/AuthSignInPage.vue src/pages/auth/AuthSignUpPage.vue src/pages/auth/AuthForgotPasswordPage.vue src/pages/auth/AuthResetPasswordPage.vue src/pages/auth/AuthCallbackPage.vue src/router.ts
git commit -m "feat: add auth routes and pages"
```

---

### Task 9: Add first-login import confirmation flow

**Files:**
- Create: `src/components/Auth/GuestImportDialog.vue`
- Modify: `src/pages/HomePage.vue`
- Modify: `src/composables/auth/useAuth.ts`
- Modify: `src/__tests__/pages/HomePage.test.ts`

- [ ] **Step 1: Write failing import-flow tests**

Cover:

- first login with guest items and empty cloud watchlist opens confirmation dialog
- confirm imports guest watchlist and refreshes bootstrap data
- cancel skips import and leaves cloud watchlist untouched
- non-first-login never opens dialog

- [ ] **Step 2: Implement dialog component**

Minimal props:

```ts
open: boolean;
guestCount: number;
```

Emits:

- `confirm`
- `cancel`

- [ ] **Step 3: Implement orchestration in `HomePage` / `useAuth`**

Required state:

- whether current bootstrap reports first login
- whether guest watchlist has items
- whether cloud watchlist is empty
- whether user already responded during this session

- [ ] **Step 4: Re-run import-flow tests**

Run:

```bash
pnpm test:run src/__tests__/pages/HomePage.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Auth/GuestImportDialog.vue src/pages/HomePage.vue src/composables/auth/useAuth.ts src/__tests__/pages/HomePage.test.ts
git commit -m "feat: add first-login guest import confirmation"
```

---

### Task 10: Verification, cleanup, and docs

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/auth-supabase-vercel.md`
- Modify: `docs/auth-env.md`

- [ ] **Step 1: Add final documentation updates**

Document:

- required env vars
- local dev flow with `vercel dev`
- Supabase dashboard setup
- current limitation: OAuth deferred to phase 2

- [ ] **Step 2: Run targeted grep checks**

Run:

```bash
rg -n "localStorage\\.getItem\\(|localStorage\\.setItem\\(" src
rg -n "fundListM" src
```

Expected:

- authenticated watchlist path no longer depends on `localStorage`
- remaining `localStorage` usage is justified legacy/local cache only

- [ ] **Step 3: Run full verification**

Run:

```bash
pnpm test:run
pnpm type-check
pnpm lint
```

Expected:

- all tests pass
- type-check passes
- lint passes

- [ ] **Step 4: Manual verification**

Run local app and verify:

1. guest adds watchlist item and refreshes within same tab
2. register sends verification email
3. unverified account cannot log in
4. verified account logs in and loads empty cloud watchlist
5. first login with guest watchlist prompts import
6. confirm import moves watchlist to cloud
7. sign out returns to guest mode
8. forgot-password flow resets password and requires re-login

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md docs/auth-supabase-vercel.md docs/auth-env.md
git commit -m "docs: finalize auth sync rollout notes"
```

---

## Execution Notes

- Keep UI intentionally functional until the footer “登录” entry is designed; do not block backend and state integration on visual polish.
- Do not migrate old settings fields to cloud storage in this phase.
- Do not add Google/GitHub login in this plan.
- Prefer small commits after each task; each task should leave the app runnable.
- If the authenticated watchlist refactor starts pulling too much logic into `useSettings`, split watchlist ownership out rather than extending legacy settings persistence.

