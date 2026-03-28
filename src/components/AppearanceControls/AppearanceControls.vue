<script setup lang="ts">
defineProps<{
  darkMode: boolean
  grayscaleValue: number
  opacityValue: number
}>()

defineEmits<{
  'update:darkMode': [val: boolean]
  changeGrayscale: [val: number]
  changeOpacity: [val: number]
}>()

const formatTooltip = (val: number): string => {
  return val + '%'
}
</script>

<template>
  <div class="flex items-center gap-3 flex-wrap py-2">
    <el-switch
      :model-value="darkMode"
      active-color="#484848"
      inactive-color="#13ce66"
      inactive-text="标准模式"
      active-text="暗色模式"
      @update:model-value="$emit('update:darkMode', $event as boolean)"
    />
    <span class="text-xs whitespace-nowrap">界面灰度：</span>
    <el-slider
      :model-value="grayscaleValue"
      class="w-100px"
      :format-tooltip="formatTooltip"
      @update:model-value="$emit('changeGrayscale', $event as number)"
    />
    <span class="text-xs whitespace-nowrap">透明度：</span>
    <el-slider
      :model-value="opacityValue"
      :max="90"
      class="w-100px"
      :format-tooltip="formatTooltip"
      @update:model-value="$emit('changeOpacity', $event as number)"
    />
  </div>
</template>
