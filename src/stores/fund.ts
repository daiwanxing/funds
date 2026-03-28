import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface FundListItem {
  code: string;
  num: number;
  cost?: number;
}

export const useFundStore = defineStore('fund', () => {
  const fundListM = ref<FundListItem[]>([]);
  
  return {
    fundListM
  };
});
