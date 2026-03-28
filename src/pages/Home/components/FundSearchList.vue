<script setup lang="ts">
import { computed } from 'vue';
import { Search, Plus, Check } from 'lucide-vue-next';
import { useSettings } from '@/composables/settings';
import type { SearchFundItem } from '@/composables/fund/useFundSearch';

const props = defineProps<{
  query: string;
  options: SearchFundItem[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'add', code: string): void;
}>();

const settings = useSettings();

const addedKeys = computed(() => {
  return new Set(settings.fundListM.value.map(f => f.code));
});

const highlightText = (text: string, query: string) => {
  if (!query || !text) return text;
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, 'gi');
  return text.replace(regex, '<span class="text-[#3B82F6]">$1</span>');
};

const handleAdd = (code: string) => {
  if (!addedKeys.value.has(code)) {
    emit('add', code);
  }
};
</script>

<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden bg-[#161618]">
    <!-- Status Text -->
    <div class="px-4 py-2 border-y border-white/5 shrink-0 min-h-[76px] box-border">
      <div v-if="loading" class="text-[#3B82F6] text-[11px] font-sans h-[16px] flex items-center">正在查询基金库...</div>
      <div v-else-if="options && options.length > 0" class="flex text-white/40 text-[11px] font-sans h-[16px] items-center">找到 <span class="text-white px-1">{{ options.length }}</span> 个匹配结果 · 点击 + 添加至自选</div>
      <div v-else class="h-[16px]"></div>
      
      <!-- Sub Title -->
      <div class="mt-4 flex items-center gap-1.5 text-white/40 text-[12px] mb-2 font-sans tracking-tight h-[18px]">
        <Search v-if="query" class="w-3.5 h-3.5 opacity-80" />
        <template v-if="query">搜索 <span class="text-[#3B82F6] font-medium tracking-normal">"{{ query }}"</span> 的结果</template>
      </div>
    </div>

    <!-- Scrollable Body -->
    <div class="flex-1 overflow-y-auto">
      <template v-if="loading">
        <!-- SVG Motion Loader: Stock Chart line drawing animation -->
        <div class="p-16 flex flex-col items-center justify-center gap-4 opacity-80 mt-10">
          <svg class="w-12 h-12 text-[#3B82F6] loading-motion" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <!-- Drawn left to right -->
            <polyline class="draw-line" points="2 17 8.5 10.5 13.5 15.5 22 7" />
            <polyline class="draw-arrow" points="16 7 22 7 22 13" />
          </svg>
        </div>
      </template>
      
      <template v-else-if="options.length > 0">
        <!-- Data List -->
        <ul class="pb-10 font-sans">
          <li v-for="item in options" :key="item.value" class="px-4 py-3.5 flex items-start gap-[20px] justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            
            <!-- Left Info -->
            <div class="flex flex-col overflow-hidden pr-2 flex-1">
              <div class="flex items-center gap-2 overflow-hidden mb-1.5">
                <span class="text-white/90 text-[12px] font-medium truncate block">
                  <span v-html="highlightText(item.label, query)"></span>
                </span>
                <span v-if="item.tag" class="shrink-0 px-1.5 py-[1px] rounded text-[10px] bg-[#1a2b4a] text-blue-400 border border-blue-500/20 leading-none">
                  {{ item.tag }}
                </span>
              </div>
              <span class="text-white/40 text-[11px] tracking-tight truncate block">
                <span v-html="highlightText(item.desc || '', query)"></span>
              </span>
            </div>
            
            <!-- Right Action Area -->
            <div class="flex gap-[6px] items-start shrink-0">
              <span class="text-white/80 text-[12px] tracking-tight w-11 pt-0.5 text-right font-mono">0.9820</span>
              <div class="flex flex-col items-end w-20 gap-2">
                <!-- Change text -->
                <span class="text-down font-mono text-[12px] font-semibold bg-down/10 px-1.5 rounded w-fit tracking-tight">-0.51%</span>
                
                <!-- Action Button -->
                <button 
                  v-if="addedKeys.has(item.value)"
                  class="flex items-center justify-center gap-1 w-16 py-1 border border-[#10B981]/30 rounded text-[#10B981] text-[11px] bg-transparent cursor-default"
                >
                  <Check class="w-3 h-3" /> 已添加
                </button>
                <button 
                  v-else
                  @click="handleAdd(item.value)"
                  class="flex items-center justify-center gap-1 w-16 py-1 border border-[#3B82F6]/40 rounded text-[#3B82F6] hover:bg-[#3B82F6]/10 hover:border-[#3B82F6] text-[11px] bg-transparent transition-colors cursor-pointer"
                >
                  <Plus class="w-3 h-3" /> 添加
                </button>
              </div>
            </div>

          </li>
        </ul>
      </template>

      <!-- Empty State for Search -->
      <div v-else-if="!loading" class="pt-16 flex flex-col items-center opacity-30">
        <Search class="w-8 h-8 mb-4 text-white" />
        <span class="text-[12px] font-sans text-white/80">未找到任何匹配项</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-motion {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
}
.draw-line {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: drawLine 1.5s ease-in-out infinite;
}
.draw-arrow {
  opacity: 0;
  animation: showArrow 1.5s ease-in-out infinite;
}

@keyframes drawLine {
  0% { stroke-dashoffset: 100; opacity: 1; }
  40% { stroke-dashoffset: 0; opacity: 1; }
  80% { stroke-dashoffset: 0; opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}

@keyframes showArrow {
  0%, 35% { opacity: 0; transform: translate(-2px, 2px) scale(0.9); }
  45% { opacity: 1; transform: translate(0, 0) scale(1); }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
