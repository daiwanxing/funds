// ─── 节假日领域类型 ──────────────────────────────────────────────

/** 某天的节假日信息 */
export interface HolidayDayData {
  holiday: boolean;
}

/** 某年的节假日数据，key 为 MM-DD 格式的日期字符串 */
export type HolidayYearData = Record<string, HolidayDayData>;

/** 节假日数据结构（来自远程接口，缓存至 storage） */
export interface HolidayData {
  version?: string;
  lastDate?: string;
  data?: Record<string, HolidayYearData>;
}
