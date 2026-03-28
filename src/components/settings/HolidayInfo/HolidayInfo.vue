<script setup lang="ts">
import type { HolidayData } from "@/types";

defineProps<{
  holiday: HolidayData | null
  updating: boolean
}>()

defineEmits<{
  update: []
}>()
</script>

<template>
  <div>
    <div class="font-bold leading-8">
      节假日信息
      <button
        class="text-xs border border-gray-300 rounded px-2 py-1 cursor-pointer bg-white ml-2"
        :disabled="updating"
        @click="$emit('update')"
      >
        更新
      </button>
      <span
        v-if="updating"
        class="text-xs text-gray-400 ml-2"
      >更新中...</span>
    </div>
    <p
      class="text-sm text-gray-400 m-0"
      v-if="holiday"
    >
      当前节假日版本：v{{ holiday.version }}&nbsp;&nbsp;&nbsp;&nbsp;最后节假日日期：{{ holiday.lastDate }}
    </p>
    <p class="text-sm text-gray-400 m-0">
      tips：更新节假日信息，可以在节假日暂停更新估值。
      <a
        href="https://x2rr.github.io/funds/holiday.json"
        target="_blank"
      >查看最新版</a>
    </p>
  </div>
</template>
