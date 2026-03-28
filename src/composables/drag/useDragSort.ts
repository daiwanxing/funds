import { ref, type Ref } from "vue";
import { storage } from "@/utils/storage";
import type { StorageSchema } from "@/types/settings";

const handleDragOver = (e: DragEvent): void => {
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
};

export const useDragSort = <T extends Record<string, unknown>, K extends keyof T & string>(
  list: Ref<T[]>,
  syncList?: Ref<T[]>,
  storageKey?: keyof StorageSchema,
  matchKey?: K,
) => {
  const dragging = ref<T | null>(null);

  const handleDragStart = (_e: DragEvent, item: T): void => {
    dragging.value = item;
  };

  const handleDragEnter = (e: DragEvent, item: T): void => {
    if (!dragging.value || !matchKey) return;
    if (item[matchKey] === dragging.value[matchKey]) return;

    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";

    const newItems = [...list.value];
    const srcIdx = newItems.findIndex(
      (n) => n[matchKey] === dragging.value![matchKey],
    );
    const dstIdx = newItems.findIndex((n) => n[matchKey] === item[matchKey]);
    if (srcIdx < 0 || dstIdx < 0) return;

    newItems.splice(dstIdx, 0, ...newItems.splice(srcIdx, 1));
    list.value = newItems;

    // Sync the display list too
    if (syncList) {
      const newSync = [...syncList.value];
      const syncSrc = newSync.findIndex(
        (n) => n[matchKey] === dragging.value![matchKey],
      );
      const syncDst = newSync.findIndex((n) => n[matchKey] === item[matchKey]);
      if (syncSrc >= 0 && syncDst >= 0) {
        newSync.splice(syncDst, 0, ...newSync.splice(syncSrc, 1));
        syncList.value = newSync;
      }
    }
  };

  const handleDragEnd = (): void => {
    dragging.value = null;
    if (storageKey) {
      storage.set({ [storageKey]: list.value } as Partial<StorageSchema>);
    }
  };

  return {
    dragging,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragEnd,
  };
};
