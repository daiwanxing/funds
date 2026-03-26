# Phase 1：Vite 8 + Vue 3 + TypeScript + UnoCSS + Vitest + 去除 Chrome API

> **目标**：一步到位完成构建工具和框架迁移。从 Webpack + Vue 2 + JS + SCSS 迁移到 Vite 8 + Vue 3 + TypeScript + UnoCSS，并去除所有 Chrome 扩展依赖，引入 oxlint / oxfmt / Vitest 工具链。

## 为什么合并为一个阶段？

Vite 8（2026-03-12 发布）集成了 Rolldown 替代 esbuild/Rollup，而 Vue 2 的 Vite 插件 `@vitejs/plugin-vue2` 已 **End of Life**，与 Vite 8 兼容性**无官方保证**。因此不设 "Vue 2 + Vite" 的中间态，直接一步到位。

## 前置条件

- **Node.js 20.19+ 或 22.12+**（Vite 8 要求）
- 原项目代码已备份或已提交 Git

---

## Step 1：初始化新项目结构

### 1.1 创建 `index.html`（Vite 入口）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>自选基金助手</title>
  <link rel="icon" href="/favicon.ico">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### 1.2 创建 `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api/fund': {
        target: 'https://fundmobapi.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fund/, '')
      },
      '/api/search': {
        target: 'https://fundsuggest.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/search/, '')
      },
      '/api/index': {
        target: 'https://push2.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/index/, '')
      },
      '/api/kline': {
        target: 'https://push2his.eastmoney.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kline/, '')
      }
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
})
```

### 1.3 创建 `uno.config.ts`

```ts
import {
  defineConfig,
  presetWind3,
  presetIcons,
  transformerVariantGroup,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),   // Tailwind CSS v3 兼容预设
    presetIcons({    // 纯 CSS 图标
      scale: 1.2,
      cdn: 'https://esm.sh/',
    }),
  ],
  transformers: [
    transformerVariantGroup(),  // hover:(text-red bg-blue) 分组语法
    transformerDirectives(),    // @apply 指令支持
  ],
  shortcuts: {
    'text-up': 'text-[#F56C6C]',        // 涨
    'text-down': 'text-[#4eb61b]',      // 跌
    'btn': 'inline-block cursor-pointer px-2 py-1.5 rounded border border-gray-300 text-sm',
    'btn-primary': 'btn border-blue-400 text-blue-400',
  },
  theme: {
    // 自定义主题 token，可以按需扩展
  },
})
```

### 1.4 创建 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue", "src/**/*.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.4 创建 `src/env.d.ts`（类型声明）

```ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare const __APP_VERSION__: string
```

---

## Step 2：依赖更换

### 2.1 新增依赖

```bash
# 核心
npm install vue@3 vue-router@4 element-plus echarts@5 axios file-saver xlsx

# 开发依赖
npm install -D vite@8 @vitejs/plugin-vue typescript unocss oxlint oxfmt vitest @vue/test-utils jsdom

# 类型定义
npm install -D @types/file-saver
```

### 2.2 移除旧依赖

```bash
npm uninstall vue vue-router element-ui echarts vue-clipboard2 qrcodejs2 \
  webpack webpack-cli webpack-extension-reloader copy-webpack-plugin \
  mini-css-extract-plugin babel-loader @babel/core @babel/preset-env \
  node-sass sass-loader \
  @babel/runtime-corejs3 @babel/plugin-proposal-optional-chaining \
  css-loader sass-loader node-sass vue-loader vue-template-compiler \
  file-loader script-loader cross-env ejs archiver core-js \
  babel-plugin-component @types/chrome
```

### 2.3 更新 `package.json` scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "fmt": "oxfmt",
    "fmt:check": "oxfmt --check"
  }
}
```

---

## Step 3：配置 oxlint + oxfmt

### 3.1 `oxlintrc.json`

```json
{
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn",
    "eqeqeq": "error"
  }
}
```

### 3.2 `.oxfmtrc.json`

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all"
}
```

---

## Step 4：Vitest 配置与测试

### 4.1 `vitest.config.ts`（可选，也可直接在 vite.config.ts 中配置）

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.ts'],
  },
}))
```

