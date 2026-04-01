<script setup lang="ts">
defineProps<{
  isEdit: boolean;
  isDuring: boolean;
  isLiveUpdate: boolean;
  showCost: boolean;
  showGains: boolean;
  allGains: readonly [number, number];
  allCostGains: readonly [number, number];
}>();

defineEmits<{
  market: [];
  toggleLiveUpdate: [];
  toggleEdit: [];
  settings: [];
  changelog: [];
  reward: [];
  refresh: [];
}>();

const fmtNum = (n: number): string => {
  return parseFloat(String(n)).toLocaleString("zh", {
    minimumFractionDigits: 2,
  });
}
</script>

<template>
  <div class="flex flex-wrap gap-1 py-1 items-center">
    <button
      class="btn"
      @click="$emit('market')"
    >
      行情中心
    </button>
    <button
      v-if="isDuring"
      class="btn"
      @click="$emit('toggleLiveUpdate')"
    >
      {{ isLiveUpdate ? "暂停更新" : "实时更新" }}
    </button>
    <button
      v-if="!isDuring"
      class="btn"
    >
      休市中
    </button>
    <button
      class="btn"
      @click="$emit('toggleEdit')"
    >
      {{ isEdit ? "完成编辑" : "编辑" }}
    </button>
    <button
      class="btn"
      @click="$emit('settings')"
    >
      设置
    </button>
    <button
      class="btn"
      @click="$emit('changelog')"
    >
      日志
    </button>
    <button
      class="btn text-blue-500 border-blue-500"
      @click="$emit('reward')"
    >
      打赏
    </button>
  </div>


  <div
    v-if="showCost || showGains"
    class="flex flex-wrap gap-1 py-1"
  >
    <button
      v-if="showGains"
      class="btn text-xs"
      :class="
        allGains[0] >= 0
          ? 'text-red-500 border-red-300'
          : 'text-green-600 border-green-300'
      "
    >
      日收益：{{ fmtNum(allGains[0])
      }}{{ isNaN(allGains[1]) ? "" : `（${allGains[1]}%）` }}
    </button>
    <button
      v-if="showCost"
      class="btn text-xs"
      :class="
        allCostGains[0] >= 0
          ? 'text-red-500 border-red-300'
          : 'text-green-600 border-green-300'
      "
    >
      持有收益：{{ fmtNum(allCostGains[0])
      }}{{ isNaN(allCostGains[1]) ? "" : `（${allCostGains[1]}%）` }}
    </button>
  </div>


  <div
    class="absolute right-2 bottom-2 cursor-pointer"
    @click="$emit('refresh')"
  >
    <span class="text-blue-500 text-lg font-bold i-carbon-renew" />
  </div>
</template>

<style scoped>
.btn {
  display: inline-block;
  line-height: 1;
  cursor: pointer;
  background: #fff;
  padding: 5px 8px;
  border-radius: 3px;
  font-size: 12px;
  color: #000;
  outline: none;
  border: 1px solid #dcdfe6;
}
.btn:hover {
  border-color: #409eff;
  color: #409eff;
}
</style>
