// ─── 偏好领域类型 ────────────────────────────────────────────────

import type { FundSortableField } from "./fund";
import type { HolidayData } from "./holiday";

export type SortDirection = "asc" | "desc" | "none";

export interface SortPreferenceState {
  name: FundSortableField | null;
  type: SortDirection | null;
}

/** 应用偏好状态完整结构 */
export interface PreferencesState {
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
  sortTypeObj: SortPreferenceState;
  RealtimeFundcode: string | null;
  RealtimeIndcode: string | null;
}

export interface PersistedPreferences {
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
  sortTypeObj: SortPreferenceState;
  RealtimeFundcode: string | null;
  RealtimeIndcode: string | null;
}

/** localStorage 中持久化的完整偏好结构 */
export interface PreferencesStorageSchema extends Partial<PersistedPreferences> {
  holiday?: HolidayData;
  version?: string;
}
