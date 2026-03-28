# COMPONENT_ARCHITECTURE

组件放置规范。

## 两类组件

### 全局 UI 组件 → `src/components/<Name>/`

纯展示和交互层物料，**不可**包含业务网络请求或直接操作业务状态。

```
src/components/
├── GlobalTicker/
├── StatusBar/
├── FundTable/
└── ActionBar/
```

### 业务组件 → `src/pages/<Page>/components/`

涉及 API 请求、Pinia 状态读写的业务逻辑，就近放在对应页面目录下。

```
src/pages/
└── Home/
    └── components/
        ├── FundSavedList.vue
        ├── FundSearchList.vue
        └── ZoneBHeader.vue
```

## 路径别名

`@` → `./src`，所有跨目录引用使用 `@/` 前缀，禁止使用相对路径 `../../`。
