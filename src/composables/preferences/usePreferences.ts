import { ref, computed } from "vue";
import { storage } from "@/utils/storage";
import { getGuid } from "@/utils/formatters";
import type {
  PreferencesState,
  PreferencesStorageSchema,
} from "@/types/preferences";

export type { PreferencesState };

const PREFERENCE_KEYS = [
  "RealtimeFundcode",
  "RealtimeIndcode",
  "showAmount",
  "showGains",
  "seciList",
  "darkMode",
  "normalFontSize",
  "isLiveUpdate",
  "showCost",
  "showCostRate",
  "showGSZ",
  "version",
  "showBadge",
  "BadgeContent",
  "BadgeType",
  "userId",
  "grayscaleValue",
  "opacityValue",
  "sortTypeObj",
  "holiday",
] as const;

const isEdit = ref(false);
const isReady = ref(false);
const seciList = ref(["1.000001", "1.000300", "0.399001", "0.399006"]);
const darkMode = ref(false);
const normalFontSize = ref(false);
const isLiveUpdate = ref(false);
const showAmount = ref(false);
const showGains = ref(false);
const showCost = ref(false);
const showCostRate = ref(false);
const showGSZ = ref(false);
const showBadge = ref(1);
const BadgeContent = ref(1);
const BadgeType = ref(1);
const userId = ref("");
const grayscaleValue = ref(0);
const opacityValue = ref(0);
const sortTypeObj = ref<PreferencesState["sortTypeObj"]>({
  name: null,
  type: null,
});
const RealtimeFundcode = ref<string | null>(null);
const RealtimeIndcode = ref<string | null>(null);

const grayscaleStyle = computed(() => ({
  filter: `grayscale(${grayscaleValue.value / 100})`,
}));

const opacityStyle = computed(() => ({
  opacity: 1 - opacityValue.value / 100,
}));

let loadPromise: Promise<void> | null = null;

const load = (): Promise<void> => {
  if (isReady.value) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const nextLoadPromise = new Promise<void>((resolve) => {
    storage.get(PREFERENCE_KEYS, (res) => {
      if (res.userId) {
        userId.value = res.userId;
      } else {
        userId.value = getGuid();
        storage.set({ userId: userId.value });
      }

      darkMode.value = res.darkMode ?? false;
      normalFontSize.value = res.normalFontSize ?? false;
      seciList.value = res.seciList ?? seciList.value;
      showAmount.value = res.showAmount ?? false;
      showGains.value = res.showGains ?? false;
      isLiveUpdate.value = res.isLiveUpdate ?? false;
      showCost.value = res.showCost ?? false;
      showCostRate.value = res.showCostRate ?? false;
      showGSZ.value = res.showGSZ ?? false;
      showBadge.value = res.showBadge ?? 1;
      BadgeContent.value = res.BadgeContent ?? 1;
      BadgeType.value = res.BadgeType ?? 1;
      grayscaleValue.value = res.grayscaleValue ?? 0;
      opacityValue.value = res.opacityValue ?? 0;
      sortTypeObj.value = res.sortTypeObj ?? { name: null, type: null };
      RealtimeFundcode.value = res.RealtimeFundcode ?? null;
      RealtimeIndcode.value = res.RealtimeIndcode ?? null;

      isReady.value = true;
      resolve();
    });
  }).finally(() => {
    loadPromise = null;
  });

  loadPromise = nextLoadPromise;

  return nextLoadPromise;
};

const updatePreference = <K extends keyof PreferencesStorageSchema>(
  key: K,
  value: PreferencesStorageSchema[K],
): void => {
  storage.set({ [key]: value });
};

const toggleDarkMode = (): void => {
  updatePreference("darkMode", darkMode.value);
};

const toggleFontSize = (): void => {
  updatePreference("normalFontSize", normalFontSize.value);
};

const setGrayscale = (val: number): void => {
  grayscaleValue.value = val;
  updatePreference("grayscaleValue", val);
};

const setOpacity = (val: number): void => {
  opacityValue.value = val;
  updatePreference("opacityValue", val);
};

export const usePreferences = () => {
  return {
    isEdit,
    isReady,
    seciList,
    darkMode,
    normalFontSize,
    isLiveUpdate,
    showAmount,
    showGains,
    showCost,
    showCostRate,
    showGSZ,
    showBadge,
    BadgeContent,
    BadgeType,
    userId,
    grayscaleValue,
    opacityValue,
    sortTypeObj,
    RealtimeFundcode,
    RealtimeIndcode,
    grayscaleStyle,
    opacityStyle,
    load,
    updatePreference,
    toggleDarkMode,
    toggleFontSize,
    setGrayscale,
    setOpacity,
  };
};
