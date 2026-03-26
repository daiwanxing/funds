# 重构后项目架构设计

## 1. 整体定位

将「自选基金助手」从 Chrome 扩展插件重构为**纯 Web 单页应用（SPA）**，最终部署到 Vercel，支持 PC/H5 双端访问。

仅面向最新 Chrome 浏览器，不考虑历史兼容性包袱。

## 2. 技术选型

| 类别 | 选型 | 说明 |
|---|---|---|
| 框架 | **Vue 3** | 直接迁移到 Vue 3（跳过 Vue 2 + Vite 中间态） |
| 构建工具 | **Vite 8** | 基于 Rolldown（Rust），10-30x 构建加速 |
| 语言 | **TypeScript 5** | 渐进式引入，保证项目可靠性 |
| CSS 方案 | **UnoCSS** | 原子化 CSS 引擎，Tailwind 超集，零运行时 |
| UI 库 | **Element Plus** | Element UI 的 Vue 3 版本 |
| 图表 | **ECharts 5** | 从 v4 升级，API 基本兼容 |
| 路由 | **Vue Router 4** | SPA 路由 |
| HTTP | **Axios** | 保持不变 |
| 单元测试 | **Vitest** | 与 Vite 同生态，复用 vite.config，极速 HMR 测试 |
| Lint | **oxlint** | Rust 实现，支持 Vue/TS，替代 ESLint |
| Format | **oxfmt** | Rust 实现，Prettier 兼容，支持 Vue/CSS/SCSS |
| 部署 | **Vercel** | 静态托管 + Serverless Functions |
| CORS 代理 | **Vercel Serverless Functions** | 转发东方财富 API 请求 |
| 数据存储 | **localStorage** | 替代 chrome.storage.sync |

### 2.1 为什么跳过 Vue 2 + Vite 中间态？

Vite 8（2026-03-12 发布）集成了 Rolldown 替代 esbuild/Rollup，而 `@vitejs/plugin-vue2` 已 EOL（End of Life），与 Vite 8 的 Rolldown 兼容性**无官方保证**。因此，直接从 Vue 2 → Vue 3 + Vite 8 是最稳妥的路径，避免在一个 EOL 的过渡态上浪费精力。

### 2.2 Node.js 版本要求

Vite 8 要求 **Node.js 20.19+ 或 22.12+**。

## 3. 目录结构

```
funds/
├── api/                          # Vercel Serverless Functions
│   └── proxy.ts                  # CORS 反向代理
├── docs/
│   └── migration/                # 迁移文档
│       ├── architecture.md       # 本文档
│       ├── phase-1-vite8-vue3.md # 第一轮：构建工具 + 框架迁移
│       ├── phase-2-vercel.md     # 第二轮：Vercel 部署
│       └── phase-3-h5.md        # 第三轮：H5 适配
├── public/
│   ├── favicon.ico
│   └── holiday.json              # 节假日数据
├── src/
│   ├── main.ts                   # 应用入口
│   ├── App.vue                   # 根组件
│   ├── router.ts                 # 路由配置
│   ├── env.d.ts                  # 类型声明
│   ├── pages/                    # 页面组件
│   │   ├── Home.vue              # 主页面（原 popup/App.vue）
│   │   └── Settings.vue          # 设置页（原 options/App.vue）
│   ├── components/               # 公共组件（原 common/）
│   │   ├── ChangeLog.vue
│   │   ├── Charts.vue
│   │   ├── Charts2.vue
│   │   ├── ConfigBox.vue
│   │   ├── FundDetail.vue
│   │   ├── FundInfo.vue
│   │   ├── IndDetail.vue
│   │   ├── ManagerDetail.vue
│   │   ├── Market.vue
│   │   ├── MarketBar.vue
│   │   ├── MarketLine.vue
│   │   ├── MarketN2S.vue
│   │   ├── MarketS2N.vue
│   │   ├── PositionDetail.vue
│   │   └── Reward.vue
│   ├── utils/                    # 工具函数
│   │   ├── storage.ts            # localStorage 封装
│   │   ├── marketStatus.ts       # 休市判断 + 节假日逻辑
│   │   ├── calculator.ts         # 收益计算
│   │   ├── formatters.ts         # 数字格式化
│   │   └── export.ts             # Excel 导入导出
│   ├── api/                      # API 请求层
│   │   ├── fund.ts               # 基金数据 API
│   │   ├── index.ts              # 指数数据 API
│   │   └── request.ts            # axios 实例 + 请求基础配置
│   ├── __tests__/                # 单元测试
│   │   ├── utils/
│   │   │   ├── storage.test.ts
│   │   │   ├── marketStatus.test.ts
│   │   │   ├── calculator.test.ts
│   │   │   └── formatters.test.ts
│   │   └── setup.ts              # 测试全局 setup
│   └── styles/                   # 样式
│       └── global.css            # 全局样式（少量，UnoCSS 为主）
├── index.html                    # Vite 入口 HTML
├── uno.config.ts                 # UnoCSS 配置
├── vite.config.ts                # Vite 8 配置
├── vitest.config.ts              # Vitest 配置（可选）
├── tsconfig.json                 # TypeScript 配置
├── oxlintrc.json                 # oxlint 配置
├── .oxfmtrc.json                 # oxfmt 配置
├── vercel.json                   # Vercel 部署配置
└── package.json
```

