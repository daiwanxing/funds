import { ref, computed } from "vue";
import { storage } from "@/utils/storage";
import { getGuid } from "@/utils/formatters";

export interface SettingsState {
  fundListM: { code: string; num: number; cost?: number }[];
  seciList: string[];
  darkMode: boolean;
  normalFontSize: boolean;
  isLiveUpdate: boolean;
  showAmount: boolean;
  showGains: boolean;
  showCost: boolean;
  showCostRate: boolean;
  showGSZ: boolean;
  showBadge: number;
  BadgeContent: number;
  BadgeType: number;
  userId: string;
  grayscaleValue: number;
  opacityValue: number;
  sortTypeObj: { name: string | null; type: string | null };
  RealtimeFundcode: string | null;
  RealtimeIndcode: string | null;
}

const SETTINGS_KEYS = [
  "RealtimeFundcode",
  "RealtimeIndcode",
  "fundListM",
  "showAmount",
  "showGains",
  "fundList",
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

export function useSettings() {
  const isEdit = ref(false);
  const isReady = ref(false);

  const fundListM = ref<SettingsState["fundListM"]>([]);
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
  const sortTypeObj = ref<SettingsState["sortTypeObj"]>({
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

  function load(): Promise<void> {
    return new Promise((resolve) => {
      storage.get(
        SETTINGS_KEYS as unknown as string[],
        (res: Record<string, any>) => {
          const defaultFundList = ["001618"];

          if (res.fundListM) {
            fundListM.value = res.fundListM;
          } else {
            const fundList = res.fundList ?? defaultFundList;
            fundListM.value = fundList.map((code: string) => ({
              code,
              num: 0,
            }));
            storage.set({ fundListM: fundListM.value });
          }

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
        },
      );
    });
  }

  function updateSetting(key: string, value: any): void {
    storage.set({ [key]: value });
  }

  function toggleDarkMode(): void {
    updateSetting("darkMode", darkMode.value);
  }

  function toggleFontSize(): void {
    updateSetting("normalFontSize", normalFontSize.value);
  }

  function setGrayscale(val: number): void {
    grayscaleValue.value = val;
    updateSetting("grayscaleValue", val);
  }

  function setOpacity(val: number): void {
    opacityValue.value = val;
    updateSetting("opacityValue", val);
  }

  return {
    // State
    isEdit,
    isReady,
    fundListM,
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
    // Computed
    grayscaleStyle,
    opacityStyle,
    // Methods
    load,
    updateSetting,
    toggleDarkMode,
    toggleFontSize,
    setGrayscale,
    setOpacity,
  };
}
