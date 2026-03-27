<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
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
    :class="{ 'dashboard--empty': !hasFunds }"
  >
    <!-- ── Zone A: 全景走马灯 ────────────────────── -->
    <header class="zone-a">
      <!-- Phase 2: <GlobalTicker /> -->
      <GlobalTicker :data-list="globalIndices.dataList.value" />
    </header>

    <!-- ── Zone B: 自选核心控制台 ─────────────────── -->
    <main class="zone-b">
      <!-- 空状态：引导添加第一只基金 -->
      <div v-if="!hasFunds" class="h-full flex items-center justify-center">
        <div class="flex flex-col items-center gap-6 px-8 py-12 rounded-xl bg-bg-2 border border-white/6 max-w-md w-full mx-4">
          <div class="text-4xl">📊</div>
          <div class="text-center">
            <p class="text-p text-base font-semibold mb-1">添加你的第一只基金</p>
            <p class="text-t text-sm">搜索基金名称或代码，开始追踪净值</p>
          </div>
          <!-- Phase 2: <FundSearch /> -->
          <div class="w-full h-10 rounded-lg bg-white/4 border border-white/6 flex items-center px-3 text-t text-sm cursor-text">
            🔍 搜索基金代码或名称
          </div>
          <div class="w-full">
            <p class="text-t text-xs mb-2">热门推荐</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="name in ['沪深 300 ETF', '中证白酒', '纳指 ETF', '黄金 ETF', '半导体 ETF', '中证医疗']" :key="name"
                class="px-2.5 py-1 rounded-full bg-white/6 text-s text-xs cursor-pointer hover:bg-white/9 transition-colors">
                {{ name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 正常态：基金列表 -->
      <div v-else class="h-full flex flex-col">
        <!-- Phase 2: <FundConsole> 替换此占位 -->
        <div class="flex-1 flex items-center justify-center text-t text-sm">
          基金列表占位（Phase 2 实现）
        </div>
        <!-- 汇总栏 -->
        <div class="h-12 flex items-center justify-between px-4 border-t border-white/6 shrink-0">
          <span class="text-t text-xs">今日收益</span>
          <span class="text-up text-sm">+¥248.00 <span class="text-t">(+0.62%)</span></span>
        </div>
      </div>
    </main>

    <!-- ── Zone C: 基金详情面板（有基金时显示）────── -->
    <aside v-if="hasFunds" class="zone-c">
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
      <!-- Phase 2: <StatusBar /> -->
      <div class="h-full flex items-center justify-between px-4 text-t text-xs">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-fall"></span>
            休市中
          </span>
          <span>自选 {{ settings.fundListM.value.length }} 只</span>
        </div>
        <div class="flex items-center gap-3">
          <button class="hover:text-p transition-colors cursor-pointer" @click="router.push('/settings')">⚙ 设置</button>
          <button class="hover:text-p transition-colors cursor-pointer" @click="changelogRef?.init()">日志</button>
          <button class="hover:text-p transition-colors cursor-pointer" @click="rewardRef?.init()">打赏</button>
        </div>
      </div>
    </footer>

    <!-- ── Zone D: AI FAB（有基金时显示）────────── -->
    <button
      v-if="hasFunds"
      class="zone-d-fab"
      title="AI 洞察"
      @click="aiDrawerOpen = true"
    >
      🤖
    </button>

    <!-- ── Zone D: AI 抽屉 ───────────────────────── -->
    <Transition name="drawer">
      <div v-if="aiDrawerOpen" class="zone-d-overlay" @click="aiDrawerOpen = false" />
    </Transition>
    <Transition name="drawer">
      <aside v-if="aiDrawerOpen" class="zone-d-drawer">
        <div class="h-full flex flex-col bg-bg-3 border-l border-white/6">
          <div class="flex items-center justify-between px-5 py-4 border-b border-white/6 shrink-0">
            <span class="text-p text-sm font-semibold">🤖 AI 洞察</span>
            <button class="text-t hover:text-p text-lg cursor-pointer transition-colors" @click="aiDrawerOpen = false">✕</button>
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
  grid-template-columns: 60fr 40fr;
  grid-template-areas:
    "ticker  ticker"
    "console detail"
    "status  status";
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-0);
  color: var(--text-primary);
  font-family: var(--font-sans);
}

/* 空状态：Zone B 独占全宽 */
.dashboard--empty {
  grid-template-columns: 1fr;
  grid-template-areas:
    "ticker"
    "console"
    "status";
}

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
