<script setup lang="ts">
import { ref } from "vue";
import { isDuringDate } from "@/utils/marketStatus";
import { useIntervalFn } from "@vueuse/core";
import { Settings2 } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import packageJson from "../../../../../package.json";

const emit = defineEmits<{
  (e: "settings"): void;
  (e: "login"): void;
}>();

const auth = useAuthStore();

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
      <!-- 游客模式标识（仅未登录时展示） -->
      <button
        v-if="!auth.isAuthenticated"
        class="guest-badge"
        @click="emit('login')"
      >
        游客模式
      </button>

      <!-- 设置入口（仅登录用户展示） -->
      <template v-if="auth.isAuthenticated">
        <span class="w-[1px] h-3 bg-white/6 mx-1" />
        <button
          class="flex items-center gap-1.5 hover:text-p transition-colors cursor-pointer"
          @click="emit('settings')"
        >
          <Settings2
            class="w-3.5 h-3.5"
            :stroke-width="2"
          />
          设置
        </button>
      </template>

      <!-- 分隔线 -->
      <span class="w-[1px] h-3 bg-white/6 mx-1" />

      <!-- 版本号（始终在最右侧） -->
      <span class="tracking-wide text-white/50">
        {{ appVersion }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.guest-badge {
  padding: 0;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
  cursor: pointer;
  transition: color 0.15s ease;
}

.guest-badge:hover {
  color: rgba(255, 255, 255, 0.75);
}
</style>
