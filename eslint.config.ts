import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
  // ── 忽略目录 ──────────────────────────────────────────────────────────────
  {
    ignores: [
      'dist/**',
      'lib/**',
      'docs/**',
      'node_modules/**',
      'src/icons/**',
      '**/*.d.ts',
      'vite.config.ts',
      'uno.config.ts',
      'vitest.config.ts',
    ],
  },

  // ── JS 基础推荐规则 ────────────────────────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript 推荐规则 ────────────────────────────────────────────────────
  ...ts.configs.recommended,

  // ── Vue SFC 专项规则 ───────────────────────────────────────────────────────
  // flat/strongly-recommended = essential（防错）+ 可读性规则
  ...pluginVue.configs['flat/strongly-recommended'],

  // ── 主配置块（针对 .ts 和 .vue 文件）─────────────────────────────────────
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        // vue-eslint-parser 作为顶层 parser（由 pluginVue 自动注入）
        // typescript-eslint parser 作为 <script> block 的子 parser
        parser: ts.parser,
      },
    },
    rules: {
      // ── Unused vars ────────────────────────────────────────────────────────
      // 基础规则关闭，TS 版本负责检测（vue-eslint-parser 将 <template> 引用
      // 暴露给 script scope，能正确识别 <script setup> 中真正被模板使用的 import）
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
      }],
      // 检测 v-for / v-slot 中定义但未用到的局部变量
      'vue/no-unused-vars': 'error',

      // ── 代码正确性 ─────────────────────────────────────────────────────────
      'eqeqeq': ['error', 'always'],   // 必须使用 === / !==
      'no-console': ['error', { allow: ['warn', 'error'] }], // 只允许 console.warn 和 console.error

      // ── 代码风格（原 oxlint func-style）──────────────────────────────────
      // 强制使用箭头函数表达式而非 function 声明
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],

      // ── Vue 组件质量 ───────────────────────────────────────────────────────
      'vue/component-api-style': ['error', ['script-setup']], // 强制 <script setup>
      'vue/define-macros-order': [
        'error',
        { order: ['defineProps', 'defineEmits', 'defineModel'] },
      ],
      'vue/no-unused-refs': 'error',    // 检测未使用的 template ref
      'vue/no-undef-components': ['warn', {
        // vue-router 通过 app.use(router) 全局注册 RouterView / RouterLink
        // eslint-plugin-vue 无法感知运行时全局注册，手动声明白名单
        ignorePatterns: ['RouterView', 'RouterLink', 'router-view', 'router-link'],
      }],


      // ── TypeScript ─────────────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // ── 测试文件专有配置 ───────────────────────────────────────────────────────
  {
    files: ['**/*.test.ts', '**/*.spec.ts', 'src/__tests__/**'],
    rules: {
      'vue/one-component-per-file': 'off', // 允许在测试文件中定义多个模拟组件
    },
  },
);
