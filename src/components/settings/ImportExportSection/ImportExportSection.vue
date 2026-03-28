<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  loadingFundList: boolean
}>()

const emit = defineEmits<{
  exportConfig: []
  importConfig: [file: File]
  exportExcel: []
  importExcel: [file: File]
  openConfigBox: []
}>()

const importConfigRef = ref<HTMLInputElement | null>(null)
const importExcelRef = ref<HTMLInputElement | null>(null)

const handleConfigFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    emit('importConfig', file)
    if (importConfigRef.value) importConfigRef.value.value = ''
  }
}

const handleExcelFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    emit('importExcel', file)
    if (importExcelRef.value) importExcelRef.value.value = ''
  }
}
</script>

<template>
  <div>
    <div class="font-bold leading-8">
      基金配置信息导入与导出
    </div>
    <div class="py-2 flex flex-wrap gap-2">
      <button
        class="btn"
        @click="$emit('exportConfig')"
      >
        导出配置文件
      </button>
      <label class="btn relative overflow-hidden cursor-pointer">
        导入配置文件
        <input
          ref="importConfigRef"
          type="file"
          accept="application/json"
          class="absolute inset-0 opacity-0 cursor-pointer"
          @change="handleConfigFileChange"
        >
      </label>
      <button
        class="btn"
        @click="$emit('openConfigBox')"
      >
        导入导出文本
      </button>
    </div>
    <div class="py-2 flex flex-wrap gap-2">
      <button
        class="btn"
        :disabled="loadingFundList"
        @click="$emit('exportExcel')"
      >
        导出基金列表Excel
      </button>
      <label class="btn relative overflow-hidden cursor-pointer">
        导入基金列表Excel
        <input
          ref="importExcelRef"
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          class="absolute inset-0 opacity-0 cursor-pointer"
          @change="handleExcelFileChange"
        >
      </label>
    </div>
    <p class="text-sm text-gray-400 m-0">
      tips：同步小程序数据可以选择导入导出文本，Excel导入时不用填写基金名称。
    </p>
  </div>
</template>

<style scoped>
.btn {
  display: inline-block;
  line-height: 1;
  cursor: pointer;
  background: #fff;
  padding: 6px 8px;
  border-radius: 3px;
  font-size: 14px;
  color: #000;
  outline: none;
  border: 1px solid #dcdfe6;
}
.btn:hover { border-color: #409eff; color: #409eff; }
.btn[disabled] { color: #aaa; cursor: not-allowed; }
</style>
