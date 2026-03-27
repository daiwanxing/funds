# Mac 股票 App 风格配色方案

## 1. 配色目标

这套配色方案不是简单"抄 UI 颜色"，而是提炼出一种适合金融 / 行情 / 投资驾驶舱类 Web 产品的视觉语言：

* **深色、克制、专业**：整体以近黑灰为底，减少噪音，突出数据本身
* **高对比但不刺眼**：信息层级清晰，避免纯黑纯白带来的生硬感
* **涨跌强语义**：红涨绿跌（偏东亚市场语义），数值状态一眼可辨
* **图表优先**：配色服务于曲线、卡片、标签、状态，而不是装饰
* **适配长时间盯盘**：避免高饱和背景，局部高亮承担注意力引导

---

## 2. 视觉气质拆解（基于 Mac 股票 App）

### 2.1 基础底色并不是纯黑

不是 `#000000`，而是带一点暖感 / 中性色倾向的深灰黑：
* 更高级，不会像工程后台
* 卡片层级更容易被拉开
* 红绿行情色不会过于炸裂

### 2.2 高亮依赖"少量发光感"

* 亮一点的描边
* 柔和的外发光
* 局部半透明填充

而不是靠大面积高饱和色块。

### 2.3 红绿不是单一颜色，而是一组层级

上涨红并不只有一个红：主红 / 深红 / 浅红，绿色同理。

---

## 3. 色板（设计令牌级）

### 3.1 Neutral 中性色

#### 背景层

| Token | 色值 | 用途 |
|---|---|---|
| `--bg-0` | `#0A0B0D` | App Base（最深） |
| `--bg-1` | `#111317` | Page Surface |
| `--bg-2` | `#171A1F` | Card Surface |
| `--bg-3` | `#1D2128` | Elevated Surface |
| `--bg-4` | `#252A33` | Hover Surface |

#### 边框 / 分隔线

| Token | 色值 |
|---|---|
| `--border-subtle` | `rgba(255,255,255,0.06)` |
| `--border-default` | `rgba(255,255,255,0.10)` |
| `--border-strong` | `rgba(255,255,255,0.16)` |
| `--border-focus` | `rgba(75,146,255,0.55)` |

#### 文本层

| Token | 色值 |
|---|---|
| `--text-primary` | `rgba(255,255,255,0.92)` |
| `--text-secondary` | `rgba(255,255,255,0.68)` |
| `--text-tertiary` | `rgba(255,255,255,0.44)` |
| `--text-disabled` | `rgba(255,255,255,0.24)` |

---

### 3.2 Brand / Accent 强调色

克制使用，只用于交互态，不抢行情红绿的语义。

| Token | 色值 |
|---|---|
| `--accent-primary` | `#2F81F7` |
| `--accent-hover` | `#4B92FF` |
| `--accent-active` | `#1F6FE0` |
| `--accent-soft-bg` | `rgba(47,129,247,0.14)` |
| `--accent-soft-border` | `rgba(75,146,255,0.42)` |

适用：输入框 focus / 选中 Tab / 卡片选中描边 / 主操作按钮 / 图表聚焦辅助线

---

### 3.3 Rise 上涨色系（红）

| Token | 色值 |
|---|---|
| `--rise-primary` | `#FF5A52` |
| `--rise-strong` | `#FF453A` |
| `--rise-deep` | `#D93A32` |
| `--rise-soft-bg` | `rgba(255,90,82,0.14)` |
| `--rise-soft-fill` | `rgba(255,90,82,0.24)` |
| `--rise-line-glow` | `rgba(255,90,82,0.32)` |

---

### 3.4 Fall 下跌色系（绿）

| Token | 色值 |
|---|---|
| `--fall-primary` | `#30D158` |
| `--fall-strong` | `#32C759` |
| `--fall-deep` | `#1FA346` |
| `--fall-soft-bg` | `rgba(48,209,88,0.14)` |
| `--fall-soft-fill` | `rgba(48,209,88,0.22)` |
| `--fall-line-glow` | `rgba(48,209,88,0.28)` |

---

### 3.5 功能色

| Token | 色值 | 用途 |
|---|---|---|
| `--warning-primary` | `#FF9F0A` | 警告 / AI 观望标签 |
| `--danger-primary` | `#FF443A` | 错误 / 系统异常 |
| `--success-primary` | `#30D158` | 完成态 |
| `--info-primary` | `#64D2FF` | 信息 / 提示 |

---

## 4. 渐变定义

### 上涨主图面积渐变

```css
background: linear-gradient(
  180deg,
  rgba(255, 90, 82, 0.32) 0%,
  rgba(255, 90, 82, 0.12) 45%,
  rgba(255, 90, 82, 0.02) 100%
);
```

### 下跌主图面积渐变

```css
background: linear-gradient(
  180deg,
  rgba(48, 209, 88, 0.30) 0%,
  rgba(48, 209, 88, 0.10) 45%,
  rgba(48, 209, 88, 0.02) 100%
);
```

### 卡片选中描边光感

```css
box-shadow:
  0 0 0 1px rgba(75, 146, 255, 0.55),
  0 0 0 4px rgba(47, 129, 247, 0.10);
```

### 红色行情标签

```css
background: linear-gradient(180deg, #FF625B 0%, #FF453A 100%);
```

### 绿色行情标签

```css
background: linear-gradient(180deg, #35D96A 0%, #1FA346 100%);
```

---

## 5. CSS Variables 完整定义