### 4.2 `src/__tests__/setup.ts`

```ts
// localStorage mock（jsdom 已内置，但可在此添加全局 setup）
import { vi } from 'vitest'

// 重置 localStorage
beforeEach(() => {
  localStorage.clear()
})
```

### 4.3 为核心工具模块编写单测

优先覆盖从 `background.js` 提取的纯逻辑函数，这些是最容易写也最有价值的单测：

#### `src/__tests__/utils/formatters.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { formatNum } from '@/utils/formatters'

describe('formatNum', () => {
  it('formats small numbers with 2 decimals', () => {
    expect(formatNum(1.234)).toBe('1.23')
    expect(formatNum(-5.678)).toBe('-5.68')
  })

  it('formats thousands with k suffix', () => {
    expect(formatNum(1500)).toBe('1.5k')
    expect(formatNum(50000)).toBe('50k')
  })

  it('formats millions with M suffix', () => {
    expect(formatNum(1500000)).toBe('1.5M')
    expect(formatNum(50000000)).toBe('50M')
  })
})
```

#### `src/__tests__/utils/storage.test.ts`

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { storage } from '@/utils/storage'

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('stores and retrieves data', () => {
    storage.set({ darkMode: true })
    storage.get(['darkMode'], (res) => {
      expect(res.darkMode).toBe(true)
    })
  })

  it('returns empty for missing keys', () => {
    storage.get(['nonexistent'], (res) => {
      expect(res).toEqual({})
    })
  })

  it('returns all data when keys is null', () => {
    storage.set({ a: 1, b: 2 })
    storage.get(null, (res) => {
      expect(res).toEqual({ a: 1, b: 2 })
    })
  })
})
```

#### `src/__tests__/utils/marketStatus.test.ts`

```ts
import { describe, it, expect, vi } from 'vitest'
import { checkHoliday, isDuringDate, setHolidayData } from '@/utils/marketStatus'

describe('marketStatus', () => {
  it('identifies holidays correctly', () => {
    setHolidayData({
      data: { '2026': { '01-01': { holiday: true } } }
    })
    expect(checkHoliday(new Date('2026-01-01'))).toBe(true)
    expect(checkHoliday(new Date('2026-01-02'))).toBe(false)
  })

  it('returns false on weekends', () => {
    setHolidayData({ data: {} })
    // Mock a Saturday
    vi.setSystemTime(new Date('2026-03-28 10:00:00'))
    expect(isDuringDate()).toBe(false)
    vi.useRealTimers()
  })
})
```

### 4.4 单测覆盖优先级

| 优先级 | 模块 | 理由 |
|---|---|---|
| 🔴 高 | `utils/storage.ts` | 数据持久化核心，替代了 Chrome API |
| 🔴 高 | `utils/marketStatus.ts` | 休市判断涉及时区、节假日，逻辑复杂 |
| 🔴 高 | `utils/formatters.ts` | 纯函数，最易测试 |
| 🟡 中 | `utils/calculator.ts` | 收益计算逻辑 |
| 🟢 低 | 组件测试 | 后续阶段按需补充 |

---

## Step 5：入口文件与路由

### 4.1 `src/main.ts`

```ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:uno.css'
import './styles/global.css'

const app = createApp(App)
app.use(router)
app.use(ElementPlus, { size: 'small' })
app.mount('#app')
```

### 4.2 `src/App.vue`

```vue
<template>
  <router-view />
</template>
```

### 4.3 `src/router.ts`

```ts
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./pages/Home.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('./pages/Settings.vue'),
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
```

---

## Step 5：创建工具模块

### 5.1 `src/utils/storage.ts` — localStorage 封装

```ts
const STORAGE_KEY = 'funds_config'

function getAll(): Record<string, any> {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export const storage = {
  get(keys: string | string[] | null, callback: (res: Record<string, any>) => void): void {
    const all = getAll()
    if (keys === null) {
      callback(all)
      return
    }
    if (typeof keys === 'string') keys = [keys]
    const result: Record<string, any> = {}
    keys.forEach((key) => {
      if (key in all) result[key] = all[key]
    })
    callback(result)
  },

  set(data: Record<string, any>, callback?: () => void): void {
    const all = getAll()
    Object.assign(all, data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    callback?.()
  },
}
```

