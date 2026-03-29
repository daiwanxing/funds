# FundStation 认证与同步设计

> 版本：v1.0
> 更新：2026-03-29
> 适用阶段：首期登录注册与云端同步

---

## 目标

为基金助手补齐一套可上线的账号能力，满足以下首期需求：

- 邮箱 + 密码注册
- 必须完成邮箱验证后才能登录
- 支持找回密码
- 支持多设备同步自选基金
- 未登录用户可继续以游客模式使用
- 游客模式不自动同步
- 首次完成注册并首次成功登录后，如果检测到本地游客自选，登录成功后弹窗确认是否导入账号

---

## 非目标

以下内容不在首期范围内：

- Google / GitHub 一键登录
- 会员、订阅、付费体系
- 旧版本地设置项迁移
- 多端冲突合并
- 复杂权限模型

Google / GitHub OAuth 作为第二阶段预留。

---

## 总体架构

采用 `Supabase Auth + Supabase Postgres + Vercel Functions BFF`。

职责划分如下：

- 前端：
  - 只调用自有 API
  - 不直接读写 Supabase 业务表
  - 登录后通过 `/api/me/bootstrap` 获取首页主数据
- Vercel Functions：
  - 作为 BFF
  - 负责注册、登录、找回密码、重置密码等认证中转
  - 负责读取和写入用户自选基金数据
  - 负责维护服务端会话 cookie
- Supabase Auth：
  - 负责邮箱密码注册
  - 负责邮箱验证
  - 负责找回密码与重置密码
- Supabase Postgres：
  - 负责持久化用户自选基金数据

---

## 会话策略

- 登录成功后，由 BFF 建立服务端会话。
- 前端不直接持久化业务 token。
- 推荐使用 `HttpOnly` cookie 维持登录态。
- 前端通过 `/api/me/bootstrap` 判断当前是否已登录，并拉取业务数据。
- 游客模式下不建立云端会话。

说明：

- 业务数据不再使用 `localStorage` 作为正式持久化源。
- 游客模式的数据仅保存在浏览器会话中，建议使用 `sessionStorage`。

---

## 数据范围

首期云端只同步“自选基金”。

不纳入首期同步的数据：

- 旧版本地设置项
- 应用缓存字段
- 匿名本地标识
- 版本号等应用元数据

原因：

- 当前 repo 为 fork 版本，旧设置字段后续会删除
- 首期目标聚焦在登录、注册、找回密码与自选同步主链路

---

## 登录与注册流程

### 1. 游客进入

- 未登录用户可直接进入首页。
- 游客可以添加和删除自选基金。
- 游客自选仅保存在当前浏览器会话中，不同步到云端。
- 后续 UI 入口预期放在 footer 区域的“登录”按钮，但本设计文档暂不展开 UI 细节。

### 2. 邮箱注册

- 用户输入邮箱和密码，提交到 `POST /api/auth/sign-up`
- BFF 调用 Supabase 注册接口
- Supabase 发送邮箱验证邮件
- 注册成功后不自动登录
- 前端提示用户前往邮箱完成验证

### 3. 邮箱验证

- 用户点击邮件中的验证链接
- Supabase 完成邮箱确认
- 验证完成后跳回前端回调页，例如 `/auth/callback`
- 回调页只用于展示验证结果和引导登录，不直接建立正式登录态

### 4. 邮箱密码登录

- 用户输入邮箱和密码，提交到 `POST /api/auth/sign-in`
- BFF 调用 Supabase 登录
- 若邮箱未验证，则拒绝登录并返回明确提示
- 若登录成功，则 BFF 建立服务端会话 cookie
- 前端随后请求 `GET /api/me/bootstrap`

### 5. 首次登录本地自选导入

满足以下条件时，前端在首次登录成功后弹出确认框：

- 这是该账号首次成功登录
- 当前游客态存在本地自选基金
- 云端自选为空

弹窗文案方向：

- 检测到本地自选，是否导入到账号

用户选择结果：

- 确认：调用导入逻辑，将游客自选写入云端
- 取消：不导入，本次会话直接使用云端空数据

首期只导入自选基金，不导入任何旧设置字段。

### 6. 退出登录

- 前端调用 `POST /api/auth/sign-out`
- BFF 清理服务端会话 cookie
- 页面切回游客模式
- 退出后不自动把云端数据回写成新的游客数据

---

## 找回密码流程

### 1. 发起找回密码

