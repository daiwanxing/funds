# COMPONENT_ARCHITECTURE

组件放置与目录架构规范。

## 目录结构

项目采用模块内聚化（Module Cohesion）的设计思想，严格区分基础组件、业务组件与页面组件。

### 1. 基础 UI 组件 → `src/components/`

纯展示和交互层物料，**绝对不可**包含业务网络请求或直接操作业务状态（例如 Pinia）。它们应该是“无脑”的原子组件。

### 2. 全局布局容器 → `src/layouts/`

提供全局或跨多个模块的公共页面骨架（如 `AuthLayout`）。

### 3. 业务模块与页面 → `src/pages/<Module>/`

涉及业务逻辑、特定领域 API 获取或状态管理的组件与页面，全部依据业务模块内聚放置。

- **页面（Pages）**：页面文件应放置在 `src/pages/<Module>/<PageName>/` 下，每个页面自带自己的文件夹并由 `index.ts` 暴露。
  若模块过于简单（如单页面模块），也可直接放于 `src/pages/<Module>/HomePage.vue`（但强烈推荐配以 `index.ts` 导出）。
- **业务组件（Business Components）**：属于该模块专属的领域业务组件，须放置在 `src/pages/<Module>/components/` 目录下。

```text
src/
├── components/
│   └── ui/               ← 纯展示组件 (如 Button, Input)
├── layouts/              ← 布局模块 (如 AuthLayout.vue)
└── pages/
    ├── Authentication/   ← 身份校验模块
    │   ├── SignIn/
    │   │   ├── SignInPage.vue
    │   │   └── index.ts
    │   └── components/   ← 仅供鉴权流程使用的业务组件
    │       └── Globe/
    └── Dashboard/        ← 首页/控制台模块
        ├── HomePage.vue
        ├── index.ts
        └── components/   ← 仅供控制台使用的业务组件
            ├── GlobalTicker/
            ├── StatusBar/
            └── FundTable/
```

## 路径别名

`@` → `./src`，所有跨全模块层级的引用使用 `@/` 前缀，禁止使用相对路径 `../../`。
但如果是在**同一模块**内容器与该模块子组件之间应用，建议优先使用相对路径(`./components/...`)以增强内聚性。
