# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

"自选基金助手" — 一个基金行情查看应用，用于实时查看自选基金的估值涨跌幅、收益等信息。从 Chrome 扩展（Manifest V2）迁移到 Web 应用的版本。基于 Vue 3 + Vite 构建，暗色主题金融终端风格。

项目正在分阶段开发（Phase 2–4），Home.vue 中有多处占位标记。

## 常用命令

```bash
pnpm install             # 安装依赖（项目使用 pnpm）
pnpm dev                 # 启动 Vite 开发服务器（端口 3000）
pnpm build               # vue-tsc 类型检查 + Vite 生产构建
pnpm test:run            # 运行测试一次（Vitest）
pnpm test:coverage       # 生成测试覆盖率报告
pnpm lint                # oxlint 检查代码
pnpm lint:fix            # 自动修复 lint 问题
pnpm type-check          # TypeScript 类型检查（vue-tsc --noEmit）
pnpm fmt                 # oxfmt 格式化代码
```

运行单个测试文件：`pnpm vitest run src/__tests__/utils/formatters.test.ts`

## 架构

### 技术栈

- Vue 3 + TypeScript + Vite 8
- UnoCSS（presetWind3，Tailwind 兼容）+ Element Plus（全局引入，size: small）
- @tanstack/vue-query 管理服务端状态（数据获取、缓存、自动刷新）
- ECharts 5 图表、axios HTTP 客户端
- vue-router（hash 模式，两个路由：`/` Home、`/settings` Settings）
- 测试：Vitest + jsdom；代码质量：oxlint + oxfmt

### 数据流与状态管理

没有使用 Vuex/Pinia。状态分两层：

- **服务端状态**：通过 @tanstack/vue-query + composables（`useFundData`、`useGlobalIndices`）管理，负责 API 请求、缓存和自动刷新
- **本地状态**：通过 `storage` 工具（`src/utils/storage.ts`）封装 localStorage，所有配置存储在 `funds_config` 键下，回调风格 API（模拟原 Chrome 扩展 storage API）

### Dashboard Zone 布局

Home.vue 使用 CSS Grid 实现分区布局：

- Zone A（ticker）：全局指数走马灯，横跨全宽
- Zone B（console）：自选基金列表，左侧 60%
- Zone C（detail）：基金详情面板，右侧 40%（无基金时隐藏，Zone B 独占全宽）
- Zone D：AI 洞察抽屉（fixed 定位，FAB 触发）
- Zone E（status）：底部状态栏

### 双层设计令牌系统

颜色和样式定义在两处，需保持同步：

- `src/styles/tokens.css`：CSS 自定义属性，供 ECharts 配色、scoped CSS 等非 UnoCSS 场景使用
- `uno.config.ts`：UnoCSS theme + shortcuts，供模板中原子类使用

关键语义快捷类：`text-up`/`text-down`（涨跌色+等宽数字）、`text-p`/`text-s`/`text-t`（文字层级）、`bg-card`/`bg-surface`/`bg-root`（背景层级）、`btn-primary`/`btn-ghost`（按钮）、`num`（等宽数字）

涨跌配色遵循 A 股惯例：红涨（rise）绿跌（fall）。

### 组件与 Composables 约定

- 组件：`src/components/<Name>/` 文件夹，含 `.vue` 文件和 `index.ts` 桶导出
- Composables：`src/composables/<domain>/` 文件夹，`use*.ts` 实现 + `index.ts` 桶导出
- 路径别名：`@` → `./src`

### API 代理

开发环境通过 Vite 代理访问东方财富 API（见 `vite.config.ts`）：

- `/api/fund` → `https://fundmobapi.eastmoney.com`
- `/api/search` → `https://fundsuggest.eastmoney.com`
- `/api/index` → `https://push2.eastmoney.com`
- `/api/kline` → `https://push2his.eastmoney.com`

### 交易时间判断

`src/utils/marketStatus.ts` 中的 `isDuringDate()` 判断当前是否为 A 股交易时段（UTC+8）：上午 9:30–11:35、下午 13:00–15:05，排除周末和 `/holiday.json` 中的节假日。自动刷新逻辑依赖此判断。

### 测试

测试文件位于 `src/__tests__/` 目录（按源码路径镜像组织），使用 Vitest + jsdom。

## 注意事项

- 使用 pnpm
- UnoCSS 原子类优先，避免手写 CSS；使用 `uno.config.ts` 中定义的语义快捷类
- oxlint/oxfmt 是 Rust 实现的高性能 lint/format 工具
- 全局变量 `__APP_VERSION__` 由 Vite define 注入，值为 package.json version
