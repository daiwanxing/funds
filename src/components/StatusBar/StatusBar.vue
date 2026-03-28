<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { isDuringDate } from "@/utils/marketStatus";
import { Activity, Settings2 } from "lucide-vue-next";
import packageJson from "../../../package.json";

const props = defineProps<{
  lastUpdateTime?: Date;
}>();

const emit = defineEmits<{
  (e: "settings"): void;
}>();

// 1. 市场开市休市状态感知
const isMarketOpen = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

const checkMarket = () => {
  isMarketOpen.value = isDuringDate();
};

onMounted(() => {
  checkMarket();
  // 每隔一分钟检查一次市场状态
  timer = setInterval(checkMarket, 60000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// 2. 最后更新时间格式化
const formattedTime = computed(() => {
  if (!props.lastUpdateTime) return "--:--:--";
  const d = props.lastUpdateTime;
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
});

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

      <!-- 最后更新时间 -->
      <span class="flex items-center gap-1.5">
        <Activity
          class="w-3.5 h-3.5 opacity-70"
          :stroke-width="2"
        />
        最后更新 <span
          class="font-medium text-s"
          style="letter-spacing: 0.5px;"
        >{{ formattedTime }}</span>
      </span>
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
