<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const props = withDefaults(defineProps<{
  darkMode?: boolean
  top?: number
}>(), { darkMode: false, top: 0 })

const emit = defineEmits<{ close: [] }>()

const visible = ref(false)
const loading = ref(true)
const netError = ref(false)
const changelog = ref<any>({})

const APP_VERSION = '3.0.0'
const CHANGELOG_URL = 'https://x2rr.github.io/funds/src/common/changeLog.json'

async function init() {
  visible.value = true
  loading.value = true
  netError.value = false

  try {
    const res = await axios.get(CHANGELOG_URL)
    changelog.value = res.data
    loading.value = false
  } catch {
    netError.value = true
    loading.value = false
  }
}

function close() {
  visible.value = false
  emit('close')
}

defineExpose({ init })
</script>

<template>
  <el-dialog
    title="更新日志"
    :model-value="visible"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="460px"
    center
    @update:model-value="visible = $event"
  >
    <div v-if="netError" class="text-center py-8">
      网络不好？
      <el-button type="primary" @click="() => window.open('http://rabt.gitee.io/funds/docs/dist/index.html#/ChangeLog')">
        去官网查看
      </el-button>
    </div>
    <div
      v-show="!netError"
      v-loading="loading"
      :element-loading-background="darkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)'"
      class="h-400px overflow-y-auto"
    >
      <p v-if="changelog.qqGroup" class="text-center m-0 py-0.5">qq交流群：{{ changelog.qqGroup }}</p>
      <p v-if="changelog.tgGroup" class="text-center m-0 py-0.5">
        电报交流群：<a target="_Blank" :href="changelog.tgGroup">点击跳转</a>
      </p>
      <p v-if="changelog.tip" class="text-center m-0 py-0.5">{{ changelog.tip }}</p>
      <div v-if="changelog.htmlTip" v-html="changelog.htmlTip" />
      <ul class="pl-5 my-1">
        <li v-for="el in changelog.list" :key="el.version" class="py-1">
          <h5 class="my-2 text-sm font-bold">
            v{{ el.version }}
            <span v-if="APP_VERSION === el.version" class="text-xs text-red-500 border border-red-500 rounded px-1 ml-1">当前版本</span>
            <span v-if="el.type === 2" class="text-xs text-blue-500 border border-blue-500 rounded px-1 ml-1">重要更新</span>
          </h5>
          <ul class="pl-5">
            <li
              v-for="(item, idx) in el.content"
              :key="idx"
              :class="item.type === 2 ? 'font-bold' : ''"
              class="py-0.5"
            >{{ item.content }}</li>
          </ul>
        </li>
      </ul>
    </div>
    <template #footer>
      <el-button type="primary" @click="close">确 定</el-button>
    </template>
  </el-dialog>
</template>
