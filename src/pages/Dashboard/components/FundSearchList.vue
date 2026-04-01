<script setup lang="ts">
import { computed } from 'vue';
import { Search, Plus, Check } from 'lucide-vue-next';
import type { SearchFundItem } from '@/composables/fund/useFundSearch';

const props = defineProps<{
  query: string;
  options: SearchFundItem[];
  loading: boolean;
  addedCodes: string[];
}>();

const emit = defineEmits<{
  (e: 'add', code: string): void;
}>();

const addedKeys = computed(() => {
  return new Set(props.addedCodes);
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
    <div
      v-if="!loading && options && options.length > 0"
      class="px-4 border-y border-white/5 shrink-0 h-[30px] flex items-center box-border overflow-hidden"
    >
      <div class="flex text-white/40 text-[11px] font-sans">
        找到 <span class="text-white px-1">{{ options.length }}</span> 个匹配结果 · 点击 + 添加至自选
      </div>
    </div>


    <div class="flex-1 overflow-y-auto relative">
      <template v-if="loading">
        <div class="absolute inset-0 flex flex-col items-center justify-center -mt-10">
          <svg
            width="240"
            height="80"
            viewBox="0 0 240 80"
            class="overflow-visible"
          >
            <defs>
              <filter
                id="glowBlur"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur
                  stdDeviation="1.5"
                  result="blur"
                />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter
                id="outerGlowBlur"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur
                  stdDeviation="3.5"
                  result="blur"
                />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient
                id="areaGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stop-color="#3B82F6"
                  stop-opacity="0.15"
                />
                <stop
                  offset="100%"
                  stop-color="#3B82F6"
                  stop-opacity="0"
                />
              </linearGradient>
            </defs>


            <path
              d="M 0 60 C 15 45 25 65 40 55 C 55 45 65 30 80 40 C 95 50 110 65 130 45 C 150 25 165 15 185 25 C 205 35 220 10 240 15 L 240 80 L 0 80 Z" 
              fill="url(#areaGradient)"
            />

            <path
              d="M 0 60 C 15 45 25 65 40 55 C 55 45 65 30 80 40 C 95 50 110 65 130 45 C 150 25 165 15 185 25 C 205 35 220 10 240 15" 
              fill="none"
              class="text-white/[0.04]"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- The Drawing Path: 强制 pathLength 使得进度计算与偏移完全 1:1 -->
            <path
              id="searchLineDataPath"
              d="M 0 60 C 15 45 25 65 40 55 C 55 45 65 30 80 40 C 95 50 110 65 130 45 C 150 25 165 15 185 25 C 205 35 220 10 240 15" 
              fill="none"
              class="text-[#3B82F6]/60"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round" 
              pathLength="100"
              stroke-dasharray="100"
              stroke-dashoffset="100"
            >
              <animate
                attributeName="stroke-dashoffset" 
                values="100; 0; 0; 100" 
                keyTimes="0; 0.62; 0.80; 1" 
                keySplines="0.42 0 0.28 1; 0.42 0 0.28 1; 0.42 0 0.28 1" 
                calcMode="spline" 
                dur="2.8s" 
                repeatCount="indefinite"
              />
            </path>



            <circle
              r="9"
              fill="#3B82F6"
              opacity="0.18"
              filter="url(#outerGlowBlur)"
            >
              <animateMotion
                dur="2.8s"
                repeatCount="indefinite"
                keyPoints="0; 1; 1; 0"
                keyTimes="0; 0.62; 0.80; 1"
                keySplines="0.42 0 0.28 1; 0.42 0 0.28 1; 0.42 0 0.28 1"
                calcMode="spline"
              >
                <mpath href="#searchLineDataPath" />
              </animateMotion>
            </circle>


            <circle
              r="4"
              fill="#60A5FA"
              opacity="0.6"
              filter="url(#glowBlur)"
            >
              <animateMotion
                dur="2.8s"
                repeatCount="indefinite"
                keyPoints="0; 1; 1; 0"
                keyTimes="0; 0.62; 0.80; 1"
                keySplines="0.42 0 0.28 1; 0.42 0 0.28 1; 0.42 0 0.28 1"
                calcMode="spline"
              >
                <mpath href="#searchLineDataPath" />
              </animateMotion>
            </circle>


            <circle
              r="2"
              fill="#FFFFFF"
              opacity="0.92"
            >
              <animateMotion
                dur="2.8s"
                repeatCount="indefinite"
                keyPoints="0; 1; 1; 0"
                keyTimes="0; 0.62; 0.80; 1"
                keySplines="0.42 0 0.28 1; 0.42 0 0.28 1; 0.42 0 0.28 1"
                calcMode="spline"
              >
                <mpath href="#searchLineDataPath" />
              </animateMotion>
            </circle>
          </svg>
          
          <div class="mt-8 flex flex-col items-center justify-center gap-[6px] font-sans">
            <span class="text-white/70 text-[13px] tracking-wide font-medium">正在检索基金数据库</span>
            <span class="text-white/30 text-[11px] tracking-wide">共收录 10,000+ 只基金 · 实时行情数据</span>
          </div>
        </div>
      </template>
      
      <template v-else-if="options.length > 0">
        <ul class="pb-10 font-sans">
          <li
            v-for="item in options"
            :key="item.value"
            class="px-4 py-3.5 flex items-start gap-[20px] justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors"
          >
            <div class="flex flex-col overflow-hidden pr-2 flex-1">
              <div class="flex items-center gap-2 overflow-hidden mb-1.5">
                <span class="text-white/90 text-[12px] font-medium truncate block">
                  <span v-html="highlightText(item.label, query)" />
                </span>
                <span
                  v-if="item.tag"
                  class="shrink-0 px-1.5 py-[1px] rounded text-[10px] bg-[#1a2b4a] text-blue-400 border border-blue-500/20 leading-none"
                >
                  {{ item.tag }}
                </span>
              </div>
              <span class="text-white/40 text-[11px] tracking-tight truncate block">
                <span v-html="highlightText(item.desc || '', query)" />
              </span>
            </div>
            

            <div class="flex gap-[6px] items-start shrink-0">
              <span class="text-white/80 text-[12px] tracking-tight w-11 pt-0.5 text-right font-mono">
                {{ item.gsz ?? '--' }}
              </span>
              <div class="flex flex-col items-end w-20 gap-2">
                <template v-if="item.gszzl !== undefined">
                  <span
                    class="font-mono text-[12px] font-semibold px-1.5 rounded w-fit tracking-tight"
                    :class="item.gszzl >= 0 ? 'text-up bg-up/10' : 'text-down bg-down/10'"
                  >
                    {{ item.gszzl >= 0 ? '+' : '' }}{{ item.gszzl.toFixed(2) }}%
                  </span>
                </template>
                <span
                  v-else
                  class="text-white/30 font-mono text-[12px] px-1.5"
                >--</span>


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


      <div
        v-else-if="!loading"
        class="pt-16 flex flex-col items-center opacity-30"
      >
        <Search class="w-8 h-8 mb-4 text-white" />
        <span class="text-[12px] font-sans text-white/80">未找到任何匹配项</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 纯原生 SVG 控制，不再需要外部 CSS Keyframes */
</style>
