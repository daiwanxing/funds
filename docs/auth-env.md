# 认证环境变量与 OAuth 配置说明

> 登录、注册、邮箱验证、Google / GitHub OAuth 联调所需配置。

---

## 必需环境变量

| 变量名 | 说明 | 获取位置 |
|---|---|---|
| `APP_URL` | 应用对外访问地址，用于拼接认证回调与 OAuth callback | 本地：`http://localhost:3000`；生产：你的正式域名 |
| `SUPABASE_URL` | Supabase 项目地址，当前项目为 `https://fwcijmyvaodoxdbmpmav.supabase.co` | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase 匿名公钥 | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key，仅服务端使用，严禁暴露到前端 | Supabase Dashboard → Settings → API |
| `AUTH_COOKIE_SECRET` | 登录态 cookie 使用的服务端密钥，建议用 `openssl rand -hex 32` 生成 | 自行生成 |

---

## Supabase 控制台配置

### 邮箱认证相关跳转地址

在 **Supabase Dashboard → Authentication → URL Configuration** 中配置：

- **Site URL**
  - 当前只有一套生产 Supabase 项目时，建议直接填你的正式域名：`https://funds-inky.vercel.app`
  - 如需本地联调，可临时保留 `http://localhost:3000` 在 Redirect URLs 白名单中，无需单独再建一套本地 Supabase

- **Redirect URLs** 白名单建议包含：
  - `http://localhost:3000/#/auth/callback`
  - `https://funds-inky.vercel.app/#/auth/callback`

### OAuth 回调地址

如果要启用 Google / GitHub OAuth，必须继续由 BFF 接管回调，不要让第三方直接回前端 hash 页。

在 **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs** 中补充：

- 本地 OAuth callback：`http://localhost:3000/api/auth/oauth/callback`
- 生产 OAuth callback：`https://funds-inky.vercel.app/api/auth/oauth/callback`

说明：

- Google / GitHub 登录完成后，会先经过 Supabase 的 `/auth/v1/callback`
- Supabase 再跳回你的 `/api/auth/oauth/callback`
- 这个服务端接口负责 exchange code、写 `HttpOnly` cookie、再跳回 `/#/auth/callback`
- 不要把第三方 provider 的回调地址直接写成 `/#/auth/callback`

### 邮箱验证

在 **Supabase Dashboard → Authentication → Providers → Email** 中启用：

- `Confirm email`

本项目要求邮箱注册用户完成验证后才能登录。

### SMTP

当前你只有一套生产 Supabase 项目，因此无论本地联调还是线上环境，都会共享这套邮件与认证配置。正式环境建议配置自定义 SMTP，提高可达性与投递稳定性。

---

## Google Provider 配置

在 **Supabase Dashboard → Authentication → Providers → Google** 中启用 Google 登录。

你还需要在 **Google Cloud Console → APIs & Services → Credentials** 中创建 OAuth Client，并配置：

- Authorized redirect URI：
  - `https://fwcijmyvaodoxdbmpmav.supabase.co/auth/v1/callback`

之后将以下信息填回 Supabase：

- Google Client ID
- Google Client Secret

说明：

- Google 控制台里登记的 redirect URI 不是你的 Vercel 应用地址
- Google 先回调到 Supabase 的 `/auth/v1/callback`
- Supabase 再根据 `redirectTo` 跳回你的应用 `https://funds-inky.vercel.app/api/auth/oauth/callback`

---

## GitHub Provider 配置

在 **Supabase Dashboard → Authentication → Providers → GitHub** 中启用 GitHub 登录。

你还需要在 **GitHub Developer Settings → OAuth Apps** 中创建或修改 OAuth App，并配置：

- Authorization callback URL：
  - `https://fwcijmyvaodoxdbmpmav.supabase.co/auth/v1/callback`

之后将以下信息填回 Supabase：

- GitHub Client ID
- GitHub Client Secret

说明：

- GitHub OAuth App 里登记的 callback 也不是你的 Vercel 应用地址
- GitHub 先回调到 Supabase 的 `/auth/v1/callback`
- Supabase 再跳回你的应用 `https://funds-inky.vercel.app/api/auth/oauth/callback`

---

## 本地开发配置

说明：

- 当前只使用一套生产 Supabase 项目
- 本地开发时也会连接这套线上 Supabase
- 因此修改 Redirect URLs、Provider 配置、邮件模板前，需要确认不会影响线上用户

### 1. 创建 `.env.local`

```env
APP_URL=http://localhost:3000
SUPABASE_URL=https://fwcijmyvaodoxdbmpmav.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_COOKIE_SECRET=your-random-hex-secret
```

### 2. 推送 Supabase migration

```bash
npx supabase login
npx supabase link --project-ref fwcijmyvaodoxdbmpmav
pnpm supabase:db:push
```

