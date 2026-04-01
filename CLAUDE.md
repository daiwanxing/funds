# CLAUDE.md

AI agent 的项目地图。想了解某块知识，根据下方指引找到对应文件。

## 项目概述

"Funds Assistant" — 基金行情查看 Web 应用，实时展示自选基金估值涨跌幅与收益。Vue 3 + Vite，Bloomberg 风格暗色终端界面。

## 常用命令

```bash
pnpm dev          # 默认开发入口（Vercel dev：前端 + api/*.ts + rewrites）
pnpm dev:ui       # 仅前端 Vite（纯 UI 调试）
pnpm dev:vercel   # 同 pnpm dev
pnpm build        # 类型检查 + 生产构建
pnpm lint         # ESLint v10
pnpm fmt          # oxfmt 格式化
pnpm test:run     # 运行测试
```

## 开发模式说明

- 默认使用 `pnpm dev`。本项目登录、bootstrap、自选同步等核心流程依赖 `api/` 下的本地函数，纯 Vite 模式无法覆盖真实联调场景。
- `pnpm dev` / `pnpm dev:vercel` 通过 `scripts/dev-vercel.sh` 启动 `vercel dev`；Vercel 在本地会再调用 `vercel.json` 中的 `devCommand`，该命令固定为 `pnpm dev:ui`，用于提供前端开发服务器，避免递归调用 `pnpm dev` 本身。
- `pnpm dev:ui` 仅用于纯页面样式调试；在该模式下，`/api/auth/*`、`/api/me/*` 等接口不会被本地托管，相关请求可能返回 `404`。

## Completion Checklist

- 每次完成代码修改后，至少运行：
  - `pnpm test:run`（如果测试受影响或已存在测试）
  - `pnpm type-check`
  - `pnpm lint`
- 在回复中明确说明这些命令是否通过；如果未运行，必须说明原因。
- 不要默认运行会改写文件的命令，如 `pnpm lint:fix` 或 `pnpm fmt`，除非用户明确要求。
- 若修改了 `src/` 下的 TS/Vue 代码，`pnpm lint` 为必跑项。

## Data Fetching Rule

- 远程数据请求必须通过 TanStack Query 暴露，使用 `useQuery` 或 `useMutation`。
- 允许在 `src/api/` 中直接使用 `axios`，但 `src/pages/`、`src/components/`、`src/composables/`、`src/utils/` 中禁止直接写 `axios` 请求。
- `src/api/` 只负责纯请求与响应映射，不负责 Vue 状态、storage 写入或其他副作用。

## Market Data Rule

- 基金行情默认主数据源是东方财富 `FundMNewApi/FundMNFInfo`，由 `src/api/fund.ts` 统一拉取。
- 普通场外基金优先使用主接口中的实时估值字段 `GSZ / GSZZL / GZTIME`。
- 场内基金、ETF 等若主接口不提供估值字段，但提供交易所实时字段 `NEWPRICE / CHANGERATIO / HQDATE`，则前端按这组字段展示实时涨跌幅与更新时间。
- 若主接口既没有基金估值字段，也没有交易所实时字段，则补打一条东方财富 `fundgz.1234567.com.cn/js/<code>.js`，用返回的 `gsz / gszzl / gztime` 补全实时估值。
- 行情解析顺序与回退规则集中在 `src/composables/fund/quote.ts`，不要在页面组件里直接分支判断不同基金类型。
- 自选列表里的“更新时间”展示的是单只基金行情记录自带的时间字段，不是前端本地刷新时间。
- 底部状态栏“最后更新”展示的是本次列表数据完成刷新时的本地时间戳。

## Auth / Persistence Rule

- 登录态用户的自选基金主数据源是 `/api/me/bootstrap` 和 `/api/me/watchlist`，不得再从 `localStorage` 读取或写入登录用户的自选基金。
- 游客模式下的自选基金只允许存放在 `sessionStorage`。
- `localStorage` 仅保留本地展示偏好、缓存和非账号数据，不得继续承担自选基金持久化职责。

## 知识地图

