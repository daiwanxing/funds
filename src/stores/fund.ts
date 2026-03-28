import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FundListItem } from '@/types/fund';

export type { FundListItem };

export const useFundStore = defineStore('fund', () => {
  const fundListM = ref<FundListItem[]>([]);
  
  return {
    fundListM
  };
});
