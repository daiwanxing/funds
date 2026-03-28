import { ref } from "vue";
import axios from "axios";
import { storage } from "@/utils/storage";
import { setHolidayData } from "@/utils/marketStatus";
import type { HolidayData } from "@/types/holiday";

export const useHoliday = () => {
  const holiday = ref<HolidayData | null>(null);
  const updating = ref(false);

  const loadFromStorage = (): void => {
    storage.get(["holiday"], (res) => {
      if (res.holiday) {
        holiday.value = res.holiday;
        setHolidayData(res.holiday);
      } else {
        fetchHoliday();
      }
    });
  };

  const fetchHoliday = async (): Promise<void> => {
    updating.value = true;
    try {
      const res = await axios.get<HolidayData>(
        "https://x2rr.github.io/funds/holiday.json",
      );
      holiday.value = res.data;
      setHolidayData(res.data);
      storage.set({ holiday: res.data });
    } finally {
      updating.value = false;
    }
  };

  return {
    holiday,
    updating,
    loadFromStorage,
    fetchHoliday,
  };
};
