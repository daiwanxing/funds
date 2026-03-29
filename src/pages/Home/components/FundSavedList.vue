<script setup lang="ts">
import type { FundItem } from "@/types/fund";
import { BarChart2, Info } from 'lucide-vue-next';

defineProps<{
  items: FundItem[];
  loading: boolean;
  activeCode?: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', code: string): void;
}>();
</script>

<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden bg-[#161618]">
    <!-- Normal List Header -->
    <div class="px-4 py-2 border-b border-y border-white/5 bg-[#141415] flex items-center justify-between text-[11px] text-white/40 sticky top-0 z-10 shrink-0 font-sans tracking-wide">
      <div class="flex-1">
        基金名称
      </div>
      <div class="flex items-center gap-[6px] shrink-0">
        <span class="w-11 text-right">估值</span>
        <span class="w-14 text-right">涨跌幅</span>
        <span class="w-[52px] text-right">今日收益</span>
      </div>
    </div>

    <!-- Body -->
    <ul
      v-if="items.length > 0"
      class="flex-1 overflow-y-auto pb-10"
    >
      <li 
        v-for="item in items" 
        :key="item.fundcode"
        @click="emit('select', item.fundcode)"
        class="relative px-4 py-3 flex items-start gap-[20px] justify-between border-b border-white/[0.04] cursor-pointer"
        :class="item.fundcode === activeCode ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'"
      >
        <!-- Blue active indicator -->
        <div
          v-if="item.fundcode === activeCode"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[14px] bg-[#3B82F6] rounded-r shadow-[0_0_8px_rgba(59,130,246,0.6)]"
        />

        <!-- Left Names -->
        <div class="flex-1 flex flex-col gap-1 overflow-hidden">
          <span class="text-[12px] text-white/90 font-medium truncate font-sans tracking-wide">{{ item.name }}</span>
          <span class="text-[11px] text-white/30 font-sans tracking-tight">{{ item.fundcode }} · {{ Number(item.num) > 0 ? item.num + '份' : '0份' }}</span>
        </div>
        
        <!-- Right Columns -->
        <div class="flex items-start gap-[6px] shrink-0 font-mono tracking-tight pt-0.5">
          <!-- Valuation -->
          <span class="w-11 text-right text-white/90 text-[12px]">{{ item.gsz != null ? item.gsz : '--' }}</span>
           
          <!-- Change Badge -->
          <span class="w-14 flex justify-end">
            <span
              class="px-1.5 py-[1px] rounded text-[11px] font-semibold tracking-tighter shadow-sm"
              :class="Number(item.gszzl) >= 0 ? 'bg-up/10 text-up' : 'bg-down/10 text-down'"
            >
              {{ Number(item.gszzl) > 0 ? '+' : '' }}{{ item.gszzl || '0.00' }}%
            </span>
          </span>
           
          <!-- Today's Earnings -->
          <span
            class="w-[52px] text-right text-[12px] font-bold"
            :class="item.gains > 0 ? 'text-up' : item.gains < 0 ? 'text-down' : 'text-white/30'"
          >
            {{ item.gains > 0 ? '+¥' + item.gains.toFixed(2) : item.gains < 0 ? '-¥' + Math.abs(item.gains).toFixed(2) : '¥0' }}
          </span>
        </div>
      </li>
    </ul>

    <!-- Empty State -->
    <div
      v-else-if="loading"
      class="flex-1 px-4 py-4 flex flex-col gap-3 overflow-hidden"
    >
      <div class="pt-12 pb-6 flex flex-col items-center justify-center gap-2 font-sans">
        <div class="flex items-center gap-2 text-[#7fb0ff] text-[13px] tracking-wide">
          <span class="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
          <span>正在同步自选持仓</span>
        </div>
        <p class="text-[11px] text-white/35 tracking-wide">
          正在拉取最新估值与收益数据
        </p>
      </div>

      <div
        v-for="index in 4"
        :key="index"
        class="px-1 py-3 border-b border-white/[0.04] flex items-start justify-between gap-5 animate-pulse"
      >
        <div class="flex-1 flex flex-col gap-2">
          <div class="h-3.5 w-34 rounded bg-white/[0.06]" />
          <div class="h-3 w-24 rounded bg-white/[0.04]" />
        </div>
        <div class="flex items-start gap-[6px] shrink-0 pt-0.5">
          <div class="h-4 w-11 rounded bg-white/[0.06]" />
          <div class="h-4 w-14 rounded bg-white/[0.06]" />
          <div class="h-4 w-[52px] rounded bg-white/[0.06]" />
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex-1 flex flex-col items-center justify-center pb-20"
    >
      <div class="relative w-14 h-14 rounded-2xl border border-white/5 flex items-center justify-center mb-4">
        <BarChart2
          class="w-6 h-6 text-white/20"
          :stroke-width="2"
        />
      </div>
      <p class="text-[14px] font-medium text-white/50 mb-2 font-sans tracking-wide">
        自选列表为空
      </p>
      <p class="text-[12px] text-white/30 text-center mx-6 leading-relaxed font-sans mb-6">
        通过上方搜索框<br>添加基金至自选
      </p>
      
      <div class="w-8 h-[1px] bg-white/5 mb-6" />
      
      <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#3B82F6]/20 hover:bg-[#3B82F6]/5 transition-colors cursor-default">
        <Info
          class="w-3.5 h-3.5 text-[#3B82F6]"
          :stroke-width="2"
        />
        <span class="text-[12px] text-[#3B82F6] font-sans tracking-wide">支持基金名称、代码</span>
      </div>
    </div>
  </div>
</template>
