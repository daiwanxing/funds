<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useSettings } from "@/composables/settings";
import { useFundData } from "@/composables/fund";
import { useGlobalIndices } from "@/composables/index";
import { useHoliday } from "@/composables/holiday";
import { GlobalTicker } from "@/components/GlobalTicker";
import { StatusBar } from "@/components/StatusBar";
import ZoneBHeader from "./Home/components/ZoneBHeader.vue";
import FundSavedList from "./Home/components/FundSavedList.vue";
import FundSearchList from "./Home/components/FundSearchList.vue";
import { useFundSearch } from "@/composables/fund/useFundSearch";
import { Bot, X } from "lucide-vue-next";

const settings = useSettings();
useHoliday();

const fundData = useFundData(
  settings.fundListM,
  settings.userId,
  settings.sortTypeObj,
);
const globalIndices = useGlobalIndices();

/** 是否有自选基金（控制 Zone C 显示和 FAB 显示） */
const hasFunds = computed(() => settings.fundListM.value.length > 0);

/** Zone D AI 抽屉 */
const aiDrawerOpen = ref(false);

/** 当前选中基金（Zone B → Zone C 联动） */
const selectedFundCode = computed(() => settings.RealtimeFundcode.value);

const setSelectedFundCode = (code: string | null) => {
  settings.RealtimeFundcode.value = code;
  settings.updateSetting("RealtimeFundcode", code);
};

const selectFund = (code: string) => {
  if (settings.RealtimeFundcode.value === code) return;
  setSelectedFundCode(code);
};

const searchQuery = ref("");
const { searchOptions, loading: isSearching } = useFundSearch(searchQuery);

const lastUpdateTime = ref<Date>();

const normalizeSelectedFundCode = () => {
  const codes = settings.fundListM.value.map((item) => item.code);
  const current = settings.RealtimeFundcode.value;

  if (codes.length === 0) {
    if (current !== null) {
      setSelectedFundCode(null);
    }
    return;
  }

  if (current && codes.includes(current)) {
    return;
  }

  setSelectedFundCode(codes[0]);
};

watch(
  () => fundData.dataListDft.value,
  () => {
    lastUpdateTime.value = new Date();
  },
);

watch(
  [
    () => settings.fundListM.value.map((item) => item.code),
    () => settings.RealtimeFundcode.value,
  ],
  () => {
    if (!settings.isReady.value) return;
    normalizeSelectedFundCode();
  },
);

onMounted(async () => {
  await settings.load();

  globalIndices.refetch();
  fundData.fetchData();
  normalizeSelectedFundCode();
});
</script>

