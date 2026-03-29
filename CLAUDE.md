# CLAUDE.md

AI agent 的项目地图。想了解某块知识，根据下方指引找到对应文件。

## 项目概述

"自选基金助手" — 基金行情查看 Web 应用，实时展示自选基金估值涨跌幅与收益。Vue 3 + Vite，Bloomberg 风格暗色终端界面。

## 常用命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 类型检查 + 生产构建
pnpm lint         # ESLint v10
pnpm fmt          # oxfmt 格式化
pnpm test:run     # 运行测试
```

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
| 全局状态结构 | `src/stores/fund.ts` |
| 交易时间判断逻辑 | `src/utils/marketStatus.ts` |
| 路由定义 | `src/router.ts` |
| 构建与代理配置 | `vite.config.ts` |

## 目录结构速览

```
src/
├── pages/        # 页面（多单词命名，Page 后缀）
├── components/   # 纯展示 UI 组件
├── composables/  # 业务逻辑（按领域分目录）
├── stores/       # Pinia 状态
├── types/        # 类型定义（按领域分文件）
├── utils/        # 工具函数
└── styles/       # 全局 CSS 令牌
```
