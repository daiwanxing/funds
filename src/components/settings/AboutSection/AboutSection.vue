<script setup lang="ts">
import { ref } from 'vue'
import { ChangeLog } from '@/components/ChangeLog'
import { Reward } from '@/components/Reward'

defineProps<{
  darkMode: boolean
}>()

const changelogRef = ref<InstanceType<typeof ChangeLog> | null>(null)
const rewardRef = ref<InstanceType<typeof Reward> | null>(null)

const APP_VERSION = '3.0.0'
</script>

<template>
  <div>
    <div class="font-bold leading-8">
      请作者喝杯咖啡
    </div>
    <p class="text-sm leading-8 m-0">
      开源不易，您的支持是对作者最大的鼓励。
      <button
        class="text-sm text-blue-500 border border-blue-500 rounded px-2 py-1 cursor-pointer bg-white"
        @click="rewardRef?.init()"
      >
        点击打赏
      </button>
    </p>
    <p class="text-sm leading-8 m-0">
      帮忙点一个 star →
      <a
        href="https://github.com/x2rr/funds"
        target="_blank"
        class="text-blue-500"
      >GitHub 源代码</a>
    </p>
    <Reward
      ref="rewardRef"
      :top="50"
    />

    <div class="mt-4 font-bold leading-8">
      关于
    </div>
    <p class="text-sm leading-8 m-0">
      当前版本：v{{ APP_VERSION }}
      <button
        class="text-xs border border-gray-300 rounded px-2 py-1 cursor-pointer bg-white ml-2"
        @click="changelogRef?.init()"
      >
        更新日志
      </button>
    </p>
    <p class="text-sm leading-8 m-0">
      电报群：<a
        href="https://t.me/choose_funds_chat"
        target="_blank"
        class="text-blue-500"
      >点击跳转</a>
    </p>
    <ChangeLog
      ref="changelogRef"
      :dark-mode="darkMode"
      :top="20"
    />
  </div>
</template>
