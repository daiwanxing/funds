<script setup lang="ts">
import { computed } from "vue";
import type { GlobalIndexItem } from "@/composables/index/useGlobalIndices";

const props = defineProps<{
  item: GlobalIndexItem;
}>();

// 提取数据
const points = computed(() => props.item.trendPoints || []);
const prePrice = computed(() => props.item.prePrice || 0);

// 是否上涨（如果有实时 f3 则用 f3，否则用分时最后一个点和昨收对比，兜底默认涨）
const isUp = computed(() => {
  if (props.item.f3 !== undefined && props.item.f3 !== "-") {
    return Number(props.item.f3) > 0;
  }
  if (points.value.length > 0 && prePrice.value > 0) {
    return points.value[points.value.length - 1] > prePrice.value;
  }
  return true;
});

// 颜色 Token 引用
const colorClass = computed(() => (isUp.value ? "text-up" : "text-down"));
const gradientId = computed(() => `spark-grad-${props.item.f12}`); // 唯一渐变ID

// 图表尺寸
const WIDTH = 64;
const HEIGHT = 24;

const chartPath = computed(() => {
  if (points.value.length === 0) return "";

  const p = points.value;
  const max = Math.max(...p);
  const min = Math.min(...p);
  const range = max - min;

  // 如果没有任何波动，画一条中间的平线
  if (range === 0) {
    return `M 0 ${HEIGHT / 2} L ${WIDTH} ${HEIGHT / 2}`;
  }

  // 构造 SVG Path
  const dx = WIDTH / (p.length - 1 || 1);
  const pathData = p.map((val, i) => {
    // val 归一化并反转坐标轴（SVG 坐标原点在左上角）
    const y = HEIGHT - ((val - min) / range) * HEIGHT;
    const x = i * dx;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  });

  return pathData.join(" ");
});

const chartAreaPath = computed(() => {
  if (!chartPath.value) return "";
  // 构建闭合区域，用于填充底部渐变
  return `${chartPath.value} L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z`;
});
</script>

<template>
  <div
    class="ticker-card flex items-center h-full px-4 hover:bg-bg-2 cursor-default transition-colors border-r border-white/6 last:border-0 relative"
  >
    <!-- 左侧：微型图表（SVG） -->
    <div class="mr-3 shrink-0 flex items-center opacity-80 mt-1">
      <svg :width="WIDTH" :height="HEIGHT" class="overflow-visible">
        <defs>
          <!-- 通过 style 把 CSS variables 直接传入 stop-color 以获取正确的涨跌色 -->
          <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              :stop-color="isUp ? 'var(--rise-soft-bg)' : 'var(--fall-soft-bg)'"
              stop-opacity="1"
            />
            <stop
              offset="100%"
              :stop-color="isUp ? 'var(--rise-primary)' : 'var(--fall-primary)'"
              stop-opacity="0"
            />
          </linearGradient>
        </defs>

        <path
          :d="chartPath"
          fill="none"
          :stroke="isUp ? 'var(--rise-primary)' : 'var(--fall-primary)'"
          stroke-width="1.5"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        <path :d="chartAreaPath" :fill="`url(#${gradientId})`" />
        <!-- 昨收参考线（虚线） -->
        <line
          v-if="points.length > 0 && prePrice > 0"
          x1="0"
          :y1="
            HEIGHT -
            ((prePrice - Math.min(...points)) /
              (Math.max(...points) - Math.min(...points) || 1)) *
              HEIGHT
          "
          :x2="WIDTH"
          :y2="
            HEIGHT -
            ((prePrice - Math.min(...points)) /
              (Math.max(...points) - Math.min(...points) || 1)) *
              HEIGHT
          "
          stroke="var(--border-strong)"
          stroke-width="1"
          stroke-dasharray="2,2"
        />
      </svg>
    </div>

    <!-- 右侧：数值信息 -->
    <div class="flex flex-col justify-center min-w-16">
      <div class="flex items-center gap-2 mb-0.5">
        <span class="text-p text-xs font-semibold">{{ item.f14 }}</span>
      </div>
      <div class="flex items-baseline gap-1.5">
        <span
          :class="colorClass"
          class="text-sm font-mono font-medium tracking-tight"
        >
          {{ item.f2 === "-" ? "--" : item.f2 }}
        </span>
        <span
          v-if="item.f3 !== undefined && item.f3 !== '-'"
          :class="colorClass"
          class="text-[10px] font-mono"
        >
          {{ Number(item.f3) > 0 ? "+" : "" }}{{ item.f3 }}%
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticker-card {
  min-width: 160px;
}
</style>
