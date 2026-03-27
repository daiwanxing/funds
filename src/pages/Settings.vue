<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettings } from '@/composables/settings'
import { useImportExport } from '@/composables/importExport'
import { useHoliday } from '@/composables/holiday'
import { BadgeSettings } from '@/components/settings/BadgeSettings'
import { ThemeSettings } from '@/components/settings/ThemeSettings'
import { ColumnSettings } from '@/components/settings/ColumnSettings'
import { ImportExportSection } from '@/components/settings/ImportExportSection'
import { HolidayInfo } from '@/components/settings/HolidayInfo'
import { AboutSection } from '@/components/settings/AboutSection'
import { ConfigBox } from '@/components/ConfigBox'

const settings = useSettings()
const importExport = useImportExport(settings.fundListM, settings.userId, () => settings.load())
const { holiday, updating, loadFromStorage, fetchHoliday } = useHoliday()

const configBoxRef = ref<InstanceType<typeof ConfigBox> | null>(null)

onMounted(async () => {
  await settings.load()
  loadFromStorage()
})

function handleSettingChange(value: any, key: string) {
  ;(settings as any)[key].value = value
  settings.updateSetting(key, value)
}

function handleDarkModeChange(val: boolean) {
  settings.darkMode.value = val
  settings.toggleDarkMode()
}

function handleFontSizeChange(val: boolean) {
  settings.normalFontSize.value = val
  settings.toggleFontSize()
}

function handleColumnChange(value: boolean, key: string) {
  ;(settings as any)[key].value = value
  settings.updateSetting(key, value)
}
</script>

<template>
  <div
    class="max-w-600px mx-a py-4 text-sm font-sans"
    :class="settings.darkMode.value ? 'bg-dark text-white/60' : ''"
  >
    <ul class="list-none p-2 rounded-lg" :class="settings.darkMode.value ? 'bg-white/11' : ''">
      <li class="border-b border-gray-200 py-2">
        <BadgeSettings
          :show-badge="settings.showBadge.value"
          :badge-content="settings.BadgeContent.value"
          :badge-type="settings.BadgeType.value"
          @change="handleSettingChange"
        />
      </li>
      <li class="border-b border-gray-200 py-2">
        <ThemeSettings
          :dark-mode="settings.darkMode.value"
          :normal-font-size="settings.normalFontSize.value"
          @update:dark-mode="handleDarkModeChange"
          @update:normal-font-size="handleFontSizeChange"
        />
      </li>
      <li class="border-b border-gray-200 py-2">
        <ColumnSettings
          :show-g-s-z="settings.showGSZ.value"
          :show-amount="settings.showAmount.value"
          :show-gains="settings.showGains.value"
          :show-cost="settings.showCost.value"
          :show-cost-rate="settings.showCostRate.value"
          @change="handleColumnChange"
        />
      </li>
      <li class="border-b border-gray-200 py-2">
        <ImportExportSection
          :loading-fund-list="importExport.loadingFundList.value"
          @export-config="importExport.exportConfig"
          @import-config="importExport.importConfig"
          @export-excel="importExport.exportExcel"
          @import-excel="importExport.importExcel"
          @open-config-box="configBoxRef?.init()"
        />
      </li>
      <li class="border-b border-gray-200 py-2">
        <HolidayInfo
          :holiday="holiday"
          :updating="updating"
          @update="fetchHoliday"
        />
      </li>
      <li class="py-2">
        <AboutSection :dark-mode="settings.darkMode.value" />
      </li>
    </ul>

    <ConfigBox ref="configBoxRef" :top="40" @success="settings.load()" />
  </div>
</template>
