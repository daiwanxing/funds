import { ref, onUnmounted, type Ref } from 'vue'
import { isDuringDate } from '@/utils/marketStatus'
import { storage } from '@/utils/storage'

export function useAutoRefresh(
  onRefreshIndex: () => void,
  onRefreshFund: () => void,
  isEdit: Ref<boolean>,
  isLiveUpdate: Ref<boolean>,
) {
  const isDuring = ref(false)
  let indexTimer: ReturnType<typeof setInterval> | null = null
  let fundTimer: ReturnType<typeof setInterval> | null = null

  function checkAndStart(isFirstLoad = false): void {
    isDuring.value = isDuringDate()

    clearTimers()

    if (isLiveUpdate.value && isDuring.value && !isEdit.value) {
      if (!isFirstLoad) {
        onRefreshIndex()
        onRefreshFund()
      }
      indexTimer = setInterval(onRefreshIndex, 5_000)
      fundTimer = setInterval(onRefreshFund, 60_000)
    }
  }

  function toggleLiveUpdate(): void {
    isLiveUpdate.value = !isLiveUpdate.value
    storage.set({ isLiveUpdate: isLiveUpdate.value })
    checkAndStart()
  }

  function clearTimers(): void {
    if (indexTimer) clearInterval(indexTimer)
    if (fundTimer) clearInterval(fundTimer)
    indexTimer = null
    fundTimer = null
  }

  onUnmounted(clearTimers)

  return {
    isDuring,
    checkAndStart,
    toggleLiveUpdate,
    clearTimers,
  }
}