<template>
  <div
    v-if="settings.isReady.value"
    class="dashboard"
  >
    <!-- ── Zone A: 全景走马灯 ────────────────────── -->
    <header class="zone-a">
      <!-- Phase 2: <GlobalTicker /> -->
      <GlobalTicker :data-list="globalIndices.dataList.value" />
    </header>

    <!-- ── Zone B: 自选核心控制台 ─────────────────── -->
    <main class="zone-b flex flex-col h-full overflow-hidden bg-[#161618]">
      <ZoneBHeader 
        v-model:query="searchQuery"
        :is-searching="isSearching"
        :saved-count="settings.fundListM.value.length"
        :result-count="searchOptions?.length"
      />

      <!-- 搜索列表或自选列表切换 -->
      <template v-if="searchQuery">
        <FundSearchList 
          :query="searchQuery"
          :options="searchOptions || []"
          :loading="isSearching"
          @add="(code) => { fundData.addFund([code]); searchQuery = ''; }"
        />
      </template>
      <template v-else>
        <FundSavedList 
          :items="fundData.dataList.value"
          :active-code="selectedFundCode"
          @select="selectFund"
        />
      </template>

      <!-- 汇总栏 (仅在未搜索且有持仓时显示) -->
      <div
        v-if="!searchQuery && hasFunds"
        class="h-10 flex items-center justify-between px-4 border-t border-white/5 shrink-0 bg-[#121213]"
      >
        <div class="flex items-center gap-1.5 text-white/40 text-[11px] font-sans">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-trending-up"
          ><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
          今日
          <span
            class="font-bold font-mono text-[13px] ml-0.5 opacity-90"
            :class="fundData.allGains.value[0] > 0 ? 'text-up' : fundData.allGains.value[0] < 0 ? 'text-down' : 'text-white/30'"
          >
            {{ fundData.allGains.value[0] > 0 ? '+¥' + fundData.allGains.value[0].toFixed(2) : fundData.allGains.value[0] < 0 ? '-¥' + Math.abs(fundData.allGains.value[0]).toFixed(2) : '¥0' }}
          </span>
        </div>
        <div class="flex items-center gap-1.5 text-white/40 text-[11px] font-sans">
          累计
          <span
            class="font-bold font-mono text-[13px] ml-0.5 opacity-90"
            :class="fundData.allCostGains.value[0] > 0 ? 'text-up' : fundData.allCostGains.value[0] < 0 ? 'text-down' : 'text-white/30'"
          >
            {{ fundData.allCostGains.value[0] > 0 ? '+¥' + fundData.allCostGains.value[0].toFixed(2) : fundData.allCostGains.value[0] < 0 ? '-¥' + Math.abs(fundData.allCostGains.value[0]).toFixed(2) : '¥0' }}
          </span>
        </div>
      </div>
    </main>

    <!-- ── Zone C: 基金详情面板（全局常驻）────── -->
    <aside class="zone-c">
      <!-- Phase 3: <FundDetail :code="selectedFundCode" /> -->
      <div class="h-full flex flex-col">
        <!-- Tab 栏占位 -->
        <div class="flex border-b border-white/6 shrink-0">
          <button
            v-for="tab in ['实时走势', '历史净值', '新闻·题材']"
            :key="tab"
            class="px-4 py-3 text-xs text-s hover:text-p transition-colors cursor-pointer"
            :class="tab === '实时走势' ? 'text-p border-b-2 border-accent' : ''"
          >
            {{ tab }}
          </button>
        </div>
        <!-- 内容占位 -->
        <div class="flex-1 flex items-center justify-center text-t text-sm">
          基金详情占位（Phase 3 实现）
        </div>
      </div>
    </aside>

    <!-- ── Zone E: 状态栏 ────────────────────────── -->
    <footer class="zone-e">
      <StatusBar
        :last-update-time="lastUpdateTime"
      />
    </footer>

    <!-- ── Zone D: AI FAB（有基金时显示）────────── -->
    <button
      v-if="hasFunds"
      class="zone-d-fab"
      title="AI 洞察"
      @click="aiDrawerOpen = true"
    >
      <Bot class="w-6 h-6" />
    </button>

    <!-- ── Zone D: AI 抽屉 ───────────────────────── -->
    <Transition name="drawer">
      <div
        v-if="aiDrawerOpen"
        class="zone-d-overlay"
        @click="aiDrawerOpen = false"
      />
    </Transition>
    <Transition name="drawer">
      <aside
        v-if="aiDrawerOpen"
        class="zone-d-drawer"
      >
        <div class="h-full flex flex-col bg-bg-3 border-l border-white/6">
          <div class="flex items-center justify-between px-5 py-4 border-b border-white/6 shrink-0">
            <span class="text-p text-sm font-semibold flex items-center gap-1.5"><Bot class="w-4 h-4" /> AI 洞察</span>
            <button
              class="text-t flex items-center justify-center hover:text-p cursor-pointer transition-colors"
              @click="aiDrawerOpen = false"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          <!-- Phase 4: <AIDecision /> -->
          <div class="flex-1 flex items-center justify-center text-t text-sm">
            AI 决策占位（Phase 4 实现）
          </div>
          <div class="px-5 py-3 border-t border-white/6 text-xs text-d shrink-0">
            ⚠️ 以上由 AI 生成，仅供参考，不构成任何投资建议。
          </div>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.dashboard {
  display: grid;
  grid-template-rows: 48px 1fr 36px;
  grid-template-columns: 380px 1fr;
  grid-template-areas:
    "ticker  ticker"
    "console detail"
    "status  status";
  height: 100vh;
  min-width: 1000px;
  overflow-x: auto;
  overflow-y: hidden;
  background-color: var(--bg-0);
  color: var(--text-primary);
  font-family: var(--font-sans);
}

/* 移除隐藏控制，保证 60 40 划分 */

.zone-a {
  grid-area: ticker;
  background-color: var(--bg-1);
  border-bottom: 1px solid var(--border-subtle);
}

.zone-b {
  grid-area: console;
  overflow-y: auto;
  background-color: var(--bg-1);
  border-right: 1px solid var(--border-subtle);
}

.zone-c {
  grid-area: detail;
  overflow-y: auto;
  background-color: var(--bg-1);
}

.zone-e {
  grid-area: status;
  background-color: var(--bg-0);
  border-top: 1px solid var(--border-subtle);
}

/* ── Zone D FAB ─────────────────────────────── */
.zone-d-fab {
  position: fixed;
  right: 24px;
  bottom: 56px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--accent-primary);
  border: none;
  font-size: 20px;
  cursor: pointer;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(47, 129, 247, 0.4);
  transition: background-color 0.2s, transform 0.2s;
}
.zone-d-fab:hover {
  background-color: var(--accent-hover);
  transform: scale(1.05);
}

/* ── Zone D Overlay ─────────────────────────── */
.zone-d-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 299;
}

/* ── Zone D Drawer ──────────────────────────── */
.zone-d-drawer {
  position: fixed;
  top: 48px;
  right: 0;
  bottom: 36px;
  width: 400px;
  z-index: 300;
}

/* ── Drawer transitions ─────────────────────── */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.zone-d-drawer.drawer-enter-from,
.zone-d-drawer.drawer-leave-to {
  transform: translateX(100%);
}
</style>
