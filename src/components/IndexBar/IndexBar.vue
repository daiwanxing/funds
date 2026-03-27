<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'

import type { IndexItem, SeciOption } from "@/types";

const props = defineProps<{
  indFundData: IndexItem[]
  isEdit: boolean
  loadingInd: boolean
  darkMode: boolean
  seciList: string[]
  allSeciList: SeciOption[]
  badgeContent: number
  realtimeIndcode: string | null
}>()

const emit = defineEmits<{
  deleteIndex: [index: number]
  addIndex: [code: string]
  selectIndex: [item: IndexItem]
  indDetail: [item: IndexItem]
  dragStart: [e: DragEvent, item: IndexItem]
  dragOver: [e: DragEvent, item: IndexItem]
  dragEnter: [e: DragEvent, item: IndexItem, index: number]
  dragEnd: [e: DragEvent, item: IndexItem]
}>()

const showAddInput = ref(false)
const sltSeci = ref('')

const userSeciList = computed(() =>
  props.allSeciList.filter((v) => !props.seciList.includes(v.value)),
)

function saveSeci() {
  emit('addIndex', sltSeci.value)
  sltSeci.value = ''
  showAddInput.value = false
}
</script>

<template>
  <div
    v-if="seciList.length > 0 || isEdit"
    v-loading="loadingInd"
    :element-loading-background="darkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)'"
    class="flex flex-wrap gap-1 min-h-55px"
  >
    <div
      v-for="(el, index) in indFundData"
      :key="el.f12"
      :draggable="isEdit"
      class="px-2 py-1 cursor-pointer text-center min-w-80px"
      :class="isEdit ? 'cursor-move' : ''"
      @click.stop="!isEdit && $emit('indDetail', el)"
      @dragstart="$emit('dragStart', $event, el)"
      @dragover.prevent="$emit('dragOver', $event, el)"
      @dragenter="$emit('dragEnter', $event, el, index)"
      @dragend="$emit('dragEnd', $event, el)"
    >
      <h5 class="text-xs font-bold m-0 whitespace-nowrap">
        {{ el.f14 }}
        <span
          v-if="isEdit"
          class="text-red-500 cursor-pointer ml-1"
          @click.stop="$emit('deleteIndex', index)"
        >✖</span>
      </h5>
      <p :class="el.f3 >= 0 ? 'text-red-500' : 'text-green-600'" class="m-0 font-bold text-xs">
        {{ el.f2 }}
        <input
          v-if="isEdit && badgeContent === 3"
          class="ml-1 cursor-pointer text-xs border border-gray-300 rounded px-1"
          :class="el.f13 + '.' + el.f12 === realtimeIndcode ? 'bg-blue-100' : ''"
          type="button"
          value="✔"
          @click.stop="$emit('selectIndex', el)"
        />
      </p>
      <p :class="el.f3 >= 0 ? 'text-red-500' : 'text-green-600'" class="m-0 text-xs">
        {{ el.f4 }}&nbsp;&nbsp;{{ el.f3 }}%
      </p>
    </div>

    <div v-if="isEdit && indFundData.length < 4" class="px-2 py-1 min-w-80px">
      <div v-if="!showAddInput" class="cursor-pointer text-blue-500 text-xs" @click="showAddInput = true">
        添加
      </div>
      <div v-else>
        <el-select v-model="sltSeci" size="small" placeholder="请选择" class="w-110px">
          <el-option v-for="item in userSeciList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <div class="mt-1">
          <button class="text-xs border border-gray-300 rounded px-2 py-1 mr-1 cursor-pointer" @click="showAddInput = false">取消</button>
          <button class="text-xs border border-gray-300 rounded px-2 py-1 cursor-pointer" @click="saveSeci">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>
