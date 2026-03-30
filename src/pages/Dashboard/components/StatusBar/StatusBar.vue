<script setup lang="ts">
import { ref } from "vue";
import { isDuringDate } from "@/utils/marketStatus";
import { useIntervalFn } from "@vueuse/core";
import { Settings2 } from "lucide-vue-next";
import packageJson from "../../../../../package.json";

const emit = defineEmits<{
  (e: "settings"): void;
}>();

// 市场开市休市状态感知（每分钟复查一次）
const isMarketOpen = ref(isDuringDate());

useIntervalFn(() => {
  isMarketOpen.value = isDuringDate();
}, 60000);

const appVersion = `v${packageJson.version}`;
</script>

<template>
  <div class="h-full w-full flex items-center justify-between px-4 text-xs text-t font-mono">
    <!-- 左侧区域 -->
    <div class="flex items-center gap-2">
      <!-- 股市状态 -->
      <span class="flex items-center gap-1.5 min-w-[90px]">
        <span
          class="w-2 h-2 rounded-full"
          :class="isMarketOpen ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/20'"
        />
        {{ isMarketOpen ? "股市交易中" : "股市已收盘" }}
      </span>

      <!-- 分隔线 -->
      <span class="w-[1px] h-3 bg-white/6 mx-1" />
    </div>

    <!-- 右侧区域 -->
    <div class="flex items-center gap-3">
      <span class="tracking-wide text-white/50">
        {{ appVersion }}
      </span>

      <!-- 分隔线 -->
      <span class="w-[1px] h-3 bg-white/6 mx-1" />

      <!-- 设置入口 -->
      <button 
        class="flex items-center gap-1.5 hover:text-p transition-colors cursor-pointer ml-1"
        @click="emit('settings')"
      >
        <Settings2
          class="w-3.5 h-3.5"
          :stroke-width="2"
        />
        设置
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 由于组件独立，部分样式我们直接使用了原子化 CSS 类定义 */
</style>
