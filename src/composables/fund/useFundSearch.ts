import { ref, computed, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import axios from 'axios';

export interface SearchFundItem {
  label: string;
  value: string;
  desc?: string;
  tag?: string;
  change?: string;
  isUp?: boolean;
}

export const useFundSearch = (queryRef: any) => {
  const debouncedQuery = ref('');
  let timeoutId: number | null = null;
  
  watch(queryRef, (val) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      debouncedQuery.value = val;
    }, 300);
  }, { immediate: true });

  const { data: searchOptions, isFetching, error } = useQuery({
    queryKey: ['fundSearch', debouncedQuery],
    queryFn: async () => {
      const kw = debouncedQuery.value.trim();
      if (!kw) return [];
      
      const url = `/api/search/FundSearch/api/FundSearchAPI.ashx?&m=9&key=${encodeURIComponent(kw)}&_=${Date.now()}`;
      const res = await axios.get(url);
      
      // 不再过滤 existingCodes，因为用户希望能够在列表中看到 "已添加" 状态
      return (res.data.Datas ?? [])
        .map((val: any) => {
          let tag = '';
          if (val.NAME.includes('证券') || val.NAME.includes('券商')) tag = '证券';
          else if (val.NAME.includes('医疗') || val.NAME.includes('医药')) tag = '医疗';
          else if (val.NAME.includes('500') || val.NAME.includes('300')) tag = '指数型';
          else if (val.NAME.includes('混合')) tag = '混合型';
          else if (val.NAME.includes('全球')) tag = '混合型';
          else tag = '混合型'; // Default template match screenshot
          
          return {
            label: val.NAME,
            value: val.CODE,
            // Fallback sizes based on layout
            desc: `${val.CODE} · ${val.NAME.substring(0,2)}基金 · 规模约 5亿`,
            tag: tag,
          } as SearchFundItem;
        });
    },
    enabled: computed(() => !!debouncedQuery.value.trim()),
    staleTime: 1000 * 60 * 5
  });

  const isActuallyLoading = computed(() => {
    return isFetching.value || (!!queryRef.value.trim() && queryRef.value !== debouncedQuery.value);
  });

  return { searchOptions, loading: isActuallyLoading, error };
}
