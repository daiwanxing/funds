<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettings } from '@/composables/settings'
import { useFundData, useTableSort } from '@/composables/fund'
import { useIndexData } from '@/composables/index'
import { useAutoRefresh } from '@/composables/refresh'
import { useDragSort } from '@/composables/drag'
import { useHoliday } from '@/composables/holiday'
import { loadHoliday } from '@/utils/marketStatus'
import { storage } from '@/utils/storage'
import { IndexBar } from '@/components/IndexBar'
import { FundSearch } from '@/components/FundSearch'
import { FundTable } from '@/components/FundTable'
import { ActionBar } from '@/components/ActionBar'
import { AppearanceControls } from '@/components/AppearanceControls'
import { Reward } from '@/components/Reward'
import { ChangeLog } from '@/components/ChangeLog'

const router = useRouter()
const settings = useSettings()
const { holiday, loadFromStorage: loadHolidayFromStorage } = useHoliday()

const fundData = useFundData(settings.fundListM, settings.userId, settings.sortTypeObj)
const indexData = useIndexData(settings.seciList)
const tableSort = useTableSort(fundData.dataList, fundData.dataListDft)
const autoRefresh = useAutoRefresh(
  indexData.fetchIndexData,
  fundData.fetchData,
  settings.isEdit,
  settings.isLiveUpdate,
)

// Drag sort for funds
const fundDrag = useDragSort(
  settings.fundListM,
  fundData.dataList,
  'fundListM',
  'code',
)

// Drag sort for indices (use f12 as match key on indFundData, seciList for storage)
const indexDrag = useDragSort(
  indexData.indFundData,
  undefined,
  'seciList',
  'f12',
)

const rewardRef = ref<InstanceType<typeof Reward> | null>(null)
const changelogRef = ref<InstanceType<typeof ChangeLog> | null>(null)

const allSeciList = [
  { value: '1.000001', label: '上证指数' },
  { value: '1.000300', label: '沪深300' },
  { value: '0.399001', label: '深证成指' },
  { value: '1.000688', label: '科创50' },
  { value: '0.399006', label: '创业板指' },
  { value: '0.399005', label: '中小板指' },
  { value: '100.HSI', label: '恒生指数' },
  { value: '100.DJIA', label: '道琼斯' },
  { value: '100.NDX', label: '纳斯达克' },
  { value: '100.SPX', label: '标普500' },
]

// Pause refresh when editing
watch(settings.isEdit, (val) => {
  if (val) {
    autoRefresh.clearTimers()
    fundData.dataList.value = [...fundData.dataListDft.value]
    tableSort.resetSort()
  } else {
    autoRefresh.checkAndStart()
  }
})

onMounted(async () => {
  await loadHoliday()
  loadHolidayFromStorage()
  await settings.load()

  if (settings.seciList.value.length > 0) {
    indexData.fetchIndexData()
  }
  fundData.fetchData()
  autoRefresh.checkAndStart(true)
})

function handleSaveFund(codes: string[]) {
  fundData.addFund(codes)
}

function handleSelectFund(id: string) {
  if (id === settings.RealtimeFundcode.value) {
    settings.RealtimeFundcode.value = null
    settings.updateSetting('RealtimeFundcode', null)
  } else {
    settings.RealtimeFundcode.value = id
    settings.updateSetting('RealtimeFundcode', id)
  }
}

function handleSelectIndex(item: any) {
  const code = item.f13 + '.' + item.f12
  if (code === settings.RealtimeIndcode.value) {
    settings.RealtimeIndcode.value = null
    settings.updateSetting('RealtimeIndcode', null)
  } else {
    settings.RealtimeIndcode.value = code
    settings.updateSetting('RealtimeIndcode', code)
  }
}

function handleRefresh() {
  indexData.fetchIndexData()
  fundData.fetchData()
}

function handleDarkModeChange(val: boolean) {
  settings.darkMode.value = val
  settings.toggleDarkMode()
}
</script>

<template>
  <div
    v-if="settings.isReady.value"
    class="relative min-w-400px min-h-150px p-2 box-border text-xs font-sans"
    :class="settings.darkMode.value ? 'bg-dark text-white/60' : ''"
    :style="[settings.grayscaleStyle.value, settings.opacityStyle.value]"
  >
    <!-- Index bar -->
    <IndexBar
      :ind-fund-data="indexData.indFundData.value"
      :is-edit="settings.isEdit.value"
      :loading-ind="indexData.loadingInd.value"
      :dark-mode="settings.darkMode.value"
      :seci-list="settings.seciList.value"
      :all-seci-list="allSeciList"
      :badge-content="settings.BadgeContent.value"
      :realtime-indcode="settings.RealtimeIndcode.value"
      @delete-index="indexData.deleteIndex"
      @add-index="indexData.addIndex"
      @select-index="handleSelectIndex"
      @ind-detail="() => {}"
    />

    <!-- Fund search (edit mode) -->
    <FundSearch
      v-if="settings.isEdit.value"
      :fund-list-m="settings.fundListM.value"
      @save="handleSaveFund"
    />

    <!-- Fund table -->
    <FundTable
      :data-list="fundData.dataList.value"
      :is-edit="settings.isEdit.value"
      :dark-mode="settings.darkMode.value"
      :loading-list="fundData.loadingList.value"
      :show-g-s-z="settings.showGSZ.value"
      :show-amount="settings.showAmount.value"
      :show-gains="settings.showGains.value"
      :show-cost="settings.showCost.value"
      :show-cost-rate="settings.showCostRate.value"
      :badge-content="settings.BadgeContent.value"
      :realtime-fundcode="settings.RealtimeFundcode.value"
      :sort-type="tableSort.sortType.value"
      @fund-detail="() => {}"
      @sort="tableSort.sortList"
      @delete="fundData.deleteFund"
      @select="handleSelectFund"
      @change-num="fundData.updateFundNum"
      @change-cost="fundData.updateFundCost"
    />

    <!-- Appearance controls (edit mode) -->
    <AppearanceControls
      v-show="settings.isEdit.value"
      :dark-mode="settings.darkMode.value"
      :grayscale-value="settings.grayscaleValue.value"
      :opacity-value="settings.opacityValue.value"
      @update:dark-mode="handleDarkModeChange"
      @change-grayscale="settings.setGrayscale"
      @change-opacity="settings.setOpacity"
    />

    <!-- Action bar -->
    <ActionBar
      :is-edit="settings.isEdit.value"
      :is-during="autoRefresh.isDuring.value"
      :is-live-update="settings.isLiveUpdate.value"
      :show-cost="settings.showCost.value"
      :show-gains="settings.showGains.value"
      :all-gains="fundData.allGains.value"
      :all-cost-gains="fundData.allCostGains.value"
      @market="() => {}"
      @toggle-live-update="autoRefresh.toggleLiveUpdate"
      @toggle-edit="settings.isEdit.value = !settings.isEdit.value"
      @settings="router.push('/settings')"
      @changelog="changelogRef?.init()"
      @reward="rewardRef?.init()"
      @refresh="handleRefresh"
    />

    <!-- Dialogs -->
    <Reward ref="rewardRef" />
    <ChangeLog ref="changelogRef" :dark-mode="settings.darkMode.value" @close="storage.set({ version: '3.0.0' })" />
  </div>
</template>
