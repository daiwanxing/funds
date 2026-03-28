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
  <div
    ref="wrapperRef"
    class="ticker-wrapper bg-bg-1 border-b border-white/6 h-12 flex items-center overflow-hidden whitespace-nowrap"
  >
    <div
      class="ticker-track flex items-center h-full"
      :class="{ 'is-animating': isMarqueeEnabled }"
      :style="
        isMarqueeEnabled ? { animationDuration: `${animationDuration}s` } : {}
      "
    >
      <!-- 第一份：用于测量实际需要的宽度 -->
      <div ref="trackContentRef" class="flex items-center h-full">
        <TickerCard v-for="item in dataList" :key="item.f12" :item="item" />
      </div>
      <!-- 第二份：仅在内容超出容器需要跑马灯时才渲染，实现无缝对接 -->
      <div v-if="isMarqueeEnabled" class="flex items-center h-full">
        <TickerCard v-for="item in dataList" :key="item.f12" :item="item" />
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
