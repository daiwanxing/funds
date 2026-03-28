# COMPONENT_NAMING

Vue 组件命名规范。

## 多单词命名

**所有 Vue 组件文件名必须是多单词（multi-word）**，满足 `vue/multi-word-component-names` 规则。

| ✅ 正确 | ❌ 错误 |
|---|---|
| `HomePage.vue` | `Home.vue` |
| `SettingsPage.vue` | `Settings.vue` |
| `FundSavedList.vue` | `Fund.vue` |
| `ZoneBHeader.vue` | `Header.vue` |
| `RewardPanel.vue` | `Reward.vue` |

## 页面文件命名

`src/pages/` 下的页面组件统一使用 `Page` 后缀：

```
src/pages/
├── HomePage.vue
└── SettingsPage.vue   ← 若有设置页时
```

## 禁止绕过规则

**禁止**使用 `eslint-disable` 魔法注释跳过命名规则，应修正文件名本身：

```html
<!-- ❌ 禁止这样做 -->
<!-- eslint-disable vue/multi-word-component-names -->
```
