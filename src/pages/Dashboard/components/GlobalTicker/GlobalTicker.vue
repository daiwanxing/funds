<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import type { GlobalIndexItem } from "@/composables/index/useGlobalIndices";
import TickerCard from "./TickerCard.vue";

const props = defineProps<{
  dataList: GlobalIndexItem[];
  isLoading?: boolean;
}>();

const wrapperRef = ref<HTMLElement | null>(null);
const trackContentRef = ref<HTMLElement | null>(null);

const isMarqueeEnabled = ref(false);
const animationDuration = ref(0);
/** 数据已就绪，用于控制 track 的淡入以及走马灯启动 */
const isDataReady = ref(false);
// 滚动速度常量，单位：像素/秒 (值越大滚动越快，50是一个相对适中的阅读速度)
const SCROLL_SPEED = 50;

const updateMarquee = () => {
  if (!wrapperRef.value || !trackContentRef.value) return;
  const wrapperWidth = wrapperRef.value.clientWidth;
  const trackWidth = trackContentRef.value.clientWidth;

  if (trackWidth > wrapperWidth && wrapperWidth > 0) {
    isMarqueeEnabled.value = true;
    animationDuration.value = trackWidth / SCROLL_SPEED;
  } else {
    isMarqueeEnabled.value = false;
  }
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    if (isDataReady.value) updateMarquee();
  });
  if (wrapperRef.value) resizeObserver.observe(wrapperRef.value);
  if (trackContentRef.value) resizeObserver.observe(trackContentRef.value);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

watch(
  () => props.dataList,
  async (list) => {
    if (!list || list.length === 0) return;
    // 数据到达后先让 DOM 渲染完，再量尺寸启动跑马灯
    await nextTick();
    isDataReady.value = true;
    await nextTick();
    updateMarquee();
  },
  { deep: true, immediate: true },
);
</script>

<template>
  <div class="ticker-wrapper border-b border-white/6 h-12 flex items-center relative bg-[#0d0f12]">
    <!-- LIVE 标识区 -->
    <div class="shrink-0 w-[60px] h-full flex flex-col items-center justify-center relative z-20 bg-[#0d0f12]">
      <div
        class="w-1.5 h-1.5 rounded-full bg-blue-500 mb-0.5 animate-pulse"
        style="box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);"
      />
      <div class="text-[10px] font-bold text-blue-500 tracking-wider font-mono">
        LIVE
      </div>
    </div>

    <!-- 滚动展示区 -->
    <div
      ref="wrapperRef"
      class="flex-1 h-full relative overflow-hidden whitespace-nowrap"
    >
      <!-- 左右两侧沉浸式渐变蒙层 (z-index: 10) -->
      <div class="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-r from-[#0d0f12] to-transparent" />
      <div class="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none bg-gradient-to-l from-[#0d0f12] to-transparent" />

      <!-- 加载骨架屏 -->
      <div
        v-if="isLoading || !isDataReady"
        class="ticker-skeleton flex items-center h-full gap-4 px-4"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="skeleton-item flex items-center gap-2"
        >
          <div class="skeleton-chart" />
          <div class="flex flex-col gap-1">
            <div class="skeleton-line w-12" />
            <div class="skeleton-line w-8" />
          </div>
        </div>
      </div>

      <!-- 跑马灯轨道（数据就绪后淡入） -->
      <div
        v-else
        class="ticker-track flex items-center h-full"
        :class="{ 'is-animating': isMarqueeEnabled, 'track-visible': isDataReady }"
        :style="isMarqueeEnabled ? { animationDuration: `${animationDuration}s` } : {}"
      >
        <!-- 第一份：用于测量实际需要的宽度 -->
        <div
          ref="trackContentRef"
          class="flex items-center h-full"
        >
          <TickerCard
            v-for="item in dataList"
            :key="item.f12"
            :item="item"
          />
        </div>
        <!-- 第二份：仅在内容超出容器需要跑马灯时才渲染，实现无缝对接 -->
        <div
          v-if="isMarqueeEnabled"
          class="flex items-center h-full"
        >
          <TickerCard
            v-for="item in dataList"
            :key="item.f12"
            :item="item"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticker-wrapper {
  position: relative;
  width: 100%;
}


.ticker-skeleton {
  width: max-content;
}

.skeleton-item {
  min-width: 160px;
  padding: 0 20px;
}

.skeleton-chart {
  width: 80px;
  height: 35px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.09) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
}

.skeleton-line {
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 25%,
    rgba(255, 255, 255, 0.09) 50%,
    rgba(255, 255, 255, 0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}


.ticker-track {
  width: max-content;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.ticker-track.track-visible {
  opacity: 1;
}

.ticker-track.is-animating {
  animation-name: marquee;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

.ticker-wrapper:hover .ticker-track.is-animating {
  animation-play-state: paused;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
