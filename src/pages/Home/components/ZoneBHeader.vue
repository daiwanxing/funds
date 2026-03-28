<script setup lang="ts">
import { computed } from 'vue';
import { BarChart2, Search, X, Plus } from 'lucide-vue-next';

const props = defineProps<{
  query: string;
  isSearching?: boolean;
  savedCount: number;
  resultCount?: number;
}>();

const emit = defineEmits<{
  (e: 'update:query', value: string): void;
}>();

const handleInput = (e: Event) => {
  emit('update:query', (e.target as HTMLInputElement).value);
};

const clearQuery = () => {
  emit('update:query', '');
};
</script>

<template>
  <div class="px-3 pt-3 pb-3 flex flex-col gap-3 shrink-0 bg-[#161618]">
    <!-- Header Title -->
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-2 text-t text-[13px] font-medium transition-colors">
        <BarChart2 class="w-4 h-4 text-accent" />
        <span class="text-white/80 tracking-wide font-sans">{{ query ? '搜索基金库' : '自选持仓' }}</span>
      </div>
      <div>
        <!-- Right Badges -->
        <span v-if="query && resultCount !== undefined" class="px-2 py-0.5 rounded-full bg-white/5 text-[11px] text-white/40">
          {{ resultCount }} 个结果
        </span>
        <span v-else-if="!query" class="px-2 py-0.5 rounded-full bg-white/5 text-[11px] text-white/40">
          {{ savedCount }} 只
        </span>
      </div>
    </div>
    
    <!-- Search Input Box -->
    <div class="relative w-full h-[36px] bg-[#1a1a1c] border border-white/5 rounded-lg flex items-center shadow-inner overflow-hidden focus-within:border-[#3B82F6]/50 transition-colors group">
      <!-- Loading Sun spinner -->
      <div v-if="isSearching" class="w-4 h-4 ml-3 flex items-center justify-center shrink-0 text-[#3B82F6] opacity-80">
         <span class="w-[14px] h-[14px] border-[2px] border-[#3B82F6] border-t-transparent rounded-full animate-spin"></span>
      </div>
      <Search v-else class="w-4 h-4 ml-3 shrink-0 text-white/30 group-focus-within:text-[#3B82F6] transition-colors" />
      
      <input 
        :value="query" 
        @input="handleInput" 
        class="w-full h-full bg-transparent border-none outline-none px-2.5 text-white/80 text-[13px] placeholder:text-white/30 font-sans"
        placeholder="搜索基金名称、代码或公司"
      />
      
      <button 
        v-if="query" 
        @click="clearQuery" 
        class="w-5 h-5 mr-2 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/60 transition-colors cursor-pointer"
      >
        <X class="w-3 h-3" />
      </button>
      <!-- suffix 占位，防止输入框文字贴边 -->
      <div v-else class="w-5 h-5 mr-2"></div>
    </div>
  </div>
</template>