### 3. 启动本地联调环境

```bash
pnpm dev
```

这会启动 `vercel dev`，同时托管前端和 `/api/*` 接口。

如果要测试 OAuth，本地还需要同时确认：

- `APP_URL` 保持为 `http://localhost:3000`
- Supabase Redirect URLs 已包含 `http://localhost:3000/api/auth/oauth/callback`
- Google / GitHub 控制台也已加入同一条 callback 地址

---

## Vercel 部署配置

在 **Vercel Dashboard → Settings → Environment Variables** 中配置：

- `APP_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_COOKIE_SECRET`

推荐值：

- Production `APP_URL`：`https://funds-inky.vercel.app`
- Preview `APP_URL`：建议先不要启用 OAuth，除非你把 preview 域名也同步加入 Supabase、Google、GitHub 的回调白名单
- Development `APP_URL`：`http://localhost:3000`

注意：

- `SUPABASE_SERVICE_ROLE_KEY` 只能用于服务端函数，绝不能暴露到浏览器

拉取 Vercel 环境变量到本地：

```bash
pnpm vercel:pull-env
```

---

## OAuth 上线前检查清单

### 1. 先确认两个基础域名

需要先明确：

- 本地联调域名：`http://localhost:3000`
- 正式生产域名：`https://funds-inky.vercel.app`

这两个地址必须在以下位置保持一致：

- `APP_URL`
- Supabase Site URL / Redirect URLs
- Supabase 的应用回跳地址

同时还需要单独确认 provider 控制台中的 callback：

- Google OAuth redirect URI = `https://fwcijmyvaodoxdbmpmav.supabase.co/auth/v1/callback`
- GitHub OAuth callback URL = `https://fwcijmyvaodoxdbmpmav.supabase.co/auth/v1/callback`

### 2. 配置 Supabase

在 **Supabase Dashboard → Authentication → URL Configuration** 中确认：

- Site URL 已正确设置
- 以下地址都在 Redirect URLs 白名单中：
  - `http://localhost:3000/#/auth/callback`
  - `http://localhost:3000/api/auth/oauth/callback`
  - `https://funds-inky.vercel.app/#/auth/callback`
  - `https://funds-inky.vercel.app/api/auth/oauth/callback`

并在 **Authentication → Providers** 中启用：

- `Google`
- `GitHub`

### 3. 配置 Google

在 **Google Cloud Console** 中：

- 创建 OAuth Client
- 填入回调地址：
  - `https://fwcijmyvaodoxdbmpmav.supabase.co/auth/v1/callback`

然后把 Google 的：

- Client ID
- Client Secret

填回 Supabase。

### 4. 配置 GitHub

在 **GitHub Developer Settings → OAuth Apps** 中：

- 创建或修改 OAuth App
- 填入回调地址：
  - `https://fwcijmyvaodoxdbmpmav.supabase.co/auth/v1/callback`

然后把 GitHub 的：

- Client ID
- Client Secret

填回 Supabase。

### 5. 配置 Vercel

确认 Vercel 环境变量已就位：

- `APP_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_COOKIE_SECRET`

### 6. 本地联调流程

启动：

```bash
pnpm dev
```

然后验证：

1. 打开 `/auth/sign-in`
2. 点击 `Continue with Google`
3. 完成 Google 授权
4. 确认浏览器会先经过 Supabase 的 `/auth/v1/callback`
5. 再确认回到你的 `/api/auth/oauth/callback`
6. 确认最终跳回 `/#/auth/callback?status=success&source=oauth...`
7. 点击“进入首页”
8. 确认 `/api/me/bootstrap` 返回 `authenticated: true`

同样再走一遍 GitHub 登录。

### 7. 生产联调流程

部署完成后建议至少检查：

1. Google 登录可用
2. GitHub 登录可用
3. 登录后能进入首页并拉到 `bootstrap`
4. 登出后两枚 auth cookie 被清掉
5. 首次登录用户仍能触发游客自选导入提示

### 8. 已知风险

- Preview deployment 默认不会自动支持 OAuth，除非你把 preview 域名也加入所有 provider 的回调白名单
- 如果 `APP_URL` 与真实访问域名不一致，OAuth 会表现为回调异常或 cookie 不稳定
- 当前系统没有对外开放 `reset-password` 前端路由，因此文档中不再要求配置对应的前端 redirect URL
- “邮箱密码账号”和“第三方账号”同邮箱归并策略还没有完全落地，正式上线前应继续明确

---

## 当前限制

- 本仓库当前不需要额外新增 OAuth 专用环境变量
- OAuth 所需的关键信息主要配置在 Supabase、Google、GitHub 控制台
- 账号归并 / 绑定策略仍是后续需要继续完善的产品与后端规则
