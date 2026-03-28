<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { Search, Loader2, Plus, X, ArrowUp, ArrowDown } from 'lucide-vue-next';
import { animate } from 'motion';

export interface AutoCompleteOption {
  label: string;
  value: string;
  desc?: string;
  tag?: string;
  change?: string;
  isUp?: boolean;
}

const props = defineProps<{
  modelValue: string;
  options: AutoCompleteOption[];
  loading?: boolean;
  placeholder?: string;
  emptyText?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'select', option: AutoCompleteOption): void;
}>();

const isOpen = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const activeIndex = ref(-1);

const handleClickOutside = (e: MouseEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside));

const onInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  emit('update:modelValue', val);
};

// Listen to modelValue changes: open dropdown when there's text
watch(() => props.modelValue, (newVal) => {
  if (newVal.trim().length > 0) {
    isOpen.value = true;
  } else {
    isOpen.value = false;
  }
});

// Reset highlight and animate height when options change
watch(() => props.options, async () => {
  activeIndex.value = props.options.length > 0 ? 0 : -1;
  if (!ulRef.value) return;
  const oldHeight = ulRef.value.offsetHeight;
  await nextTick();
  const newHeight = ulRef.value.offsetHeight;
  if (oldHeight > 0 && newHeight > 0 && oldHeight !== newHeight) {
    animate(ulRef.value, { height: [`${oldHeight}px`, `${newHeight}px`] }, { duration: 0.2, ease: 'easeOut' }).then(() => {
      if (ulRef.value) ulRef.value.style.height = 'auto';
    });
  }
});

const onKeydown = (e: KeyboardEvent) => {
  if (!isOpen.value || !props.options.length) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIndex.value = activeIndex.value < props.options.length - 1 ? activeIndex.value + 1 : 0;
    scrollToActive();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : props.options.length - 1;
    scrollToActive();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (activeIndex.value >= 0 && activeIndex.value < props.options.length) {
      onSelect(props.options[activeIndex.value]);
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false;
  }
};

const ulRef = ref<HTMLElement | null>(null);
const scrollToActive = () => {
  nextTick(() => {
    if (!ulRef.value) return;
    const activeEl = ulRef.value.children[activeIndex.value] as HTMLElement;
    if (!activeEl) return;
    const ulRect = ulRef.value.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    
    if (activeRect.bottom > ulRect.bottom) {
      ulRef.value.scrollTop += (activeRect.bottom - ulRect.bottom) + 8;
    } else if (activeRect.top < ulRect.top) {
      ulRef.value.scrollTop -= (ulRect.top - activeRect.top) + 8;
    }
  });
};

const onSelect = (option: AutoCompleteOption) => {
  isOpen.value = false;
  emit('select', option);
};

const handleContainerClick = () => {
  inputRef.value?.focus();
};

const clearInput = () => {
  emit('update:modelValue', '');
  inputRef.value?.focus();
};

const highlightText = (text: string, query: string) => {
  if (!query || !text) return text;
  // highlight digits or matching chars
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, 'gi');
  return text.replace(regex, '<span class="text-accent">$1</span>');
};
</script>