| 想了解… | 去哪里找 |
|---|---|
| 组件如何命名、放在哪个目录 | `.rules/COMPONENT_NAMING.md` · `.rules/COMPONENT_ARCHITECTURE.md` |
| 类型定义如何组织、放在哪里 | `.rules/TYPE_MANAGEMENT.md` |
| ESLint 规则与约束 | `.rules/LINT.md` |
| 设计令牌、样式约定 | `src/styles/tokens.css` · `uno.config.ts` |
| API 数据获取与缓存策略 | `src/composables/fund/useFundData.ts` |
| 基金/指数数据源知识库与走马灯接源评估 | `docs/market-data-sources.md` |
| Supabase migration 规范与历史维护 | `docs/supabase-migration-guidelines.md` |
| 全局状态结构 | `src/stores/fund.ts` · `src/stores/auth.ts` |
| 交易时间判断逻辑 | `src/utils/marketStatus.ts` |
| 路由定义 | `src/router.ts` |
| 构建与代理配置 | `vite.config.ts` |

## 目录结构速览

```
src/
├── api/                        # 纯请求层（axios，不含 Vue 状态）
│   ├── auth.ts                 # 登录 / 注册 / OAuth 接口
│   ├── fund.ts                 # 基金行情接口
│   ├── holiday.ts              # 节假日接口
│   ├── http.ts                 # createHttp 工厂（统一拦截器）
│   ├── user.ts                 # 用户 bootstrap / watchlist 接口
│   └── index.ts
├── components/
│   ├── biz/                    # 业务组合组件（含逻辑）
│   │   ├── AuthDialog/         # 登录弹窗（AuthDialog.vue）
│   │   └── AuthForm/           # 登录表单（Login / Register / Forgot / OAuth 子面板）
│   └── ui/                     # 纯展示原子组件
│       ├── BrandLogo/          # 品牌 Logo（支持尺寸 / 变体 props）
│       ├── Dialog/             # 通用弹窗（Dialog.vue + types.ts）
│       ├── Dropdown/           # 下拉菜单（Dropdown / Item / Group / Divider）
│       └── Toast/              # 全局提示（Toast / ToastContainer）
├── composables/                # 业务 Composable（按领域分目录）
│   ├── drag/                   # useDragSort — 拖拽排序
│   ├── fund/                   # useFundData · useFundSearch · quote.ts
│   ├── holiday/                # useHoliday
│   ├── index/                  # useGlobalIndices · useIndexData · snapshots
│   ├── preferences/            # usePreferences
│   └── useToast.ts             # 全局 Toast 触发器
├── constants/                  # 应用级常量
│   ├── auth.ts                 # OAuth provider 列表等
│   ├── cache.ts                # TanStack Query key 常量
│   ├── market.ts               # 交易时间段等
│   └── preferences.ts          # 偏好设置默认值
├── layouts/
│   └── AuthLayout.vue          # 认证页公共布局
├── pages/
│   ├── Authentication/         # 认证流程页面
│   │   ├── Callback/           # OAuth 回调页（CallbackPage.vue）
│   │   ├── ResetPassword/      # 重置密码页
│   │   ├── SignIn/             # 登录页（SignInPage.vue）
│   │   ├── components/Globe/   # 认证页 3D 地球装饰
│   │   └── composables/        # useAuthGlobeMarkets
│   └── Dashboard/              # 主面板页面
│       ├── HomePage.vue        # 入口页（路由根组件）
│       └── components/
│           ├── ActionBar/      # 顶部操作栏（搜索 / 刷新）
│           ├── Auth/           # GuestImportDialog — 游客导入弹窗
│           ├── FundTable/      # 自选基金表格
│           ├── GlobalTicker/   # 全球指数走马灯
│           ├── StatusBar/      # 底部状态栏（UserBar.vue）
│           ├── FundSavedList.vue
│           ├── FundSearchList.vue
│           └── WatchlistHeader.vue
├── stores/                     # Pinia 全局状态
│   ├── auth.ts                 # 用户 / 会话状态
│   └── watchlist.ts            # 自选列表状态
├── types/                      # TypeScript 类型定义（按领域分文件）
│   ├── auth.ts · fund.ts · globe.ts
│   ├── holiday.ts · market.ts · preferences.ts
│   └── index.ts
├── utils/
│   ├── formatters.ts           # 数字 / 日期格式化
│   ├── marketStatus.ts         # 交易时间判断
│   └── storage.ts              # sessionStorage / localStorage 封装
├── styles/
│   └── tokens.css              # 全局 CSS 设计令牌
└── main.ts                     # 应用入口
```