### 5.2 `src/utils/marketStatus.ts` — 休市判断

```ts
import axios from 'axios'

interface HolidayData {
  version?: string
  lastDate?: string
  data?: Record<string, Record<string, { holiday: boolean }>>
}

let holidayData: HolidayData | null = null

export async function loadHoliday(): Promise<HolidayData> {
  if (holidayData) return holidayData
  try {
    const res = await axios.get<HolidayData>('/holiday.json')
    holidayData = res.data
    return holidayData
  } catch {
    holidayData = {}
    return holidayData
  }
}

export function setHolidayData(data: HolidayData): void {
  holidayData = data
}

export function checkHoliday(date: Date): boolean {
  if (!holidayData?.data) return false
  const year = date.getFullYear().toString()
  let month = (date.getMonth() + 1).toString()
  let day = date.getDate().toString()
  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day
  const dateStr = `${month}-${day}`
  const yearData = holidayData.data[year]
  if (!yearData) return false
  return yearData[dateStr]?.holiday ?? false
}

export function isDuringDate(): boolean {
  const zoneOffset = 8
  const offset8 = new Date().getTimezoneOffset() * 60 * 1000
  const nowDate8 = new Date().getTime()
  const curDate = new Date(nowDate8 + offset8 + zoneOffset * 60 * 60 * 1000)

  if (checkHoliday(curDate)) return false
  const day = curDate.getDay()
  if (day === 0 || day === 6) return false

  const h = curDate.getHours()
  const m = curDate.getMinutes()
  const time = h * 60 + m
  // 9:30-11:35 或 13:00-15:05
  return (time >= 570 && time <= 695) || (time >= 780 && time <= 905)
}
```

### 5.3 `src/utils/formatters.ts`

```ts
export function formatNum(val: number): string {
  const absNum = Math.abs(val)
  if (absNum < 10) return val.toFixed(2)
  if (absNum < 100) return val.toFixed(1)
  if (absNum < 1000) return val.toFixed(0)
  if (absNum < 10000) return (val / 1000).toFixed(1) + 'k'
  if (absNum < 1000000) return (val / 1000).toFixed(0) + 'k'
  if (absNum < 10000000) return (val / 1000000).toFixed(1) + 'M'
  return (val / 1000000).toFixed(0) + 'M'
}
```

---

## Step 6：Vue 2 → Vue 3 + Element Plus 迁移

### 6.1 文件移动

| 原路径 | 新路径 |
|---|---|
| `src/popup/App.vue` | `src/pages/Home.vue` |
| `src/options/App.vue` | `src/pages/Settings.vue` |
| `src/common/*.vue` | `src/components/*.vue` |
| `src/common/changeLog.json` | `src/data/changeLog.json` |
| `src/common/js/vendor/Export2Excel.js` | `src/utils/export.ts` |
| `src/common/js/vendor/Blob.js` | `src/utils/blob.ts` |
| `holiday.json` | `public/holiday.json` |

### 6.2 Chrome API 替换（~48 处）

所有文件中：

```diff
+ import { storage } from '@/utils/storage'
+ import { isDuringDate } from '@/utils/marketStatus'

- chrome.storage.sync.get([...], (res) => { ... })
+ storage.get([...], (res) => { ... })

- chrome.storage.sync.set({ ... }, () => { ... })
+ storage.set({ ... }, () => { ... })

- chrome.runtime.sendMessage({ type: "DuringDate" }, (response) => {
-   this.isDuringDate = response.farewell
- })
+ this.isDuringDate = isDuringDate()

- chrome.tabs.create({ url: "/options/options.html" })
+ this.$router.push('/settings')

  // 删除所有 chrome.runtime.sendMessage（refresh/endInterval/startInterval/refreshBadge 等）
```

### 6.3 Vue 3 语法适配

