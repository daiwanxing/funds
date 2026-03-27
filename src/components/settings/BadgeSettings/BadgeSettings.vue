<script setup lang="ts">
defineProps<{
  showBadge: number
  badgeContent: number
  badgeType: number
}>()

const emit = defineEmits<{
  change: [value: any, key: string]
}>()
</script>

<template>
  <div>
    <div class="font-bold leading-8">角标展示设置</div>
    <div class="pl-5 leading-9">
      角标开关：
      <el-radio-group :model-value="showBadge" @update:model-value="$emit('change', $event, 'showBadge')">
        <el-radio border :value="1">打开角标</el-radio>
        <el-radio border :value="2">关闭角标</el-radio>
      </el-radio-group>
    </div>
    <div v-if="showBadge === 1" class="pl-5 leading-9">
      角标内容：
      <el-radio-group :model-value="badgeContent" @update:model-value="$emit('change', $event, 'BadgeContent')">
        <el-radio border :value="1">单个基金</el-radio>
        <el-radio border :value="2">所有基金</el-radio>
        <el-radio border :value="3">单个指数</el-radio>
      </el-radio-group>
    </div>
    <div v-if="showBadge === 1 && badgeContent !== 3" class="pl-5 leading-9">
      角标类型：
      <el-radio-group :model-value="badgeType" @update:model-value="$emit('change', $event, 'BadgeType')">
        <el-radio border :value="1">日收益率</el-radio>
        <el-radio border :value="2">日收益额</el-radio>
      </el-radio-group>
    </div>
    <p class="text-sm text-gray-400 m-0 mt-1">
      tips：若选择单个基金，请打开编辑按钮中的特别关注选项；若要计算收益额，需要先打开显示持有金额开关，在编辑中填写基金对应的持有额。
    </p>
  </div>
</template>
