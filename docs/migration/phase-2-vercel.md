# Phase 2：Vercel 部署 + CORS 代理

> **前置条件**：Phase 1 已完成并通过验收，项目在 Vite 8 + Vue 3 + TypeScript 下运行正常。
>
> **目标**：将项目部署到 Vercel，通过 Serverless Functions 解决生产环境 CORS 问题。

---

## Step 1：创建 Vercel Serverless Function

### `api/proxy.ts`

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

const ALLOWED_TARGETS: Record<string, string> = {
  fund: 'https://fundmobapi.eastmoney.com',
  search: 'https://fundsuggest.eastmoney.com',
  index: 'https://push2.eastmoney.com',
  kline: 'https://push2his.eastmoney.com',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const target = req.query.target as string
  const path = req.query.path as string

  if (!target || !ALLOWED_TARGETS[target]) {
    return res.status(400).json({ error: 'Invalid target' })
  }

  // 构建目标 URL，传递原始查询参数
  const url = new URL(path || '/', ALLOWED_TARGETS[target])
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'target' && key !== 'path') {
      url.searchParams.set(key, value as string)
    }
  })

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.eastmoney.com/',
      },
    })

    const data = await response.text()

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'application/json')
    res.status(200).send(data)
  } catch (error) {
    res.status(500).json({ error: 'Proxy request failed' })
  }
}
```

> 也可以为每个 API 创建独立 Function（`api/fund.ts`、`api/search.ts` 等），视复杂度而定。

---

## Step 2：统一前端 API 层

### `src/api/request.ts`

```ts
import axios from 'axios'

const isDev = import.meta.env.DEV

const instance = axios.create({ timeout: 10000 })

/**
 * 统一请求函数
 * 开发环境：走 Vite proxy（/api/fund/...）
 * 生产环境：走 Vercel Serverless Function（/api/proxy?target=fund&path=...）
 */
export function proxyRequest(
  target: 'fund' | 'search' | 'index' | 'kline',
  path: string,
  params: Record<string, any> = {},
) {
  if (isDev) {
    return instance.get(`/api/${target}${path}`, { params })
  }
  return instance.get('/api/proxy', {
    params: { target, path, ...params },
  })
}

export default instance
```

### 更新组件中的 API 调用

```diff
- this.$axios.get("/api/fund/FundMNewApi/FundMNFInfo?pageIndex=1&...")
+ import { proxyRequest } from '@/api/request'
+ proxyRequest('fund', '/FundMNewApi/FundMNFInfo', { pageIndex: 1, ... })
```

---

## Step 3：Vercel 配置

### `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=60, stale-while-revalidate=300" }
      ]
    }
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

## Step 4：部署

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
- [ ] Serverless Function 返回数据正常（`/api/proxy?target=fund&path=...`）
- [ ] 前端页面通过 Serverless Function 获取数据正常

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

1. **Vercel 免费额度**：100GB 带宽 / 月 + 100 小时函数执行时间，个人使用足够
2. **东方财富反爬**：代理需携带 `User-Agent` + `Referer`
3. **冷启动延迟**：Serverless 首次调用约 1-2 秒，可用 Edge Functions 优化
4. **holiday.json**：放 `public/`，Vercel 直接托管静态文件
