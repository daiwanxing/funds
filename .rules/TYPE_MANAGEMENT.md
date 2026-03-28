# TYPE_MANAGEMENT

类型定义管理规范。

## 核心原则

**类型跟着它所描述的「数据领域」走，不跟着「谁消费了它」走。**

## 目录结构

所有业务类型统一放在 `src/types/` 下，按领域单独建文件：

```
src/types/
├── fund.ts       ← FundListItem、FundItem、SearchFundItem
├── market.ts     ← GlobalIndexItem、IndexItem
├── settings.ts   ← SettingsState
├── holiday.ts    ← HolidayData、HolidayYearData、HolidayDayData
└── index.ts      ← barrel re-export（统一出口）
```

## 三条判断规则

1. **共享类型放 `src/types/<domain>.ts`**
   多处引用的数据模型必须提取到领域类型文件，**禁止**分散在 composable 或 `.vue` 文件内。

2. **组件私有复杂类型放同目录 `types.ts`**
   仅该组件使用、且字段超过 3 个的复杂 props 结构，可放 `ComponentName/types.ts`。

3. **简单 props 直接内联**
   `defineProps<{ title: string; count: number }>()` 等简单结构无需提取。

## 禁止模式

```ts
// ❌ 在 composable 或 .vue 内定义业务模型
interface FundItem { fundcode: string; /* ... */ }

// ❌ src/types/index.ts 一个文件堆所有类型
```

## 正确模式

```ts
// ✅ 从领域文件导入
import type { FundItem } from '@/types/fund';

// ✅ 简单 props 内联
defineProps<{ fundCode: string; darkMode?: boolean }>();

// ✅ composable/store 需要导出类型时，用 re-export 保持向后兼容
// 定义本身仍在 src/types/ 中
export type { FundItem } from '@/types/fund';
```