## 4. 架构对比（重构前 vs 重构后）

```
重构前（Chrome 扩展 / Webpack / Vue 2 / JS）
┌─────────────────────────┐
│ background.js           │
│ ├─ 角标更新             │  删除
│ ├─ 休市判断             │──────►  src/utils/marketStatus.ts
│ ├─ 收益计算             │──────►  src/utils/calculator.ts
│ └─ 消息监听             │  删除
├─────────────────────────┤
│ popup/App.vue           │──────►  src/pages/Home.vue
│ (1825行，巨型组件)      │         + 拆分到 components/
├─────────────────────────┤
│ options/App.vue         │──────►  src/pages/Settings.vue
├─────────────────────────┤
│ chrome.storage.sync     │──────►  localStorage
│ chrome.runtime.message  │  删除   (直接函数调用)
│ chrome.browserAction    │  删除   (页面内 UI 替代)
├─────────────────────────┤
│ 直接请求 eastmoney API  │──────►  Vercel Serverless Proxy
│ (扩展无 CORS 限制)      │         /api/proxy → eastmoney
└─────────────────────────┘

重构后（Web SPA / Vite 8 / Vue 3 / TypeScript）
```

## 5. API 代理策略

所有东方财富 API 请求统一走 `/api/proxy` 前缀：

| 前端请求路径 | 代理目标 |
|---|---|
| `/api/fund/info?codes=...` | `fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?...` |
| `/api/fund/search?key=...` | `fundsuggest.eastmoney.com/FundSearch/api/...` |
| `/api/index/quote?secids=...` | `push2.eastmoney.com/api/qt/ulist.np/get?...` |
| `/api/index/kline?...` | `push2his.eastmoney.com/api/qt/stock/kline/get?...` |
| `/api/market/*` | 行情中心相关接口 |

## 6. 需要丢弃的功能

| Chrome 扩展特有功能 | 处理方式 |
|---|---|
| 浏览器图标角标 | 丢弃，可在 `document.title` 或顶部栏展示 |
| 右键菜单"独立窗口模式" | 丢弃，Web 本身就是独立页面 |
| 后台定时任务 | 改为页面内 `setInterval` |
| chrome.storage.sync 跨设备同步 | 丢失，后续可通过账号系统弥补 |

## 7. 迁移阶段总览（修订版）

| 阶段 | 目标 | 验收标准 |
|---|---|---|
| **Phase 1** | Webpack→Vite 8 + Vue 2→Vue 3 + Chrome API→Web API + TS + UnoCSS + oxlint/oxfmt + Vitest | 功能正常，零 `chrome.*` 引用，lint/fmt/test 通过 |
| **Phase 2** | Vercel 部署 + CORS 代理 | 公网可访问，数据正常加载 |
| **Phase 3** | H5 响应式适配 | 移动端布局合理，交互友好 |

> Phase 1 较重，但逻辑上是一体的：既然 Vue 2 在 Vite 8 下无稳定支持，不如一步到位。