- 用户输入邮箱，提交到 `POST /api/auth/forgot-password`
- BFF 调用 Supabase 发送重置密码邮件
- 接口返回统一成功提示，不暴露邮箱是否存在

### 2. 重置密码

- 用户点击邮件链接进入 `/auth/reset-password`
- 前端输入新密码并提交到 `POST /api/auth/reset-password`
- BFF 调用 Supabase 完成密码更新
- 重置成功后要求用户重新登录

---

## 异常与边界规则

### 注册与验证

- 已注册但未验证的邮箱再次注册时，不创建第二个账户
- 返回“邮箱已注册，请先验证邮箱或重发验证邮件”
- 需要提供“重发验证邮件”能力

### 登录

- 未验证邮箱不得登录
- 登录失败时，前端提示应避免暴露过细账号状态
- 登录成功但 `bootstrap` 失败时，保留登录态并展示错误页或错误提示，不回退为游客态

### 找回密码

- 忘记密码接口统一返回成功提示
- 密码重置成功后强制重新登录
- 重置链接失效时，只提供重新发起找回密码的入口

### 游客与云端的边界

- 游客模式与登录态是两套数据源
- 首次登录导入只在用户确认后执行
- 非首次登录用户不自动导入游客数据
- 云端数据是登录态下的唯一主数据源

### 数据一致性

- 首期采用整体覆盖保存策略
- 若多端同时修改，以最后一次保存为准
- 首期不做冲突合并

---

## API 设计

### 认证接口

#### `POST /api/auth/sign-up`

请求体：

```json
{
  "email": "user@example.com",
  "password": "******"
}
```

职责：

- 注册账号
- 发送邮箱验证邮件
- 不创建正式登录态

#### `POST /api/auth/sign-in`

请求体：

```json
{
  "email": "user@example.com",
  "password": "******"
}
```

职责：

- 验证邮箱密码
- 仅允许已验证邮箱登录
- 登录成功后建立服务端会话

#### `POST /api/auth/sign-out`

职责：

- 清理服务端会话

#### `POST /api/auth/forgot-password`

请求体：

```json
{
  "email": "user@example.com"
}
```

职责：

- 发送重置密码邮件

#### `POST /api/auth/reset-password`

请求体：

```json
{
  "password": "******"
}
```

职责：

- 更新密码
- 成功后要求重新登录

### 用户数据接口

#### `GET /api/me/bootstrap`

用途：

- 登录后首页初始化
- 一次返回当前用户首页所需核心数据

返回示意：

```json
{
  "authenticated": true,
  "profile": {
    "email": "user@example.com",
    "isFirstLogin": false
  },
  "watchlist": [
    {
      "fundCode": "005827",
      "num": 0,
      "cost": 0,
      "sortOrder": 0
    }
  ]
}
```

#### `PUT /api/me/watchlist`

请求体示意：

```json
{
  "watchlist": [
    {
      "fundCode": "005827",
      "num": 0,
      "cost": 0,
      "sortOrder": 0
    }
  ]
}
```

职责：

- 整体覆盖保存用户自选基金

#### `POST /api/me/watchlist/import-guest`

请求体示意：

```json
{
  "watchlist": [
    {
      "fundCode": "005827",
      "num": 0,
      "cost": 0,
      "sortOrder": 0
    }
  ]
}
```

职责：

- 首次登录时导入游客自选基金
- 仅在满足首次登录条件且用户确认后调用

---

## 数据库设计

### `user_profiles`

字段建议：

- `id`
- `email`
- `created_at`
- `updated_at`
- `first_login_completed`

说明：

- `first_login_completed` 用于判断是否还需要触发首次导入确认逻辑

### `user_watchlist_items`

字段建议：

- `id`
- `user_id`
- `fund_code`
- `num`
- `cost`
- `sort_order`
- `created_at`
- `updated_at`

约束建议：

- `(user_id, fund_code)` 唯一

---

## 首期落地顺序

1. 打通注册、邮箱验证、登录、退出登录
2. 打通 `/api/me/bootstrap`
3. 打通 `/api/me/watchlist`
4. 将当前自选基金从本地持久化切换为“游客会话态 / 登录云端态”
5. 增加首次登录导入确认弹窗与导入接口
6. 补齐找回密码与重置密码
7. 第二阶段再引入 Google / GitHub OAuth

---

## 第二阶段预留

以下能力在后续版本可扩展：

- Google 登录
- GitHub 登录
- 更多账户绑定策略
- 多设备冲突合并
- 更多云端用户偏好同步

