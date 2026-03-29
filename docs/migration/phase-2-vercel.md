# Phase 2：Vercel 部署 + CORS 代理

> **前置条件**：Phase 1 已完成并通过验收，项目在 Vite 8 + Vue 3 + TypeScript 下运行正常。
>
> **目标**：将项目部署到 Vercel，通过平台级 External Rewrites 解决生产环境 CORS 问题。

---

## Step 1：使用 Vercel External Rewrites

前端继续请求统一的同源路径：

- `/api/fund/*`
- `/api/search/*`
- `/api/index/*`
- `/api/kline/*`

Vercel 在平台层把它们分别转发到东方财富对应域名，避免在 `api/` 目录里维护额外的中转函数。

---

## Step 2：Vercel 配置

### `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/fund/(.*)", "destination": "https://fundmobapi.eastmoney.com/$1" },
    { "source": "/api/search/(.*)", "destination": "https://fundsuggest.eastmoney.com/$1" },
    { "source": "/api/index/(.*)", "destination": "https://push2.eastmoney.com/$1" },
    { "source": "/api/kline/(.*)", "destination": "https://push2his.eastmoney.com/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 路由模式升级（可选）

```diff
  // src/router.ts
- import { createRouter, createWebHashHistory } from 'vue-router'
+ import { createRouter, createWebHistory } from 'vue-router'

  export default createRouter({
-   history: createWebHashHistory(),
+   history: createWebHistory(),
    routes,
  })
```

Vercel `rewrites` 保证 History 模式刷新不 404。

---

## Step 3：部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 预览部署
vercel

# 生产部署
vercel --prod
```

也可在 Vercel 控制台关联 GitHub 仓库，实现 push 自动部署。

---

## 验收标准

### 本地验证

- [ ] `vercel dev` 本地启动正常
- [ ] `/api/fund/*`、`/api/search/*`、`/api/index/*`、`/api/kline/*` rewrite 返回数据正常
- [ ] 前端页面通过 rewrite 获取数据正常

### 部署验证

- [ ] `vercel --prod` 部署成功
- [ ] 公网访问首页，基金列表正常加载
- [ ] 指数行情正常
- [ ] 基金搜索正常
- [ ] 基金详情图表正常
- [ ] 行情中心正常
- [ ] 路由刷新不 404
- [ ] 设置页功能正常

### 性能验证

- [ ] API 响应时间 < 3 秒
- [ ] 首屏加载合理

---

## 风险与注意事项

1. **Vercel 免费额度**：100GB 带宽 / 月，个人使用通常足够
2. **东方财富反爬**：若平台级 rewrite 后续受限，再回退到更细粒度的服务端代理方案
3. **holiday.json**：放 `public/`，Vercel 直接托管静态文件
