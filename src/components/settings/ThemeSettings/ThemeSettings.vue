<script setup lang="ts">
defineProps<{
  darkMode: boolean
  normalFontSize: boolean
}>()

const emit = defineEmits<{
  'update:darkMode': [val: boolean]
  'update:normalFontSize': [val: boolean]
}>()
</script>

<template>
  <div>
    <div class="font-bold leading-8">主题与页面设置</div>
    <div class="pl-5 leading-9">
      <el-switch
        :model-value="darkMode"
        active-color="#484848"
        inactive-color="#13ce66"
        inactive-text="标准模式"
        active-text="暗色模式"
        @update:model-value="$emit('update:darkMode', $event as boolean)"
      />
    </div>
    <div class="pl-5 leading-9">
      <el-switch
        :model-value="normalFontSize"
        inactive-text="迷你字号"
        active-text="标准字号"
        @update:model-value="$emit('update:normalFontSize', $event as boolean)"
      />
    </div>
  </div>
</template>
