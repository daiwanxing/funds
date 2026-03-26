import { ref } from 'vue'
import axios from 'axios'
import { storage } from '@/utils/storage'
import { setHolidayData } from '@/utils/marketStatus'

interface HolidayInfo {
  version?: string
  lastDate?: string
  data?: Record<string, any>
}

export function useHoliday() {
  const holiday = ref<HolidayInfo | null>(null)
  const updating = ref(false)

  function loadFromStorage(): void {
    storage.get(['holiday'], (res: Record<string, any>) => {
      if (res.holiday) {
        holiday.value = res.holiday
        setHolidayData(res.holiday)
      } else {
        fetchHoliday()
      }
    })
  }

  async function fetchHoliday(): Promise<void> {
    updating.value = true
    try {
      const res = await axios.get<HolidayInfo>('https://x2rr.github.io/funds/holiday.json')
      holiday.value = res.data
      setHolidayData(res.data)
      storage.set({ holiday: res.data })
    } finally {
      updating.value = false
    }
  }

  return {
    holiday,
    updating,
    loadFromStorage,
    fetchHoliday,
  }
}