<template>
  <div ref="wrapperRef" class="relative w-full z-10 transition-all">
    <!-- 搜索框容器 -->
    <div 
      class="relative flex items-center w-full h-8 rounded bg-[#101011] border border-white/6 overflow-hidden transition-all duration-300 ease-in-out focus-within:bg-[#151516] focus-within:border-accent focus-within:shadow-[0_0_0_1px_rgba(47,129,247,0.4)] cursor-text" 
      @click="handleContainerClick"
    >
      <Search 
        class="w-3.5 h-3.5 ml-3 shrink-0 transition-colors duration-300"
        :class="modelValue ? 'text-accent opacity-100' : 'text-t opacity-40'"
      />
      <input
        ref="inputRef"
        type="text"
        class="w-full h-full bg-transparent border-none outline-none px-2.5 text-t text-[14px] placeholder:text-t/30 font-medium"
        :placeholder="placeholder"
        :value="modelValue"
        @input="onInput"
        @keydown="onKeydown"
        @focus="modelValue && (isOpen = true)"
      />
      <!-- Loading 及清除按钮 -->
      <div class="pr-2.5 flex items-center shrink-0">
        <Loader2 v-if="loading" class="w-3.5 h-3.5 text-t opacity-70 animate-spin" />
        <button 
          v-else-if="modelValue"
          @click.stop="clearInput"
          class="w-3.5 h-3.5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer text-white/60"
        >
          <X class="w-2.5 h-2.5" />
        </button>
      </div>
    </div>

    <!-- 联想结果下拉面板 (slideInUp) -->
    <Transition
      enter-active-class="transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)"
      enter-from-class="transform translate-y-3 opacity-0 scale-[0.98]"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-2 opacity-0 scale-[0.98]"
    >
      <div
        v-show="isOpen && (options.length > 0 || (modelValue && !loading))"
        class="absolute top-10 left-0 right-0 bg-[#1c1c1e] border border-white/10 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden z-50 transform origin-top"
      >
        <ul ref="ulRef" class="max-h-[360px] min-h-[60px] overflow-y-auto font-mono py-1 scroll-smooth">
          <!-- 无数据占位 -->
          <li v-if="options.length === 0 && !loading" class="px-4 py-8 flex flex-col items-center justify-center h-[120px]">
            <Search class="w-5 h-5 opacity-30 text-white mb-2" />
            <span class="text-white/40 text-[13px] tracking-wide">{{ emptyText || '未找到相关基金' }}</span>
          </li>
          
          <!-- 正常选项 -->
          <li
            v-for="(item, index) in options"
            :key="item.value"
            class="flex items-center justify-between px-[12px] py-[10px] cursor-pointer transition-colors border-b border-white/5 last:border-none"
            :class="{ 'bg-white/5': activeIndex === index }"
            @click="onSelect(item)"
            @mouseover="activeIndex = index"
          >
            <!-- 左侧名字与代码 -->
            <div class="flex flex-col gap-1 overflow-hidden flex-1 mr-4">
              <div class="flex items-center gap-2 overflow-hidden">
                <span class="text-white text-[14px] font-sans font-normal truncate hover:text-accent transition-colors block">
                  <span v-html="highlightText(item.label, modelValue)"></span>
                </span>
                <!-- Tag 标签 -->
                <span v-if="item.tag" class="shrink-0 px-1.5 py-0.5 rounded text-[10px] bg-[#1a2b4a] text-blue-400 font-sans border border-blue-500/20">
                  {{ item.tag }}
                </span>
              </div>
              <span class="text-white/40 text-[12px] font-mono font-medium">
                <span v-html="highlightText(item.desc || '', modelValue)"></span>
              </span>
            </div>
            
            <!-- 右侧涨幅与添加按钮 -->
            <div class="flex items-center gap-4 shrink-0">
              <span v-if="item.change" class="text-sm font-semibold" :class="item.isUp ? 'text-up' : 'text-down'">
                {{ item.change }}
              </span>
              <button 
                class="w-6 h-6 rounded-full bg-transparent border border-white/20 flex items-center justify-center shrink-0"
              >
                <Plus class="w-3 h-3 text-white/50" :stroke-width="1.5" />
              </button>
            </div>
          </li>
        </ul>

        <!-- 底部 Footer -->
        <div v-if="options.length > 0" class="px-4 py-2.5 border-t border-white/5 bg-[#151516] flex items-center justify-between text-[11px] text-white/30 font-sans">
          <span>找到 {{ options.length }} 个结果</span>
          <span class="flex items-center gap-1 opacity-80">
            <span class="flex items-center bg-white/5 px-1 rounded gap-0.5"><ArrowUp class="w-2.5 h-2.5" /><ArrowDown class="w-2.5 h-2.5" /></span> 导航 · Enter 添加
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 优雅的极细滚动条 */
ul::-webkit-scrollbar {
  width: 4px;
}
ul::-webkit-scrollbar-track {
  background: transparent;
}
ul::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
ul:hover::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
