<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import type { GlobalIndexItem } from "@/composables/index/useGlobalIndices";
import TickerCard from "./TickerCard.vue";

const props = defineProps<{
  dataList: GlobalIndexItem[];
}>();

const wrapperRef = ref<HTMLElement | null>(null);
const trackContentRef = ref<HTMLElement | null>(null);

const isMarqueeEnabled = ref(false);
const animationDuration = ref(0);
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
    updateMarquee();
  });
  if (wrapperRef.value) resizeObserver.observe(wrapperRef.value);
  if (trackContentRef.value) resizeObserver.observe(trackContentRef.value);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});

watch(
  () => props.dataList,
  async () => {
    await nextTick();
    updateMarquee();
  },
  { deep: true },
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

      <!-- 跑马灯轨道 -->
      <div
        class="ticker-track flex items-center h-full"
        :class="{ 'is-animating': isMarqueeEnabled }"
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

.ticker-track {
  width: max-content;
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
