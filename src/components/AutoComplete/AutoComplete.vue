<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Search, Loader2 } from 'lucide-vue-next';

export interface AutoCompleteOption {
  label: string;
  value: string;
  desc?: string;
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

const onSelect = (option: AutoCompleteOption) => {
  isOpen.value = false;
  emit('select', option);
};

const handleContainerClick = () => {
  inputRef.value?.focus();
};
</script>

<template>
  <div ref="wrapperRef" class="relative w-full z-10">
    <!-- 搜索框容器 -->
    <div class="relative flex items-center w-full h-10 rounded-lg bg-bg-1 border border-white/6 overflow-hidden transition-all duration-300 ease-in-out focus-within:bg-bg-3 focus-within:border-white/20 focus-within:shadow-[0_0_15px_rgba(255,255,255,0.05)] focus-within:scale-[1.01] hover:bg-bg-2 cursor-text" @click="handleContainerClick">
      <Search class="w-4 h-4 ml-3 opacity-60 text-t shrink-0 transition-opacity focus-within:opacity-100" />
      <input
        ref="inputRef"
        type="text"
        class="w-full h-full bg-transparent border-none outline-none px-3 text-t text-sm placeholder:text-t/40"
        :placeholder="placeholder"
        :value="modelValue"
        @input="onInput"
        @focus="modelValue && (isOpen = true)"
      />
      <!-- Loading 动画 -->
      <div v-if="loading" class="pr-3 flex items-center">
        <Loader2 class="w-4 h-4 text-t opacity-70 animate-spin" />
      </div>
    </div>

    <!-- 联想结果下拉面板 -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <ul
        v-if="isOpen && (options.length > 0 || (modelValue && !loading))"
        class="absolute top-12 left-0 right-0 max-h-[300px] overflow-y-auto bg-bg-2 border border-white/6 rounded-lg shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-2 backdrop-blur-xl z-50 will-change-transform font-mono"
      >
        <!-- 无数据占位 -->
        <li v-if="options.length === 0 && !loading" class="px-4 py-8 text-center text-t text-sm opacity-60">
          {{ emptyText || '未找到结果' }}
        </li>
        
        <!-- 正常选项 -->
        <li
          v-for="item in options"
          :key="item.value"
          class="flex items-center justify-between px-4 py-2 hover:bg-white/6 cursor-pointer transition-colors group"
          @click="onSelect(item)"
        >
          <span class="text-p text-sm group-hover:text-accent transition-colors">{{ item.label }}</span>
          <span v-if="item.desc" class="text-xs text-s opacity-60 font-medium">{{ item.desc }}</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
/* 自定义滚动条样式，使其隐藏或暗黑模式适配 */
ul::-webkit-scrollbar {
  width: 6px;
}
ul::-webkit-scrollbar-track {
  background: transparent;
}
ul::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>
