import { ref, computed, watch, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import axios from 'axios';
import { resolveFundQuote } from './quote';
import type {
  SearchFundItem,
  FundQuoteApiResponse,
  FundSearchApiResponse,
  FundSearchResponseItem,
} from '@/types/fund';

// re-export so existing `import { SearchFundItem } from '@/composables/fund/useFundSearch'` 不报错
export type { SearchFundItem };

export const useFundSearch = (queryRef: Ref<string>) => {
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
      
      const searchUrl = `/api/search/FundSearch/api/FundSearchAPI.ashx?&m=9&key=${encodeURIComponent(kw)}&_=${Date.now()}`;
      const [searchRes] = await Promise.all([
        axios.get<FundSearchApiResponse>(searchUrl),
        new Promise(r => setTimeout(r, 1800)) // 保底 1800ms，确保 2.8s 的动画完整画满第一段折线
      ]);
      
      const searchDatas = searchRes.data.Datas ?? [];
      if (searchDatas.length === 0) return [];

      // 批量查询估值行情（最多取前 20 条避免 URL 过长）
      const codes = searchDatas.slice(0, 20).map((item) => item.CODE).join(',');
      const quoteMap = new Map<string, { gsz: string; gszzl: number }>();
      try {
        const quoteRes = await axios.get<FundQuoteApiResponse>(
          `/api/fund/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=20&plat=Android&appType=ttjj&product=EFund&Version=1&deviceid=search&Fcodes=${codes}`
        );
        for (const item of (quoteRes.data.Datas ?? [])) {
          const quote = resolveFundQuote(item);
          quoteMap.set(item.FCODE, {
            gsz: quote.gsz !== null ? String(quote.gsz) : '--',
            gszzl: quote.gszzl,
          });
        }
      } catch {
        // 行情查询失败时降级展示，不影响搜索结果
      }

      return searchDatas.map((item: FundSearchResponseItem) => {
        let tag: string;
        if (item.NAME.includes('证券') || item.NAME.includes('券商')) tag = '证券';
        else if (item.NAME.includes('医疗') || item.NAME.includes('医药')) tag = '医疗';
        else if (item.NAME.includes('500') || item.NAME.includes('300')) tag = '指数型';
        else if (item.NAME.includes('债券') || item.NAME.includes('纯债')) tag = '债券型';
        else if (item.NAME.includes('混合')) tag = '混合型';
        else if (item.NAME.includes('货币') || item.NAME.includes('现金')) tag = '货币型';
        else tag = '股票型';

        const quote = quoteMap.get(item.CODE);
        return {
          label: item.NAME,
          value: item.CODE,
          desc: `${item.CODE} · ${item.CATEGORY ?? tag}`,
          tag,
          gsz: quote?.gsz,
          gszzl: quote?.gszzl,
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
