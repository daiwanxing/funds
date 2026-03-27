<script setup lang="ts">
import type { FundItem } from "@/types";

defineProps<{
  dataList: FundItem[];
  isEdit: boolean;
  darkMode: boolean;
  loadingList: boolean;
  showGSZ: boolean;
  showAmount: boolean;
  showGains: boolean;
  showCost: boolean;
  showCostRate: boolean;
  badgeContent: number;
  realtimeFundcode: string | null;
  sortType: Record<string, string>;
}>();

const emit = defineEmits<{
  fundDetail: [item: FundItem];
  sort: [type: string];
  delete: [id: string];
  select: [id: string];
  changeNum: [item: FundItem];
  changeCost: [item: FundItem];
  dragStart: [e: DragEvent, item: FundItem];
  dragOver: [e: DragEvent, item: FundItem];
  dragEnter: [e: DragEvent, item: FundItem, index: number];
  dragEnd: [e: DragEvent, item: FundItem];
}>();

function fmtLocale(n: number | string): string {
  return parseFloat(String(n)).toLocaleString("zh", {
    minimumFractionDigits: 2,
  });
}
</script>

<template>
  <div
    v-loading="loadingList"
    :element-loading-background="
      darkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)'
    "
    class="max-h-425px overflow-y-auto min-h-160px"
  >
    <table class="w-full border-collapse text-right text-xs">
      <thead>
        <tr>
          <th class="text-left p-2">基金名称（{{ dataList.length }}）</th>
          <th v-if="isEdit">基金代码</th>
          <th v-if="showGSZ && !isEdit">估算净值</th>
          <th v-if="isEdit && (showCostRate || showCost)" class="text-center">
            成本价
          </th>
          <th
            v-if="showAmount"
            class="cursor-pointer"
            @click="$emit('sort', 'amount')"
          >
            持有额
            <span class="text-xs" :class="sortType.amount">{{
              sortType.amount === "desc"
                ? "↓"
                : sortType.amount === "asc"
                  ? "↑"
                  : ""
            }}</span>
          </th>
          <th
            v-if="showCost"
            class="cursor-pointer"
            @click="$emit('sort', 'costGains')"
          >
            持有收益
            <span class="text-xs" :class="sortType.costGains">{{
              sortType.costGains === "desc"
                ? "↓"
                : sortType.costGains === "asc"
                  ? "↑"
                  : ""
            }}</span>
          </th>
          <th
            v-if="showCostRate"
            class="cursor-pointer"
            @click="$emit('sort', 'costGainsRate')"
          >
            持有收益率
            <span class="text-xs">{{
              sortType.costGainsRate === "desc"
                ? "↓"
                : sortType.costGainsRate === "asc"
                  ? "↑"
                  : ""
            }}</span>
          </th>
          <th class="cursor-pointer" @click="$emit('sort', 'gszzl')">
            涨跌幅
            <span class="text-xs">{{
              sortType.gszzl === "desc"
                ? "↓"
                : sortType.gszzl === "asc"
                  ? "↑"
                  : ""
            }}</span>
          </th>
          <th
            v-if="showGains"
            class="cursor-pointer"
            @click="$emit('sort', 'gains')"
          >
            估算收益
            <span class="text-xs">{{
              sortType.gains === "desc"
                ? "↓"
                : sortType.gains === "asc"
                  ? "↑"
                  : ""
            }}</span>
          </th>
          <th v-if="!isEdit">更新时间</th>
          <th
            v-if="
              isEdit && (showAmount || showGains || showCost || showCostRate)
            "
            class="text-center"
          >
            持有份额
          </th>
          <th v-if="isEdit && badgeContent === 1">特别关注</th>
          <th v-if="isEdit">删除</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(el, index) in dataList"
          :key="el.fundcode"
          :draggable="isEdit"
          :class="isEdit ? 'cursor-move' : ''"
          class="hover:bg-blue-50/50"
          @dragstart="$emit('dragStart', $event, el)"
          @dragover.prevent="$emit('dragOver', $event, el)"
          @dragenter="$emit('dragEnter', $event, el, index)"
          @dragend="$emit('dragEnd', $event, el)"
        >
          <td
            class="text-left p-1.5"
            :class="isEdit ? '' : 'cursor-pointer hover:text-blue-500'"
            :title="el.name"
            @click.stop="!isEdit && $emit('fundDetail', el)"
          >
            <span
              v-if="el.hasReplace"
              class="inline-block px-0.5 mr-0.5 rounded-sm text-blue-500 border border-blue-500 text-xs leading-3"
              >✔</span
            >{{ el.name }}
          </td>
          <td v-if="isEdit">{{ el.fundcode }}</td>
          <td v-if="showGSZ && !isEdit">{{ el.gsz }}</td>
          <td v-if="isEdit && (showCostRate || showCost)">
            <input
              class="border border-gray-300 rounded px-1 py-0.5 text-xs w-70px text-center"
              placeholder="持仓成本价"
              :value="el.cost"
              type="text"
              @input="
                el.cost = Number(($event.target as HTMLInputElement).value);
                $emit('changeCost', el);
              "
            />
          </td>
          <td v-if="showAmount">{{ fmtLocale(el.amount) }}</td>
          <td
            v-if="showCost"
            :class="
              el.costGains >= 0
                ? 'text-red-500 font-bold'
                : 'text-green-600 font-bold'
            "
          >
            {{ fmtLocale(el.costGains) }}
          </td>
          <td
            v-if="showCostRate"
            :class="
              el.costGainsRate >= 0
                ? 'text-red-500 font-bold'
                : 'text-green-600 font-bold'
            "
          >
            {{ el.cost > 0 ? el.costGainsRate + "%" : "" }}
          </td>
          <td
            :class="
              el.gszzl >= 0
                ? 'text-red-500 font-bold'
                : 'text-green-600 font-bold'
            "
          >
            {{ el.gszzl }}%
          </td>
          <td
            v-if="showGains"
            :class="
              el.gains >= 0
                ? 'text-red-500 font-bold'
                : 'text-green-600 font-bold'
            "
          >
            {{ fmtLocale(el.gains) }}
          </td>
          <td v-if="!isEdit" class="text-xs text-gray-400">
            {{
              el.hasReplace
                ? el.gztime?.substring(5, 10)
                : el.gztime?.substring(10)
            }}
          </td>
          <td
            v-if="
              isEdit && (showAmount || showGains || showCost || showCostRate)
            "
            class="text-center"
          >
            <input
              class="border border-gray-300 rounded px-1 py-0.5 text-xs w-70px text-center"
              placeholder="输入持有份额"
              :value="el.num"
              type="text"
              @input="
                el.num = Number(($event.target as HTMLInputElement).value);
                $emit('changeNum', el);
              "
            />
          </td>
          <td v-if="isEdit && badgeContent === 1">
            <button
              class="text-xs border rounded px-1 cursor-pointer"
              :class="
                el.fundcode === realtimeFundcode
                  ? 'bg-blue-100 border-blue-400'
                  : 'border-gray-300'
              "
              @click="$emit('select', el.fundcode)"
            >
              ✔
            </button>
          </td>
          <td v-if="isEdit">
            <button
              class="text-xs text-red-500 border border-red-300 rounded px-1 cursor-pointer"
              @click="$emit('delete', el.fundcode)"
            >
              ✖
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table th {
  padding: 8px 6px;
  white-space: nowrap;
}
table td {
  padding: 6px;
}
</style>
