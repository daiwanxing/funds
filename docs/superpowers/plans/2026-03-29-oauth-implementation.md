# Funds Assistant OAuth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google and GitHub OAuth sign-in alongside existing email/password auth while preserving the current BFF-owned session model and first-login guest import flow.

**Architecture:** Keep Supabase Auth as the identity provider and Vercel Functions as the only auth boundary the Vue app talks to. The Vue app triggers `/api/auth/oauth/start`, the BFF handles provider redirects and callback exchange, writes the existing `HttpOnly` cookies, and the app continues to rely on `/api/me/bootstrap` for authenticated state.

**Tech Stack:** Vue 3, Vue Router, TanStack Query, Vitest, Vercel Functions, Supabase Auth, `@supabase/supabase-js`, `zod`

---

## File Map

### Server files

- Modify: `api/_lib/supabase-auth.ts`
  - Add OAuth provider type, start-login helper, and callback exchange helper.
- Modify: `api/_lib/app-url.ts`
  - Reuse existing app origin helpers for OAuth callback and final redirect construction.
- Create: `api/auth/oauth/start.ts`
  - Validate provider and redirect the browser to Supabase OAuth.
- Create: `api/auth/oauth/callback.ts`
  - Exchange callback code for a session, write auth cookies, ensure `user_profiles`, and redirect back to the app.
- Modify: `api/auth/sign-in.ts`
  - Reuse shared profile upsert/first-login logic if extraction becomes necessary.

### Frontend files

- Modify: `src/api/auth.ts`
  - Add helpers to build OAuth start URLs.
- Modify: `src/composables/auth/useAuth.ts`
  - Expose OAuth start helpers without changing bootstrap ownership.
- Modify: `src/pages/Authentication/SignIn/SignInPage.vue`
  - Add Google/GitHub buttons in login and register views.
- Modify: `src/pages/Authentication/Callback/CallbackPage.vue`
  - Handle OAuth success/error states in addition to email verification.
- Modify: `src/types/auth.ts`
  - Add any callback status types only if needed by the UI.

### Documentation

- Modify: `docs/auth-supabase-vercel.md`
  - Keep the implementation notes aligned with the final code shape.
- Modify: `docs/auth-env.md`
  - Document OAuth provider setup, redirect URLs, and required env/config.

### Tests

- Create: `src/__tests__/api/oauth-start.test.ts`
- Create: `src/__tests__/api/oauth-callback.test.ts`
- Create: `src/__tests__/pages/Authentication/SignIn/SignInPage.test.ts`
- Create: `src/__tests__/pages/Authentication/Callback/CallbackPage.test.ts`

---

### Task 1: Add OAuth start endpoint

**Files:**
- Modify: `api/_lib/supabase-auth.ts`
- Create: `api/auth/oauth/start.ts`
- Create: `src/__tests__/api/oauth-start.test.ts`

- [ ] **Step 1: Write the failing test for provider validation**

Test that `GET /api/auth/oauth/start?provider=google` redirects and `provider=wechat` returns `400`.

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test:run src/__tests__/api/oauth-start.test.ts
```

Expected: FAIL because the endpoint and helper do not exist.

- [ ] **Step 3: Write the failing test for redirect target**

Test that the endpoint calls the Supabase OAuth helper with:

- `provider: "google"` or `"github"`
- callback URL pointing to `/api/auth/oauth/callback`
- final app redirect encoded in state or query if needed

- [ ] **Step 4: Run the test to verify it fails for the expected reason**

Run:

```bash
pnpm test:run src/__tests__/api/oauth-start.test.ts
```

Expected: FAIL because the helper is missing or called with the wrong contract.

- [ ] **Step 5: Implement the minimal OAuth start helper**

Add a small provider union and helper in `api/_lib/supabase-auth.ts` that asks Supabase for a provider authorization URL.

- [ ] **Step 6: Implement the endpoint**

Minimal behavior:

- allow only `GET`
- validate provider
- call the helper
- `302` redirect to the provider URL
- on failure redirect to `/#/auth/callback?status=error&reason=provider_unavailable`

- [ ] **Step 7: Re-run the test**

Run:

```bash
pnpm test:run src/__tests__/api/oauth-start.test.ts
```

Expected: PASS

---

### Task 2: Add OAuth callback endpoint

**Files:**
- Modify: `api/_lib/supabase-auth.ts`
- Create: `api/auth/oauth/callback.ts`
- Create: `src/__tests__/api/oauth-callback.test.ts`

- [ ] **Step 1: Write the failing test for successful callback exchange**

Test that a valid callback:

