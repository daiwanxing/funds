# Phase 3：H5 响应式适配

> **前置条件**：Phase 2 已完成并通过验收，项目已部署到 Vercel 并可公网访问。
>
> **目标**：适配移动端浏览器，使项目在手机上也有良好的使用体验。

---

## 现状分析

原项目为 Chrome 扩展弹窗设计，**固定 790×590px 窗口**，存在以下移动端问题：

| 问题 | 详细说明 |
|---|---|
| 固定宽度布局 | 多处 `min-width: 630px` / `width: 790px` 硬编码 |
| 表格在小屏溢出 | 基金列表多列表格在手机上无法完整展示 |
| 字号过小 | 12-13px 在手机端阅读困难 |
| 拖拽不友好 | HTML5 Drag API 在触摸屏上不可用 |
| 弹窗尺寸 | 详情弹窗固定宽高，移动端无法全屏 |

---

## Step 1：响应式基础设施

### 1.1 CSS 变量 + 媒体查询

```scss
// src/styles/variables.scss
:root {
  --font-size-base: 14px;
  --font-size-sm: 12px;
  --content-max-width: 800px;
  --spacing-sm: 4px;
  --spacing-md: 8px;
  --spacing-lg: 16px;
}

@media (max-width: 768px) {
  :root {
    --font-size-base: 16px;
    --font-size-sm: 14px;
    --content-max-width: 100%;
    --spacing-sm: 6px;
    --spacing-md: 12px;
    --spacing-lg: 20px;
  }
}
```

### 1.2 移除固定宽度

```diff
  .container {
-   min-width: 630px;
+   max-width: var(--content-max-width);
+   width: 100%;
+   margin: 0 auto;
+   padding: 0 var(--spacing-md);
+   box-sizing: border-box;
  }
```

---

## Step 2：指数栏适配

PC 端横排展示 → 移动端可横向滑动：

```scss
.tab-row {
  display: flex;
  gap: var(--spacing-md);

  @media (max-width: 768px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;

    .tab-col {
      flex-shrink: 0;
      min-width: 120px;
      scroll-snap-align: start;
    }
  }
}
```

---

## Step 3：基金列表适配

核心问题：多列表格在移动端溢出。

### 方案：移动端切换为卡片布局

```vue
<template>
  <!-- PC 端保持表格 -->
  <table v-if="!isMobile" class="fund-table">
    <!-- 原有表格逻辑 -->
  </table>

  <!-- 移动端使用卡片 -->
  <div v-else class="fund-cards">
    <div v-for="el in dataList" :key="el.fundcode" class="fund-card"
         @click="fundDetail(el)">
      <div class="card-header">
        <span class="fund-name">{{ el.name }}</span>
        <span :class="el.gszzl >= 0 ? 'up' : 'down'">{{ el.gszzl }}%</span>
      </div>
      <div class="card-body">
        <div v-if="showGains" class="card-item">
          <label>估算收益</label>
          <span :class="el.gains >= 0 ? 'up' : 'down'">
            {{ parseFloat(el.gains).toLocaleString('zh', { minimumFractionDigits: 2 }) }}
          </span>
        </div>
        <!-- 更多字段... -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  computed: {
    isMobile(): boolean {
      return window.innerWidth <= 768
    }
  }
}
</script>
```

```scss
.fund-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.fund-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: var(--spacing-md);
}
```

---

## Step 4：弹窗/详情页适配

```scss
// 详情弹窗在移动端全屏
.detail-container {
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 100;
    overflow-y: auto;
  }
}
```

ECharts 图表需设置响应式：

```ts
window.addEventListener('resize', () => {
  chart.resize()
})
```

---

## Step 5：触摸排序

HTML5 Drag API 在触摸屏上不可用，替代方案：

```bash
npm install vue-draggable-plus
```

```vue
<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
</script>

<template>
  <VueDraggable v-model="dataList" :disabled="!isEdit" @end="onDragEnd">
    <div v-for="el in dataList" :key="el.fundcode">
      <!-- 内容 -->
    </div>
  </VueDraggable>
</template>
```

---

## Step 6：底部操作栏

移动端将底部按钮改为固定底栏：

```scss
.action-row {
  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-around;
    padding: var(--spacing-md);
    background: white;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    z-index: 50;
  }
}

// 为固定底栏留出空间
.container {
  @media (max-width: 768px) {
    padding-bottom: 60px;
  }
}
```

---

## 验收标准

### 设备测试

- [ ] Chrome DevTools 模拟 iPhone 14（390×844）显示正常
- [ ] Chrome DevTools 模拟 iPad（768×1024）显示正常
- [ ] 实际手机浏览器访问 Vercel 站点正常

### 功能验证

- [ ] 指数栏可横向滑动
- [ ] 基金列表以卡片形式展示
- [ ] 点击卡片查看基金详情，全屏弹窗正常
- [ ] 图表自适应宽度
- [ ] 设置页布局合理
- [ ] 编辑模式：触摸拖拽排序正常
- [ ] 底部操作栏固定显示

### 样式验证

- [ ] 无水平溢出（无横向滚动条，指数栏除外）
- [ ] 字号在移动端舒适可读
- [ ] 暗色模式在移动端正常

---

## 风险与注意事项

1. **卡片 vs 表格**：移动端用卡片展示信息密度降低，需在 UI 上取舍展示字段
2. **ECharts 在窄屏**：图表 tooltip 在小屏上可能遮挡内容，需调整位置
3. **性能**：移动端网络较慢，考虑接口请求加 loading 和骨架屏
4. **Safe Area**：iPhone 刘海屏/底部指示条需要 `env(safe-area-inset-*)` 适配
