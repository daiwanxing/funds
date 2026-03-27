<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  top?: number
}>(), { top: 0 })

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)
const checked = ref<'wepay' | 'alipay'>('wepay')

function init() {
  visible.value = true
}

function close() {
  visible.value = false
  emit('close')
}

defineExpose({ init })
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-1001 bg-black/70 flex items-start justify-center pt-5">
    <div class="bg-white rounded-15px w-326px text-center" :style="{ marginTop: top + 'px' }">
      <div class="py-3">
        <button
          class="px-5 py-3 text-sm border border-gray-300 cursor-pointer"
          :class="[checked === 'wepay' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white']"
          style="border-radius: 4px 0 0 4px"
          @click="checked = 'wepay'"
        >微信</button>
        <button
          class="px-5 py-3 text-sm border border-gray-300 border-l-0 cursor-pointer"
          :class="[checked === 'alipay' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white']"
          style="border-radius: 0 4px 4px 0"
          @click="checked = 'alipay'"
        >支付宝</button>
      </div>
      <div>
        <img
          :src="checked === 'wepay' ? '/icons/qrcode/wepay.png' : '/icons/qrcode/alipay.png'"
          class="w-256px"
        />
      </div>
      <p class="text-xs text-gray-400 px-12 mt-1 leading-relaxed">
        感谢有您的支持，自选基金才能一直保持更新，增加更多功能。
      </p>
      <div class="py-3 flex justify-center gap-2">
        <button class="text-xs border border-green-500 text-green-600 rounded px-2 py-1 cursor-pointer bg-white" @click="close">打赏好了</button>
        <button class="text-xs border border-gray-300 rounded px-2 py-1 cursor-pointer bg-white" @click="close">下次一定</button>
      </div>
    </div>
  </div>
</template>