- exchanges the code for a Supabase session
- writes the existing auth cookies
- upserts `user_profiles`
- redirects to `/#/auth/callback?status=success&source=oauth&provider=<provider>`

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test:run src/__tests__/api/oauth-callback.test.ts
```

Expected: FAIL because the endpoint does not exist.

- [ ] **Step 3: Write the failing test for callback failure**

Test that exchange failures do not write cookies and redirect to:

```txt
/#/auth/callback?status=error&reason=oauth_callback_failed
```

- [ ] **Step 4: Run the test to verify it fails correctly**

Run:

```bash
pnpm test:run src/__tests__/api/oauth-callback.test.ts
```

Expected: FAIL because the failure path is not implemented yet.

- [ ] **Step 5: Implement the minimal callback exchange helper**

Add helper(s) in `api/_lib/supabase-auth.ts` for code exchange and current-user lookup from the returned session.

- [ ] **Step 6: Implement the callback endpoint**

Minimal behavior:

- allow only `GET`
- validate required callback params
- exchange code for session
- write existing auth cookies
- upsert `user_profiles`
- compute `isFirstLogin` using the existing profile row
- redirect back to the front-end callback page

- [ ] **Step 7: Re-run the callback tests**

Run:

```bash
pnpm test:run src/__tests__/api/oauth-callback.test.ts
```

Expected: PASS

---

### Task 3: Add OAuth entry points to the sign-in page

**Files:**
- Modify: `src/api/auth.ts`
- Modify: `src/composables/auth/useAuth.ts`
- Modify: `src/pages/Authentication/SignIn/SignInPage.vue`
- Create: `src/__tests__/pages/Authentication/SignIn/SignInPage.test.ts`

- [ ] **Step 1: Write the failing UI test for OAuth buttons**

Test that the login view renders Google and GitHub buttons and the register view renders the same actions.

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test:run src/__tests__/pages/Authentication/SignIn/SignInPage.test.ts
```

Expected: FAIL because the buttons are absent.

- [ ] **Step 3: Write the failing navigation test**

Test that clicking each button sets `window.location.href` to `/api/auth/oauth/start?provider=google|github`.

- [ ] **Step 4: Run the test to verify it fails correctly**

Run:

```bash
pnpm test:run src/__tests__/pages/Authentication/SignIn/SignInPage.test.ts
```

Expected: FAIL because the click behavior is not implemented.

- [ ] **Step 5: Implement the minimal frontend helpers and buttons**

Keep the implementation small:

- build the OAuth start URL in `src/api/auth.ts`
- expose a tiny trigger helper in `useAuth.ts`
- add the two buttons to login/register panels in `SignInPage.vue`

- [ ] **Step 6: Re-run the sign-in page tests**

Run:

```bash
pnpm test:run src/__tests__/pages/Authentication/SignIn/SignInPage.test.ts
```

Expected: PASS

---

### Task 4: Upgrade the callback page to handle OAuth results

**Files:**
- Modify: `src/pages/Authentication/Callback/CallbackPage.vue`
- Create: `src/__tests__/pages/Authentication/Callback/CallbackPage.test.ts`

- [ ] **Step 1: Write the failing test for OAuth success messaging**

Test that `/#/auth/callback?status=success&source=oauth&provider=google` shows OAuth success copy and an action to continue.

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test:run src/__tests__/pages/Authentication/Callback/CallbackPage.test.ts
```

Expected: FAIL because the page only understands email-verification hashes today.

- [ ] **Step 3: Write the failing test for OAuth error messaging**

Test that error query params show a clear failure message and keep the user on an auth recovery path.

- [ ] **Step 4: Run the test to verify it fails correctly**

Run:

```bash
pnpm test:run src/__tests__/pages/Authentication/Callback/CallbackPage.test.ts
```

Expected: FAIL because OAuth error states are not implemented.

- [ ] **Step 5: Implement the minimal callback-page parser**

Support:

- existing email verification hash parsing
- OAuth success query params
- OAuth error query params

- [ ] **Step 6: Re-run the callback-page tests**

Run:

```bash
pnpm test:run src/__tests__/pages/Authentication/Callback/CallbackPage.test.ts
```

Expected: PASS

---

### Task 5: Update configuration docs and run the auth regression set

**Files:**
- Modify: `docs/auth-env.md`
- Modify: `docs/auth-supabase-vercel.md`

- [ ] **Step 1: Write doc updates for provider setup**

Document:

- Supabase Google/GitHub providers
- Google Cloud and GitHub callback configuration
- local and production callback URLs

- [ ] **Step 2: Run the targeted OAuth tests**

Run:

```bash
pnpm test:run src/__tests__/api/oauth-start.test.ts src/__tests__/api/oauth-callback.test.ts src/__tests__/pages/Authentication/SignIn/SignInPage.test.ts src/__tests__/pages/Authentication/Callback/CallbackPage.test.ts
```

Expected: PASS

- [ ] **Step 3: Run project verification**

Run:

```bash
pnpm test:run
pnpm type-check
pnpm lint
```

Expected: PASS
