# COMPONENT_NAMING

Vue 组件及页面命名规范。

## 多单词命名

**所有 Vue 组件文件名必须是多单词（multi-word）**，满足 `vue/multi-word-component-names` 规则。

| ✅ 正确 | ❌ 错误 |
|---|---|
| `HomePage.vue` | `Home.vue` |
| `SettingsPage.vue` | `Settings.vue` |
| `FundSavedList.vue` | `Fund.vue` |
| `ZoneBHeader.vue` | `Header.vue` |

## 页面组件与导出规范

`src/pages/` 下的页面组件统一使用 `Page` 后缀，并且**必须**配以 `index.ts` 进行规范化导出。这保证了路由引用的一致性，同时也满足组件文件夹独立封装。

### 单页面模块
若模块本身只有一个主要页面，可直接暴露在模块根目录。
```text
src/pages/Dashboard/
├── HomePage.vue
└── index.ts        ← export { default as HomePage } from "./HomePage.vue"
```

### 多页面模块
若模块结构复杂包含多级页面，应为每个子页面单独建构文件夹。
```text
src/pages/Authentication/
├── SignIn/
│   ├── SignInPage.vue
│   └── index.ts
└── Callback/
    ├── CallbackPage.vue
    └── index.ts
```

## 禁止绕过规则

**禁止**使用 `eslint-disable` 魔法注释跳过命名规则，应永远优先修正文件名本身：

```html
<!-- ❌ 禁止这样做 -->
<!-- eslint-disable vue/multi-word-component-names -->
```
