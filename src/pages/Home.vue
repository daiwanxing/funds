<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useSettings } from "@/composables/settings";
import { useFundData, useTableSort } from "@/composables/fund";
import { useGlobalIndices } from "@/composables/index";
import { useDragSort } from "@/composables/drag";
import { useHoliday } from "@/composables/holiday";
import { loadHoliday } from "@/utils/marketStatus";
import { storage } from "@/utils/storage";
import { Reward } from "@/components/Reward";
import { ChangeLog } from "@/components/ChangeLog";
import { GlobalTicker } from "@/components/GlobalTicker";
import { StatusBar } from "@/components/StatusBar";
import FundSearch from "./Home/components/FundSearch.vue";
import { BarChart2, Search, Bot, X, Star, Plus } from "lucide-vue-next";

const router = useRouter();
const settings = useSettings();
const { loadFromStorage: loadHolidayFromStorage } = useHoliday();

const fundData = useFundData(
  settings.fundListM,
  settings.userId,
  settings.sortTypeObj,
);
const globalIndices = useGlobalIndices();
const tableSort = useTableSort(fundData.dataList, fundData.dataListDft);

const fundDrag = useDragSort(
  settings.fundListM,
  fundData.dataList,
  "fundListM",
  "code",
);



const rewardRef = ref<InstanceType<typeof Reward> | null>(null);
const changelogRef = ref<InstanceType<typeof ChangeLog> | null>(null);

/** 是否有自选基金（控制 Zone C 显示和 FAB 显示） */
const hasFunds = computed(() => settings.fundListM.value.length > 0);

/** Zone D AI 抽屉 */
const aiDrawerOpen = ref(false);

/** 当前选中基金（Zone B → Zone C 联动） */
const selectedFundCode = ref<string | null>(null);

const selectFund = (code: string) => {
  selectedFundCode.value = code;
}

const searchQuery = ref("");

const lastUpdateTime = ref<Date>();

watch(
  () => fundData.dataListDft.value,
  () => {
    lastUpdateTime.value = new Date();
  }
);

onMounted(async () => {
  await loadHoliday();
  loadHolidayFromStorage();
  await settings.load();

  globalIndices.refetch();
  fundData.fetchData();

  // 默认选中第一只基金
  if (settings.fundListM.value.length > 0) {
    selectedFundCode.value = settings.fundListM.value[0].code;
  }
});

const handleRefresh = () => {
  globalIndices.refetch();
  fundData.fetchData();
}
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
    <main class="zone-b flex flex-col h-full overflow-hidden">
      <!-- 常驻顶部搜索框与列表控制 -->
      <div class="px-4 py-3 shrink-0 flex gap-2 items-center border-b border-white/6">
        <FundSearch 
          v-model:query="searchQuery" 
          @add-fund="(code) => fundData.addFund([code])" 
        />
        <button v-if="hasFunds" class="shrink-0 text-xs border border-white/6 rounded py-1 px-3 bg-bg-2 hover:bg-white/10 transition-colors" @click="settings.fundListM.value = []; storage.set({ fundListM: [] })">
          清空列表
        </button>
      </div>

      <!-- 空状态：独立设计的极客黑胶囊 -->
      <div v-if="!hasFunds" class="flex-1 flex flex-col items-center justify-center pb-20">
        <!-- 圆角方形外壳 -->
        <div class="relative w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Star class="w-8 h-8 opacity-40 text-white" />
          <!-- 右下角蓝底的加号徽标 -->
          <div class="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shadow-lg border-2 border-[#1c1c1e]">
            <Plus class="w-4 h-4" stroke-width="3" />
          </div>
        </div>
        <p class="text-white text-base font-bold mb-3 tracking-wide">还没有自选基金</p>
        <p class="text-t text-xs max-w-[240px] text-center leading-relaxed opacity-60">
          添加你关注的基金，实时追踪行情与收益
        </p>
      </div>

      <!-- 正常态：基金列表 -->
      <div v-else class="flex-1 flex flex-col overflow-hidden">
        <!-- Phase 2: <FundConsole> 替换此占位 -->
        <div class="flex-1 flex items-center justify-center text-t text-sm relative">
          基金列表占位（Phase 2 实现）
        </div>
        <!-- 汇总栏 -->
        <div class="h-12 flex items-center justify-between px-4 border-t border-white/6 shrink-0">
          <span class="text-t text-xs">今日收益</span>
          <span class="text-up text-sm">+¥248.00 <span class="text-t">(+0.62%)</span></span>
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
        :fund-count="settings.fundListM.value.length"
        :last-update-time="lastUpdateTime"
        @edit="settings.isEdit.value = !settings.isEdit.value"
        @settings="router.push('/settings')"
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
      <div v-if="aiDrawerOpen" class="zone-d-overlay" @click="aiDrawerOpen = false" />
    </Transition>
    <Transition name="drawer">
      <aside v-if="aiDrawerOpen" class="zone-d-drawer">
        <div class="h-full flex flex-col bg-bg-3 border-l border-white/6">
          <div class="flex items-center justify-between px-5 py-4 border-b border-white/6 shrink-0">
            <span class="text-p text-sm font-semibold flex items-center gap-1.5"><Bot class="w-4 h-4" /> AI 洞察</span>
            <button class="text-t flex items-center justify-center hover:text-p cursor-pointer transition-colors" @click="aiDrawerOpen = false">
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

    <!-- 全局弹窗 -->
    <Reward ref="rewardRef" />
    <ChangeLog
      ref="changelogRef"
      :dark-mode="true"
      @close="storage.set({ version: '3.0.0' })"
    />
  </div>
</template>

<style scoped>
.dashboard {
  display: grid;
  grid-template-rows: 48px 1fr 36px;
  grid-template-columns: 320px 1fr;
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
