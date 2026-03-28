// ─── 设置领域类型 ────────────────────────────────────────────────

import type { FundListItem } from './fund';
import type { FundSortableField } from './fund';
import type { HolidayData } from './holiday';

export type SortDirection = "asc" | "desc" | "none";

export interface SortTypeState {
  name: FundSortableField | null;
  type: SortDirection | null;
}

/** 应用设置状态完整结构 */
export interface SettingsState {
  fundListM: FundListItem[];
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
  sortTypeObj: SortTypeState;
  RealtimeFundcode: string | null;
  RealtimeIndcode: string | null;
}

/** localStorage 中持久化的完整配置结构 */
export interface StorageSchema extends Partial<SettingsState> {
  fundList?: string[];
  holiday?: HolidayData;
  version?: string;
}
