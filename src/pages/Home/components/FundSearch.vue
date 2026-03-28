<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import axios from 'axios';
import { useQuery, keepPreviousData } from '@tanstack/vue-query';
import { AutoComplete, type AutoCompleteOption } from '@/components/AutoComplete';
import { useSettings } from '@/composables/settings';

const props = defineProps<{ query: string }>();

const emit = defineEmits<{
  (e: 'update:query', value: string): void;
  (e: 'add-fund', code: string): void;
}>();

const settings = useSettings();

const localQuery = computed({
  get: () => props.query,
  set: (val: string) => emit('update:query', val)
});

// 构建防抖的查询条件供 vue-query 监测
const debouncedQuery = ref(props.query);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch(localQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = val;
  }, 300);
});

// 使用 tanstack-query 封装底层请求
const { data: searchOptions, isFetching: loading } = useQuery({
  queryKey: ['fundSearch', debouncedQuery],
  queryFn: async () => {
    const kw = debouncedQuery.value.trim();
    if (!kw) return [];
    
    const url = `/api/search/FundSearch/api/FundSearchAPI.ashx?&m=9&key=${encodeURIComponent(kw)}&_=${Date.now()}`;
    const res = await axios.get(url);
    
    const existingCodes = settings.fundListM.value.map(f => f.code);
    return (res.data.Datas ?? [])
      .filter((val: any) => !existingCodes.includes(val.CODE))
      .map((val: any) => {
        // Mocking tag and change strictly for visual alignment with the new design. 
        // Emulating the screenshot's '证券', '医药' tags based on NAME matches.
        let tag = '';
        if (val.NAME.includes('证券') || val.NAME.includes('券商')) tag = '证券';
        else if (val.NAME.includes('医疗') || val.NAME.includes('医药')) tag = '医疗';
        else if (val.NAME.includes('500') || val.NAME.includes('300')) tag = '宽基';
        
        // Construct visual object
        return {
          label: val.NAME,
          value: val.CODE,
          desc: val.CODE,
          tag: tag, // Will render if not empty
          // change: '', // FundSearch API ashx does not expose real-time change. We could leave it out, but the AutoComplete handles it gracefully if absent.
        } as AutoCompleteOption;
      });
  },
  enabled: computed(() => !!debouncedQuery.value.trim()),
  staleTime: 1000 * 60 * 5, // 缓存搜索结果 5 分钟
  placeholderData: keepPreviousData // 保持原有数据直到新数据返回，避免下拉列表高度疯狂闪烁
});

// 当用户确认点选列表中的某一项基金
const handleSelect = (option: AutoCompleteOption) => {
  localQuery.value = '';
  debouncedQuery.value = '';
  emit('add-fund', option.value);
};
</script>

<template>
  <div class="w-full">
    <AutoComplete
      v-model="localQuery"
      :options="searchOptions ?? []"
      :loading="loading"
      placeholder="搜索基金代码或名称"
      empty-text="没有找到该基金，或该基金不可追溯"
      @select="handleSelect"
    />
  </div>
</template>
