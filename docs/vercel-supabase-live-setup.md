# Vercel + Supabase 真实环境配置说明

> 在真实托管的 Supabase 项目上联调认证流程前，先执行一次这份配置。

## 1. 本地 CLI 登录

```bash
npx vercel login
npx supabase login
```

## 2. 关联当前 Vercel 项目

```bash
npx vercel link
```

预期结果：

- 生成 `.vercel/project.json`
- 后续执行 `pnpm vercel:pull-env` 时会自动对应到当前 Vercel 项目

## 3. 准备本地环境变量

```bash
cp .env.example .env.local
```

然后在 `.env.local` 中填入：

- `APP_URL=http://localhost:3000`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_COOKIE_SECRET`

`AUTH_COOKIE_SECRET` 可用以下命令生成：

```bash
openssl rand -hex 32
```

## 4. 配置 Supabase Auth

在 Supabase Dashboard 中：

- **Authentication → Providers → Email**
  - 启用 Email provider
  - 启用 Confirm email

- **Authentication → URL Configuration**
  - Site URL：`https://funds-inky.vercel.app`
  - Redirect URL：`http://localhost:3000/#/auth/callback`
  - Redirect URL：`https://funds-inky.vercel.app/#/auth/callback`
  - Redirect URL：`http://localhost:3000/api/auth/oauth/callback`
  - Redirect URL：`https://funds-inky.vercel.app/api/auth/oauth/callback`

- **Authentication → Providers → Google / GitHub**
  - 将 provider 控制台中的 callback 配置为：
    - `https://<your-project-ref>.supabase.co/auth/v1/callback`

说明：

- 当前系统没有对外开放 `reset-password` 前端路由，因此这里不需要再配置对应前端 redirect URL
- 当前仅使用一套托管的 Supabase 项目，因此本地联调和生产环境共享同一套 Supabase 认证配置
- Google / GitHub 不会直接回调你的 Vercel 应用，而是先回到 Supabase，再由 Supabase 跳回你的应用

## 5. 关联 Supabase 并推送 migration

先在 Supabase 控制台里找到 `project ref`，然后执行：

```bash
npx supabase link --project-ref <your-project-ref>
pnpm supabase:db:push
```

预期会创建：

- `public.user_profiles`
- `public.user_watchlist_items`

## 6. 同步环境变量到 Vercel

在 **Vercel Project Settings → Environment Variables** 中添加与本地相同的变量：

- `APP_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_COOKIE_SECRET`

当前建议值：

- Development：`http://localhost:3000`
- Production：`https://funds-inky.vercel.app`

如果你希望把 Vercel 中的变量拉回本地：

```bash
pnpm vercel:pull-env
```

## 7. 启动本地全栈联调

```bash
pnpm dev:vercel
```

然后验证：

1. 打开 `http://localhost:3000/#/auth/sign-in`
2. 使用邮箱密码注册
3. 完成邮箱验证
4. 登录
5. 确认应用能正常请求 `GET /api/me/bootstrap`
6. 添加一条自选基金并刷新页面，确认数据仍在

如果要验证 OAuth，再继续检查：

1. 点击 `Continue with Google`
2. 确认先经过 Supabase 的 `/auth/v1/callback`
3. 再确认浏览器回到你的 `/api/auth/oauth/callback`
4. 确认最终回到 `/#/auth/callback?status=success&source=oauth...`
5. 点击“进入首页”
6. 确认页面已进入登录态

GitHub 流程同理。

## 8. 部署到当前线上域名

如需重新部署：

```bash
npx vercel
```

当前生产域名按你的实际情况应视为：

- `https://funds-inky.vercel.app`

如果未来切换到自定义域名，需要同步更新：

- Supabase Site URL
- Supabase Redirect URLs
- Google OAuth redirect URI（Supabase `/auth/v1/callback`）
- GitHub OAuth callback URL（Supabase `/auth/v1/callback`）
- Vercel `APP_URL`
