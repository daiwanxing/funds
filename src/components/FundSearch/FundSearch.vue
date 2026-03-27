<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps<{
  fundListM: { code: string; num: number }[]
}>()

const emit = defineEmits<{
  save: [codes: string[]]
}>()

const fundcode = ref<string[]>([])
const searchOptions = ref<{ value: string; label: string }[]>([])
const loading = ref(false)

const remoteMethod = (query: string) => {
  if (!query) {
    searchOptions.value = []
    return
  }
  loading.value = true
  const url = '/api/search/FundSearch/api/FundSearchAPI.ashx?&m=9&key=' + query + '&_=' + Date.now()

  axios.get(url).then((res) => {
    searchOptions.value = (res.data.Datas ?? [])
      .filter((val: any) => !props.fundListM.some((f) => f.code === val.CODE))
      .map((val: any) => ({
        value: val.CODE,
        label: val.NAME,
      }))
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

const selectChange = () => {
  searchOptions.value = []
}

const handleSave = () => {
  if (fundcode.value.length > 0) {
    emit('save', [...fundcode.value])
    fundcode.value = []
  }
}
</script>

<template>
  <div class="py-1 flex items-center gap-2 flex-wrap">
    <span class="text-xs whitespace-nowrap">添加新基金:</span>
    <el-select
      v-model="fundcode"
      multiple
      filterable
      remote
      size="small"
      reserve-keyword
      placeholder="请输入基金编码，支持按名称或编码搜索"
      :remote-method="remoteMethod"
      :loading="loading"
      class="flex-1 min-w-250px"
      @visible-change="selectChange"
    >
      <el-option
        v-for="item in searchOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
        <span class="float-left">{{ item.label }}</span>
        <span class="float-right text-gray-400 text-xs pr-2">{{ item.value }}</span>
      </el-option>
    </el-select>
    <button
      class="text-xs border border-gray-300 rounded px-3 py-1.5 cursor-pointer bg-white hover:bg-gray-50"
      @click="handleSave"
    >
      确定
    </button>
  </div>
  <p class="text-xs text-gray-400 m-0 text-center">
    部分新发基金或QDII基金可以搜索到，但可能无法获取估值情况
  </p>
</template>
