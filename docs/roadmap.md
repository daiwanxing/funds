# FundStation — 开发阶段规划

> 版本：v1.0
> 更新：2026-03-27
> 设计参考：[dashboard-layout.md](./design/dashboard-layout.md) · [dashboard-colors.md](./design/dashboard-colors.md)

---

## Phase 1 — 设计系统 & 骨架

**目标**：打好视觉地基，所有后续组件在同一套 token 体系下开发。

- [ ] `uno.config.ts` — 注入完整 token（bg / text / rise / fall / accent）
- [ ] `src/styles/tokens.css` — CSS Variables 完整定义（供 ECharts 等非 UnoCSS 场景使用）
- [ ] `index.html` / `App.vue` — 全局字体加载（Inter + JetBrains Mono，Google Fonts CDN），根背景 `bg-0`
- [ ] 按 v4 布局重构 `Home.vue`：Zone A / B / C / E 骨架 + FAB 占位

---

## Phase 2 — Zone A + Zone B（核心数据展示）

**目标**：主界面有真实数据 + 完整视觉。

- [ ] **Zone A**：走马灯组件，接入全球指数 API，无限滚动动画
- [ ] **Zone B**：重构基金表格（新 token 配色，全列展示，空状态引导 UI，默认选中第一行）
- [ ] **Zone E**：状态栏组件（市场状态 + 刷新时间 + 基金总数 + 设置入口）

---

## Phase 3 — Zone C（基金详情 Tab）

**目标**：点击基金行，右侧面板联动展示。

- [ ] **Tab 1 实时走势** — ECharts 日内分时图 + 基金概况
- [ ] **Tab 2 历史净值** — 时间周期切换（1月/3月/6月/1年/全部）+ 走势图 + 净值表格
- [ ] **Tab 3 新闻·题材** — 重仓股穿透（Vercel 代理）+ 题材热度指数 + 东方财富新闻流

---

## Phase 4 — Zone D（AI 决策）

**目标**：FAB 唤出 AI 抽屉，接入 LLM。

- [ ] FAB 按钮组件（`position: fixed`，有自选时显示，无自选时隐藏）
- [ ] Drawer 抽屉组件（右侧滑出，半透明遮罩，0.3s 动画）
- [ ] **Vercel Serverless Function** — AI 分析接口（DeepSeek / OpenAI 中转）
- [ ] AI 建议卡片列表（🟢/🟡/🔴/⚪ 标签 + 一句逻辑解释 + 底部免责声明）

---

## Phase 5 — 部署 & API 代理

**目标**：上线可用。

- [ ] Vercel 部署配置（`vercel.json`）
- [ ] Serverless 代理东方财富基金数据 API（解决 CORS）
- [ ] Serverless 代理重仓股穿透 API
- [ ] Serverless 代理 AI LLM API
- [ ] 生产环境端到端验证

---

## Phase 6 — H5 响应式

**目标**：手机 / 平板可用。

- [ ] 断点降级（≥1280px 完整双列 → 768px 单列 → <768px Tab 切换）
- [ ] Zone C 降级为底部抽屉（Drawer）
- [ ] Zone A 走马灯简化
- [ ] 触摸交互优化

---

## 技术栈说明

| 层 | 技术 |
|---|---|
| 构建 | Vite 8 |
| 框架 | Vue 3 + `<script setup>` + TypeScript 5 |
| 样式 | UnoCSS（presetWind3）+ CSS Variables Token 体系 |
| 图表 | ECharts 5（按需导入） |
| 部署 | Vercel（静态 + Serverless Functions） |
| AI | DeepSeek / OpenAI via Vercel Serverless |
| 新闻/持仓 | 东方财富 API via Vercel Serverless 代理 |
| 代码质量 | oxlint + oxfmt + vue-tsc + Vitest |
