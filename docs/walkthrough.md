# Phase 1 进度报告

## 已完成（Steps 1-6）

### 基础设施搭建

| 文件 | 作用 |
|---|---|
| [index.html](file:///Users/daiwanxing/Desktop/市场行情/funds/index.html) | Vite 入口，替代原 popup.html + options.html |
| [vite.config.ts](file:///Users/daiwanxing/Desktop/市场行情/funds/vite.config.ts) | Vite 8 配置：Vue + UnoCSS 插件、东方财富 API 代理、路径别名 |
| [uno.config.ts](file:///Users/daiwanxing/Desktop/市场行情/funds/uno.config.ts) | UnoCSS：presetWind3 + presetIcons + 涨跌色 shortcuts |
| [tsconfig.json](file:///Users/daiwanxing/Desktop/市场行情/funds/tsconfig.json) | TypeScript 5 严格模式 + bundler 模块解析 |
| [package.json](file:///Users/daiwanxing/Desktop/市场行情/funds/package.json) | 全新依赖清单（pnpm），移除全部 Webpack/Vue 2/Chrome 旧依赖 |
| [vitest.config.ts](file:///Users/daiwanxing/Desktop/市场行情/funds/vitest.config.ts) | Vitest 配置（jsdom 环境） |
| [oxlintrc.json](file:///Users/daiwanxing/Desktop/市场行情/funds/oxlintrc.json) | oxlint 规则 |
| [.oxfmtrc.json](file:///Users/daiwanxing/Desktop/市场行情/funds/.oxfmtrc.json) | oxfmt 格式化配置 |

### 应用入口

| 文件 | 作用 |
|---|---|
| [src/main.ts](file:///Users/daiwanxing/Desktop/市场行情/funds/src/main.ts) | Vue 3 + Element Plus + UnoCSS 入口 |
| [src/App.vue](file:///Users/daiwanxing/Desktop/市场行情/funds/src/App.vue) | 根组件（router-view） |
| [src/router.ts](file:///Users/daiwanxing/Desktop/市场行情/funds/src/router.ts) | Vue Router 4：`/` → Home，`/settings` → Settings |
| [src/env.d.ts](file:///Users/daiwanxing/Desktop/市场行情/funds/src/env.d.ts) | Vue SFC + Vite 全局类型声明 |

### 工具模块（从 background.js 提取）

| 文件 | 作用 | 测试覆盖 |
|---|---|---|
| [src/utils/storage.ts](file:///Users/daiwanxing/Desktop/市场行情/funds/src/utils/storage.ts) | localStorage 封装（模拟 chrome.storage.sync API） | ✅ 7 tests |
| [src/utils/marketStatus.ts](file:///Users/daiwanxing/Desktop/市场行情/funds/src/utils/marketStatus.ts) | 休市判断 + 节假日检查 + 时区处理 | ✅ 9 tests |
| [src/utils/formatters.ts](file:///Users/daiwanxing/Desktop/市场行情/funds/src/utils/formatters.ts) | 数字格式化 + UUID 生成 | ✅ 10 tests |

### 占位页面

| 文件 | 说明 |
|---|---|
| [src/pages/Home.vue](file:///Users/daiwanxing/Desktop/市场行情/funds/src/pages/Home.vue) | 占位首页（待迁移 popup/App.vue 业务代码） |
| [src/pages/Settings.vue](file:///Users/daiwanxing/Desktop/市场行情/funds/src/pages/Settings.vue) | 占位设置页（待迁移 options/App.vue 业务代码） |

## 验证结果

| 验证项 | 结果 |
|---|---|
| `pnpm test:run` | ✅ **26 tests passed**（1.06s） |
| `pnpm dev` | ✅ Vite 8 启动 **513ms** |
| 页面渲染 | ✅ UnoCSS 原子类生效，标题和文字正常显示 |

---

## 待完成（Steps 7-8）

### Step 7：组件迁移（核心工作量）

将原 Chrome 扩展的两个巨型组件迁移到新架构：

| 原文件 | 行数 | 目标文件 | 主要改动 |
|---|---|---|---|
| [src/popup/App.vue](file:///Users/daiwanxing/Desktop/%E5%B8%82%E5%9C%BA%E8%A1%8C%E6%83%85/funds/src/popup/App.vue) | 1825 行 | [src/pages/Home.vue](file:///Users/daiwanxing/Desktop/%E5%B8%82%E5%9C%BA%E8%A1%8C%E6%83%85/funds/src/pages/Home.vue) | ~34 处 chrome.* 替换 + Vue 3 语法 + API 路径代理化 |
| [src/options/App.vue](file:///Users/daiwanxing/Desktop/%E5%B8%82%E5%9C%BA%E8%A1%8C%E6%83%85/funds/src/options/App.vue) | 784 行 | [src/pages/Settings.vue](file:///Users/daiwanxing/Desktop/%E5%B8%82%E5%9C%BA%E8%A1%8C%E6%83%85/funds/src/pages/Settings.vue) | ~12 处 chrome.* 替换 + Vue 3 语法 |
| `src/common/*.vue`（~15 个组件） | — | `src/components/*.vue` | 样式穿透语法 `/deep/` → `:deep()` |

### Step 8：清理

删除不再需要的旧文件：[webpack.config.js](file:///Users/daiwanxing/Desktop/%E5%B8%82%E5%9C%BA%E8%A1%8C%E6%83%85/funds/webpack.config.js)、[.babelrc](file:///Users/daiwanxing/Desktop/%E5%B8%82%E5%9C%BA%E8%A1%8C%E6%83%85/funds/.babelrc)、[src/background.js](file:///Users/daiwanxing/Desktop/%E5%B8%82%E5%9C%BA%E8%A1%8C%E6%83%85/funds/src/background.js)、[src/manifest.json](file:///Users/daiwanxing/Desktop/%E5%B8%82%E5%9C%BA%E8%A1%8C%E6%83%85/funds/src/manifest.json)、`src/popup/`、`src/options/`、`scripts/` 等。
