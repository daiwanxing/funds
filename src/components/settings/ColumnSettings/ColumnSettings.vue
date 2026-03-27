<script setup lang="ts">
defineProps<{
  showGSZ: boolean
  showAmount: boolean
  showGains: boolean
  showCost: boolean
  showCostRate: boolean
}>()

const emit = defineEmits<{
  change: [value: boolean, key: string]
}>()
</script>

<template>
  <div>
    <div class="font-bold leading-8">基金列表展示内容设置</div>
    <div class="pl-5 leading-9 flex items-center gap-2">
      <span class="w-120px text-right">显示估算净值</span>
      <el-switch :model-value="showGSZ" @update:model-value="$emit('change', $event as boolean, 'showGSZ')" />
    </div>
    <div class="pl-5 leading-9 flex items-center gap-2">
      <span class="w-120px text-right">显示持有金额</span>
      <el-switch :model-value="showAmount" @update:model-value="$emit('change', $event as boolean, 'showAmount')" />
    </div>
    <div class="pl-5 leading-9 flex items-center gap-2">
      <span class="w-120px text-right">显示估值收益</span>
      <el-switch :model-value="showGains" @update:model-value="$emit('change', $event as boolean, 'showGains')" />
    </div>
    <div class="pl-5 leading-9 flex items-center gap-2">
      <span class="w-120px text-right">显示持有收益</span>
      <el-switch :model-value="showCost" @update:model-value="$emit('change', $event as boolean, 'showCost')" />
    </div>
    <div class="pl-5 leading-9 flex items-center gap-2">
      <span class="w-120px text-right">显示持有收益率</span>
      <el-switch :model-value="showCostRate" @update:model-value="$emit('change', $event as boolean, 'showCostRate')" />
    </div>
    <p class="text-sm text-gray-400 m-0">
      tips：在编辑设置里，输入持有份额可计算当日估值收益。输入持仓成本可计算累计持有收益。
    </p>
  </div>
</template>