```diff
  // 入口
- new Vue({ render: h => h(App) }).$mount('#app')
+ createApp(App).use(router).use(ElementPlus).mount('#app')

  // 全局属性
- Vue.prototype.$axios = axios
+ app.config.globalProperties.$axios = axios
  // 或在组件中直接 import axios

  // 样式穿透（Settings.vue 中约 15 处）
- /deep/ .el-switch__label { ... }
+ :deep(.el-switch__label) { ... }

  // Element Plus
- this.$message({ message: '...', type: 'success' })
+ import { ElMessage } from 'element-plus'
+ ElMessage.success('...')

  // 剪贴板
- this.$copyText(text)
+ navigator.clipboard.writeText(text)

  // ECharts
- import echarts from 'echarts'
+ import * as echarts from 'echarts'

  // package.json version
- const { version } = require('../../package.json')
+ const version = __APP_VERSION__
```

### 6.4 API 请求路径调整

所有直接请求东方财富 API 的地方，改为代理前缀：

```diff
- "https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?..."
+ "/api/fund/FundMNewApi/FundMNFInfo?..."

- "https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?..."
+ "/api/search/FundSearch/api/FundSearchAPI.ashx?..."

- "https://push2.eastmoney.com/api/qt/ulist.np/get?..."
+ "/api/index/api/qt/ulist.np/get?..."
```

### 6.5 TypeScript 渐进式引入策略

本阶段以**能跑通为主**，采用渐进式 TS：

1. **工具模块**（`utils/`, `api/`）→ 完整 TypeScript + 类型定义
2. **Vue 组件**（`pages/`, `components/`）→ `<script lang="ts">` + Options API，复杂类型可先用 `any`
3. 后续阶段可进一步收紧 `strict` 模式和消除 `any`

---

## Step 7：清理旧文件

### 删除

- `webpack.config.js`
- `.babelrc`
- `scripts/build-zip.js`
- `src/manifest.json`
- `src/background.js`
- `src/popup/popup.js`、`src/popup/popup.html`
- `src/options/options.js`、`src/options/options.html`
- `src/icons/`
- `src/common/js/customed.js`、`src/common/js/dark.js` → 迁移到 `src/styles/`
- `edge.html`
- `google1d337c9745584f1d.html`

### 更新 `.gitignore`

```
node_modules
dist
.vite
```

---

## 验收标准

### 构建验证

- [ ] `npm run dev` 启动无报错，Vite 8 开发服务器正常
- [ ] `npm run build` 构建成功（含 `vue-tsc --noEmit` 类型检查）
- [ ] `npm run preview` 预览正常
- [ ] `npm run test:run` 通过（Vitest 全部通过）
- [ ] `npm run lint` 通过（oxlint 无 error）
- [ ] `npm run fmt:check` 通过（oxfmt 格式一致）

### 功能验证

- [ ] 首页基金列表数据正常显示
- [ ] 顶部指数栏正常
- [ ] 编辑模式：添加/删除/拖拽排序正常
- [ ] 基金详情图表正常（ECharts 5）
- [ ] 行情中心正常
- [ ] 设置页路由跳转正常，开关/选项正常
- [ ] 暗色模式切换正常
- [ ] JSON/Excel 导入导出正常
- [ ] 刷新页面配置不丢失（localStorage）

### 代码验证

- [ ] `grep -r "chrome\." src/` → **0 结果**
- [ ] `grep -r "element-ui" src/ package.json` → **0 结果**
- [ ] `grep -r "webpack" src/ package.json` → **0 结果**
- [ ] `grep -r "/deep/" src/` → **0 结果**
- [ ] 控制台无 Vue 警告

---

## 风险与注意事项

1. **工作量集中**：本阶段同时迁移构建工具 + 框架 + 语言，建议按 Step 顺序逐步推进，每完成一个 Step 验证一次
2. **Element Plus 样式差异**：默认样式与 Element UI 有细微差异（圆角、间距），暗色主题需调整
3. **XLSX 库兼容性**：`xlsx` 包可能需要 Vite 配置 `optimizeDeps` 才能正常工作
4. **TypeScript 严格度**：初期允许 `any`，不阻塞迁移进度
5. **`this.$set` / `this.$delete`**：Vue 3 已移除，需检查是否有使用（Vue 3 Proxy 响应式不需要）
