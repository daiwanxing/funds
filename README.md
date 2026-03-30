# Funds Assistant

> 自选基金实时行情驾驶舱 — Bloomberg 风格暗色终端界面，实时展示估值涨跌幅与持仓收益。

## 功能特性

- **实时行情**：每分钟自动拉取东方财富估值数据，交易时段自动刷新
- **多类型基金支持**：
  - 普通场外基金：优先展示实时估值（`GSZ / GSZZL / GZTIME`）
  - 场内基金 / ETF：使用交易所实时价格（`NEWPRICE / CHANGERATIO / HQDATE`）
  - 估值缺失时自动回退至上一日净值
- **持仓收益计算**：填写份额与成本价，自动计算今日估值收益与累计持有收益
- **全局指数走马灯**：顶部实时滚动展示大盘指数行情
- **基金搜索**：支持按拼音、汉字、基金代码模糊搜索，快速添加自选
- **拖拽排序**：基金列表支持拖拽调整顺序
- **多维度排序**：可按涨跌幅、收益额等字段单独排序
- **账号云同步**：注册登录后，自选基金跨设备实时同步
- **游客模式**：未登录时使用 `sessionStorage` 本地存储自选，登录后支持一键导入
- **AI 洞察抽屉**：内置 AI 决策面板入口（即将上线）
- **市场状态感知**：自动识别节假日与交易时间，休市期间停止轮询

## 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Vue 3 + `<script setup>` + TypeScript |
| 构建工具 | Vite 8 |
| 样式 | UnoCSS + CSS Design Tokens |
| 状态管理 | Pinia |
| 数据请求 | TanStack Query (`@tanstack/vue-query`) + Axios |
| 身份鉴权 | Supabase Auth（邮箱登录 + 密码找回） |
| 数据库 | Supabase (PostgreSQL) |
| 部署平台 | Vercel（Serverless Functions + Proxy Rewrites） |
| 工具链 | ESLint v10 · oxfmt · vue-tsc · Vitest |

## 数据来源

行情数据经 Vercel Proxy Rewrite 透明转发至东方财富，**无需自行申请 API Key**：

| 路径 | 上游 |
|---|---|
| `/api/fund/*` | `fundmobapi.eastmoney.com`（基金估值主接口） |
| `/api/fundgz/*` | `fundgz.1234567.com.cn`（估值补全接口） |
| `/api/search/*` | `fundsuggest.eastmoney.com`（基金搜索） |
| `/api/index/*` | `push2.eastmoney.com`（大盘指数） |
| `/api/kline/*` | `push2his.eastmoney.com`（历史 K 线） |

## 运行开发

**环境要求**：Node ≥ 20.19 · pnpm

```bash
# 安装依赖
pnpm install

# 拉取 Vercel 环境变量（首次运行需登录 Vercel CLI）
pnpm vercel:pull-env
```

### 开发模式

```bash
# 默认（推荐）：启动 vercel dev，同时提供前端 + /api/* 本地函数
pnpm dev

# 纯 UI 调试（不含 api/ 本地函数，登录/同步接口将返回 404）
pnpm dev:ui
```

> `pnpm dev` 通过 `scripts/dev-vercel.sh` 启动 `vercel dev`；
> Vercel 在本地再通过 `vercel.json → devCommand` 调用 `pnpm dev:ui` 作为前端服务，避免递归。

### 其他命令

```bash
pnpm build        # 类型检查 + 生产构建
pnpm type-check   # vue-tsc + tsc（含 api/）
pnpm lint         # ESLint v10
pnpm lint:fix     # ESLint 自动修复
pnpm fmt          # oxfmt 格式化
pnpm test:run     # Vitest 单次运行
pnpm test         # Vitest 监视模式
```

## 项目结构

```
funds/
├── api/               # Vercel Serverless Functions（auth · me · 转发代理）
├── src/
│   ├── pages/         # 页面（多单词命名，Page 后缀）
│   │   ├── Dashboard/         # 主行情驾驶舱
│   │   └── Authentication/    # 登录 · 密码找回 · OAuth 回调
│   ├── components/    # 纯展示 UI 组件
│   ├── composables/   # 业务逻辑（按领域分目录）
│   │   ├── fund/      # 行情拉取 · Quote 解析 · 排序
│   │   ├── watchlist/ # 游客自选管理
│   │   ├── auth/      # 登录态
│   │   ├── index/     # 大盘指数
│   │   ├── holiday/   # 节假日判断
│   │   ├── preferences/ # 用户偏好持久化
│   │   └── drag/      # 拖拽排序
│   ├── stores/        # Pinia（auth.ts）
│   ├── types/         # 类型定义（按领域分文件）
│   ├── utils/         # 工具函数（marketStatus · formatters · storage）
│   └── styles/        # CSS Design Tokens（tokens.css）
├── supabase/          # 数据库迁移文件
├── vercel.json        # 部署与代理规则
├── vite.config.ts
└── uno.config.ts
```

## 行情解析优先级

行情字段回退逻辑集中在 `src/composables/fund/quote.ts`，优先级如下：

1. **实时估值**（`GSZ / GSZZL / GZTIME`）— 适用于普通开放式基金  
2. **交易所实时价格**（`NEWPRICE / CHANGERATIO / HQDATE`）— 适用于 ETF / 场内基金  
3. **上一日净值**（`NAV / NAVCHGRT`）— 估值与交易所数据均缺失时兜底

## 身份与数据持久化规则

| 场景 | 自选存储位置 |
|---|---|
| 已登录 | Supabase 云端（`/api/me/watchlist`） |
| 游客 | `sessionStorage`（仅当前标签页） |
| 本地偏好 | `localStorage`（排序、显示开关等非账号数据） |

## Star History

<a href="https://www.star-history.com/#x2rr/funds&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=x2rr/funds&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=x2rr/funds&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=x2rr/funds&type=date&legend=top-left" />
 </picture>
</a>

## 隐私协议

[点击跳转](https://x2rr.github.io/funds/privacy.html)
