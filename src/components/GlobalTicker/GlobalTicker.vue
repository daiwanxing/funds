<script setup lang="ts">
import type { GlobalIndexItem } from "@/composables/index/useGlobalIndices";
import TickerCard from "./TickerCard.vue";

defineProps<{
  dataList: GlobalIndexItem[];
}>();
</script>

<template>
  <div
    class="ticker-wrapper bg-bg-1 border-b border-white/6 h-12 flex items-center overflow-hidden whitespace-nowrap"
  >
    <div
      class="ticker-track flex items-center h-full"
      v-if="dataList.length > 0"
    >
      <!-- 复制两份实现无缝滚动 -->
      <div v-for="(_, trackIdx) in 2" :key="trackIdx" class="flex items-center">
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
  animation: marquee 60s linear infinite;
  width: max-content;
}

.ticker-wrapper:hover .ticker-track {
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
