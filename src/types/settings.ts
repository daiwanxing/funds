// ─── 设置领域类型 ────────────────────────────────────────────────

import type { FundListItem } from './fund';

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
  sortTypeObj: { name: string | null; type: string | null };
  RealtimeFundcode: string | null;
  RealtimeIndcode: string | null;
}
