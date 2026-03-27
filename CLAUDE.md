# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

"自选基金助手" — 一个基金行情查看应用，用于实时查看自选基金的估值涨跌幅、收益等信息。这是从 Chrome 扩展（Manifest V2）迁移到 Web 应用的版本。基于 Vue 3 + Vite 构建。

## 常用命令

```bash
npm install              # 安装依赖
npm run dev              # 开发调试，启动 Vite 开发服务器（端口 3000）
npm run build            # 生产构建，输出到 dist/
npm run preview          # 预览生产构建
npm run test             # 运行测试（watch 模式）
npm run test:run         # 运行测试一次
npm run test:coverage    # 生成测试覆盖率报告
npm run lint             # 使用 oxlint 检查代码
npm run lint:fix         # 自动修复 lint 问题
npm run type-check       # 运行 TypeScript 类型检查
npm run fmt              # 使用 oxfmt 格式化代码
npm run fmt:check        # 检查代码格式
```

## 架构

### 技术栈

- **框架**: Vue 3 + TypeScript
- **构建**: Vite
- **样式**: UnoCSS（Tailwind CSS 兼容）
- **UI 组件**: Element Plus（按需引入）
- **图表**: ECharts 5
- **测试**: Vitest + jsdom
- **代码质量**: oxlint + oxfmt
- **HTTP 客户端**: axios

### 项目结构

```
src/
├── components/          # 可复用组件（按功能分组）
│   ├── FundTable/       # 基金表格
│   ├── FundSearch/      # 基金搜索
│   ├── IndexBar/        # 指数行情栏
│   ├── ActionBar/       # 操作栏
│   ├── ConfigBox/       # 配置导入导出
│   ├── settings/        # 设置相关组件
│   └── ...
├── composables/         # 逻辑复用（Vue 3 Composition API）
│   ├── fund/            # 基金数据管理
│   ├── importExport/    # 导入导出逻辑
│   ├── drag/            # 拖拽排序
│   └── ...
├── pages/               # 页面级组件
│   ├── Home.vue         # 主页
│   └── Settings.vue     # 设置页
├── App.vue              # 根组件
└── main.ts              # 应用入口
```

### 核心模式

**Composables（组合式函数）** — 业务逻辑通过 composables 实现，而非 mixins 或 class 组件。例如 `useFundData()` 管理基金数据获取和缓存。

**组件组织** — 每个组件在独立文件夹中，包含 `.vue` 文件和 `index.ts` 导出。

**API 代理** — 开发环境通过 Vite 代理访问东方财富 API（见 vite.config.ts）：
- `/api/fund` → `https://fundmobapi.eastmoney.com`
- `/api/search` → `https://fundsuggest.eastmoney.com`
- `/api/index` → `https://push2.eastmoney.com`
- `/api/kline` → `https://push2his.eastmoney.com`

### 测试

测试文件位于 `src/**/*.test.ts`，使用 Vitest + jsdom。运行 `npm run test:run` 执行单次测试。

### 数据来源

基金和指数数据来自东方财富（eastmoney.com）API。

## 注意事项

- 项目正在从 Vue 2 + Webpack 迁移到 Vue 3 + Vite，部分旧文件仍在 git 中标记为删除
- 使用 TypeScript，确保类型检查通过（`npm run type-check`）
- UnoCSS 提供原子化 CSS，避免手写 CSS；使用 `uno.config.ts` 中定义的快捷类（如 `text-up`、`text-down`、`btn`）
- oxlint 和 oxfmt 是 Rust 实现的高性能工具，比传统 ESLint/Prettier 更快
