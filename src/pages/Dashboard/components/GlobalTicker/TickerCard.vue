<script setup lang="ts">
import { computed } from "vue";
import { Motion } from "motion-v";
import type { GlobalIndexItem } from "@/composables/index/useGlobalIndices";

const props = defineProps<{
  item: GlobalIndexItem;
}>();

// 提取数据
const points = computed(() => props.item.trendPoints || []);
const prePrice = computed(() => props.item.prePrice || 0);
const totalSessionMinutes = computed(() => props.item.trendSessionMinutes || 0);
const priceValues = computed(() => points.value.map((point) => point.price));

// 是否上涨（如果有实时 f3 则用 f3，否则用分时最后一个点和昨收对比，兜底默认涨）
const isUp = computed(() => {
  if (props.item.f3 !== undefined && props.item.f3 !== "-") {
    return Number(props.item.f3) > 0;
  }
  if (points.value.length > 0 && prePrice.value > 0) {
    return points.value[points.value.length - 1].price > prePrice.value;
  }
  return true;
});

// 颜色 Token 引用
const colorClass = computed(() => (isUp.value ? "text-up" : "text-down"));
const gradientId = computed(() => `spark-grad-${props.item.f12}`); // 唯一渐变ID

// 图表尺寸 (适配高度 35)
const WIDTH = 80;
const HEIGHT = 35;

const resolvePointX = (elapsedMinutes: number): number => {
  if (totalSessionMinutes.value <= 0) return 0;
  return (elapsedMinutes / totalSessionMinutes.value) * WIDTH;
};

const chartPath = computed(() => {
  if (points.value.length === 0) return "";

  const p = priceValues.value;
  const max = Math.max(...p);
  const min = Math.min(...p);
  const range = max - min;
  const firstX = resolvePointX(points.value[0].elapsedMinutes);
  const lastX = resolvePointX(points.value[points.value.length - 1].elapsedMinutes);

  // 如果没有任何波动，画一条中间的平线
  if (range === 0) {
    return `M ${firstX.toFixed(2)} ${(HEIGHT / 2).toFixed(2)} L ${lastX.toFixed(2)} ${(HEIGHT / 2).toFixed(2)}`;
  }

  // 构造 SVG Path
  const pathData = points.value.map((point, i) => {
    const val = p[i];
    // val 归一化并反转坐标轴（SVG 坐标原点在左上角）
    const y = HEIGHT - ((val - min) / range) * HEIGHT;
    const x = resolvePointX(point.elapsedMinutes);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  });

  return pathData.join(" ");
});

const chartAreaPath = computed(() => {
  if (!chartPath.value) return "";
  const lastX = resolvePointX(points.value[points.value.length - 1].elapsedMinutes);
  // 构建闭合区域，用于填充底部渐变
  return `${chartPath.value} L ${lastX.toFixed(2)} ${HEIGHT} L ${resolvePointX(points.value[0].elapsedMinutes).toFixed(2)} ${HEIGHT} Z`;
});
</script>

<template>
  <div class="ticker-card flex items-center h-full px-5 cursor-default transition-colors relative">
    <!-- 左侧：微型图表（SVG） -->
    <div class="mr-3 shrink-0 flex items-center mt-1">
      <svg
        :width="WIDTH"
        :height="HEIGHT"
        class="overflow-visible"
      >
        <defs>
          <!-- 通过 style 把 CSS variables 直接传入 stop-color 以获取正确的涨跌色 -->
          <linearGradient
            :id="gradientId"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              :stop-color="isUp ? 'var(--rise-primary)' : 'var(--fall-primary)'"
              stop-opacity="0.6"
            />
            <stop
              offset="100%"
              :stop-color="isUp ? 'var(--rise-primary)' : 'var(--fall-primary)'"
              stop-opacity="0"
            />
          </linearGradient>
        </defs>

        <!-- 走势折线：使用 motion pathLength 实现从左至右绘制动画 -->
        <Motion
          as="path"
          :d="chartPath"
          fill="none"
          :stroke="isUp ? 'var(--rise-primary)' : 'var(--fall-primary)'"
          stroke-width="1.8"
          stroke-linejoin="round"
          stroke-linecap="round"
          :initial="{ pathLength: 0, opacity: 0 }"
          :animate="{ pathLength: 1, opacity: 1 }"
          :transition="{ pathLength: { duration: 1.2, ease: 'easeOut' }, opacity: { duration: 0.3 } }"
        />
        <!-- 填充区域：延迟淡入，等线条绘制完再显示 -->
        <Motion
          as="path"
          :d="chartAreaPath"
          :fill="`url(#${gradientId})`"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ delay: 0.8, duration: 0.6, ease: 'easeOut' }"
        />
      </svg>
    </div>

    <!-- 右侧：数值信息（随图表一起淡入） -->
    <Motion
      as="div"
      class="flex flex-col justify-center min-w-[76px]"
      :initial="{ opacity: 0, x: 4 }"
      :animate="{ opacity: 1, x: 0 }"
      :transition="{ delay: 0.6, duration: 0.5, ease: 'easeOut' }"
    >
      <div class="flex items-center mb-0.5">
        <span class="text-[11px] font-medium text-white/50 tracking-wide">{{ item.f14 }}</span>
      </div>
      <div class="flex items-baseline gap-1.5">
        <span class="text-[14px] font-bold text-white tracking-tight">
          {{ item.f2 === "-" ? "--" : item.f2 }}
        </span>
        <span
          v-if="item.f3 !== undefined && item.f3 !== '-'"
          :class="colorClass"
          class="text-[11px] font-medium font-mono"
        >
          {{ Number(item.f3) > 0 ? "+" : "" }}{{ item.f3 }}%
        </span>
      </div>
    </Motion>
  </div>
</template>

<style scoped>
.ticker-card {
  min-width: 160px;
}
</style>
