<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { storage } from '@/utils/storage'

withDefaults(defineProps<{
  top?: number
}>(), { top: 0 })

const emit = defineEmits<{
  close: []
  success: []
}>()

const visible = ref(false)
const checked = ref<'export' | 'import'>('export')
const exportConfigStr = ref('')
const inputConfigStr = ref('')

const init = () => {
  visible.value = true
  inputConfigStr.value = ''
  storage.get(null, (res: Record<string, any>) => {
    delete res.holiday
    exportConfigStr.value = JSON.stringify(res, null, 2)
  })
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(exportConfigStr.value).then(() => {
    ElMessage.success('已复制到剪贴板！')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const importInput = () => {
  try {
    const config = JSON.parse(inputConfigStr.value)
    if (typeof config === 'object') {
      storage.set(config, () => {
        emit('success')
        ElMessage.success('导入配置成功！')
      })
    }
  } catch {
    ElMessage.error('导入失败，配置文本格式不正确！')
  }
}

const close = () => {
  visible.value = false
  emit('close')
}

defineExpose({ init })
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-1001 bg-black/70 flex items-start justify-center pt-5"
  >
    <div
      class="bg-white rounded-15px w-500px text-center"
      :style="{ marginTop: top + 'px' }"
    >
      <div class="py-3">
        <button
          class="px-5 py-3 text-sm border border-gray-300 cursor-pointer"
          :class="[checked === 'export' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white']"
          style="border-radius: 4px 0 0 4px"
          @click="checked = 'export'"
        >
          导出(JSON文本)
        </button>
        <button
          class="px-5 py-3 text-sm border border-gray-300 border-l-0 cursor-pointer"
          :class="[checked === 'import' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white']"
          style="border-radius: 0 4px 4px 0"
          @click="checked = 'import'"
        >
          导入(JSON文本)
        </button>
      </div>
      <div
        v-if="checked === 'export'"
        class="px-4"
      >
        <el-input
          type="textarea"
          :rows="15"
          v-model="exportConfigStr"
          placeholder="配置内容"
        />
        <button
          class="text-xs border border-green-500 text-green-600 rounded px-3 py-1.5 cursor-pointer bg-white mt-3"
          @click="copyToClipboard"
        >
          复制到剪贴板
        </button>
      </div>
      <div
        v-else
        class="px-4"
      >
        <el-input
          type="textarea"
          :rows="15"
          v-model="inputConfigStr"
          placeholder="请在此输入框粘贴配置文本"
        />
        <button
          class="text-xs border border-green-500 text-green-600 rounded px-3 py-1.5 cursor-pointer bg-white mt-3"
          @click="importInput"
        >
          提交配置文本
        </button>
      </div>
      <div class="py-3">
        <button
          class="text-xs border border-gray-300 rounded px-3 py-1.5 cursor-pointer bg-white"
          @click="close"
        >
          返回
        </button>
      </div>
    </div>
  </div>
</template>
