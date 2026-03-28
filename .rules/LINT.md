# LINT

ESLint 配置说明与使用规范。

## 配置文件

`eslint.config.ts`（ESLint v10 Flat Config）

## 启用的规则

| 规则 | 级别 | 说明 |
|---|---|---|
| `eqeqeq` | error | 必须使用 `===` / `!==` |
| `func-style` | error | 使用箭头函数表达式，禁止 function 声明 |
| `vue/component-api-style` | error | 强制使用 `<script setup>` |
| `vue/multi-word-component-names` | error | 组件文件名必须多单词 |
| `vue/define-macros-order` | error | defineProps → defineEmits → defineModel |
| `vue/no-unused-refs` | error | 不允许未使用的 template ref |
| `@typescript-eslint/no-unused-vars` | error | 禁止未使用的变量 |
| `@typescript-eslint/no-explicit-any` | warning | 避免使用 `any` |
| `no-console` | warning | 不遗留 console 调用 |

## 禁止使用魔法注释绕过 lint

应修正代码本身，而非用注释禁用规则：

```html
<!-- ❌ 禁止 -->
<!-- eslint-disable vue/multi-word-component-names -->
```

```ts
// ❌ 禁止
// eslint-disable-next-line @typescript-eslint/no-explicit-any
```

## 全局组件白名单

`vue-router` 通过 `app.use(router)` 全局注册，已在规则中声明白名单：

```ts
'vue/no-undef-components': ['warn', {
  ignorePatterns: ['RouterView', 'RouterLink', 'router-view', 'router-link'],
}]
```