```css
:root {
  /* Backgrounds */
  --bg-0: #0A0B0D;
  --bg-1: #111317;
  --bg-2: #171A1F;
  --bg-3: #1D2128;
  --bg-4: #252A33;

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.16);
  --border-focus: rgba(75, 146, 255, 0.55);

  /* Text */
  --text-primary: rgba(255, 255, 255, 0.92);
  --text-secondary: rgba(255, 255, 255, 0.68);
  --text-tertiary: rgba(255, 255, 255, 0.44);
  --text-disabled: rgba(255, 255, 255, 0.24);

  /* Accent */
  --accent-primary: #2F81F7;
  --accent-hover: #4B92FF;
  --accent-active: #1F6FE0;
  --accent-soft-bg: rgba(47, 129, 247, 0.14);

  /* Rise (Up) */
  --rise-primary: #FF5A52;
  --rise-strong: #FF453A;
  --rise-deep: #D93A32;
  --rise-soft-bg: rgba(255, 90, 82, 0.14);
  --rise-soft-fill: rgba(255, 90, 82, 0.24);

  /* Fall (Down) */
  --fall-primary: #30D158;
  --fall-strong: #32C759;
  --fall-deep: #1FA346;
  --fall-soft-bg: rgba(48, 209, 88, 0.14);
  --fall-soft-fill: rgba(48, 209, 88, 0.22);

  /* Utility */
  --warning-primary: #FF9F0A;
  --danger-primary: #FF443A;
  --success-primary: #30D158;
  --info-primary: #64D2FF;
}
```

---

## 6. 组件级配色规范

### 页面背景层级

| 层级 | Token |
|---|---|
| 页面最外层 | `bg-0` |
| 内容区 | `bg-1` |
| 次级模块 / 面板 | `bg-2` |
| 悬浮层 / 抽屉 / Modal | `bg-3` |

> 至少拉出 3 层深浅，空间层次才会成立。

### 卡片 Card

| 状态 | 样式 |
|---|---|
| 默认背景 | `bg-2` |
| hover 背景 | `bg-3` |
| 默认边框 | `border-subtle` |
| 选中边框 | `accent-primary` |
| 选中外光 | `accent-soft-bg` |

### 列表项 List Item

| 状态 | 样式 |
|---|---|
| 默认 | 透明或 `bg-2` |
| hover | `rgba(255,255,255,0.04)` |
| active / selected | `rgba(255,255,255,0.06)` + 蓝色左侧描边 |

### Tab / 分段控制器

| 状态 | 样式 |
|---|---|
| 未选中 | `text-secondary` |
| hover | `text-primary` |
| 选中 | `text-primary` + `accent-soft-bg` 背景 |

### 输入框 Search / Input

| 状态 | 样式 |
|---|---|
| 默认 | 背景 `rgba(255,255,255,0.04)`，边框透明 |
| placeholder | `text-tertiary` |
| focus | 背景略提亮 + 1px `accent-primary` 描边 + 轻微 glow |

### 涨跌胶囊标签

| 状态 | 样式 |
|---|---|
| 涨 | 背景 `rise-strong`，文字白色 |
| 跌 | 背景 `fall-strong`，文字白色 |

---

## 7. 图表配色规范

### 主折线图

* 上涨：`rise-primary`，线宽 2px
* 下跌：`fall-primary`，线宽 2px
* hover 当前点：线色实心点 + 外圈半透明 glow

### 面积图

* 只做上深下浅透明渐变（见第 4 节）
* 让线条本身成为视觉主角

### 网格线 / 坐标轴

| 元素 | 样式 |
|---|---|
| 网格线 | `rgba(255,255,255,0.08)` |
| 坐标文字 | `text-tertiary` |
| 十字准星 | `rgba(255,255,255,0.16)` |

### 成交量柱状图

| 状态 | 颜色 |
|---|---|
| 默认 | `rgba(255,255,255,0.22)` |
| 上涨日 | `rgba(255,90,82,0.50)` |
| 下跌日 | `rgba(48,209,88,0.42)` |

### Mini Sparkline

* 尺寸小时不做面积填充
* 仅保留线色 + 少量底部虚线
* 避免复杂网格

---

## 8. 使用原则

### 应该

* 大面积区域用低对比
* 关键数据用高对比白字
* 状态色只留给状态信息
* 蓝色强调只给交互，不抢行情红绿的主语义

### 不应该

* 页面到处都是红绿
* 所有边框都明显可见
* 每一层都用发光效果
* 图表、按钮、标签都抢注意力

> **背景要退后，结构要安静，只有数据和状态负责发声。**

---

## 9. 整页颜色占比建议

| 类型 | 比例 |
|---|---|
| 中性色背景 / 结构色 | 78% – 85% |
| 文本白灰层 | 10% – 15% |
| 强调蓝 | 2% – 4% |
| 涨跌状态色 | 3% – 6% |

---

## 10. 三级 Token 体系

| 级别 | 内容 |
|---|---|
| **A. Foundation** | 背景、分层、边框、文本 |
| **B. Semantic** | rise / fall / warning / info / success / danger |
| **C. Interaction** | accent / hover / active / focus / selected |

所有页面（首页、详情页、抽屉、搜索）共用同一套 token，不重复挑色。

---

## 11. 最终风格定义

**Professional / Calm / Focused / Dense / Premium / Market-native**

**专业、冷静、聚焦数据、密度适中、带一点高级感的深色金融视觉系统。**

---

## 前端落地要求

* 全部转为 design tokens（CSS Variables）
* 不在业务组件里写死红绿色值
* 图表颜色统一走 token map
* 预留"红涨绿跌 / 绿涨红跌"市场模式切换能力
