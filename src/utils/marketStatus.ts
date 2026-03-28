import type { HolidayData } from "@/types/holiday";

let holidayData: HolidayData | null = null;

export const setHolidayData = (data: HolidayData): void => {
  holidayData = data;
};

export const checkHoliday = (date: Date): boolean => {
  if (!holidayData?.data) return false;

  const nowYear = date.getFullYear().toString();
  let nowMonth = (date.getMonth() + 1).toString();
  let strDate = date.getDate().toString();

  if (nowMonth.length < 2) nowMonth = "0" + nowMonth;
  if (strDate.length < 2) strDate = "0" + strDate;

  const nowDate = nowMonth + "-" + strDate;
  const yearData = holidayData.data[nowYear];
  if (!yearData) return false;

  return yearData[nowDate]?.holiday ?? false;
};

export const isDuringDate = (): boolean => {
  // 时区转换为东8区
  const zoneOffset = 8;
  const offset8 = new Date().getTimezoneOffset() * 60 * 1000;
  const nowDate8 = new Date().getTime();
  const curDate = new Date(nowDate8 + offset8 + zoneOffset * 60 * 60 * 1000);

  if (checkHoliday(curDate)) return false;

  const day = curDate.getDay();
  if (day === 0 || day === 6) return false;

  const beginDateAM = new Date(curDate);
  const endDateAM = new Date(curDate);
  const beginDatePM = new Date(curDate);
  const endDatePM = new Date(curDate);

  beginDateAM.setHours(9, 30, 0, 0);
  endDateAM.setHours(11, 35, 0, 0);
  beginDatePM.setHours(13, 0, 0, 0);
  endDatePM.setHours(15, 5, 0, 0);

  if (curDate >= beginDateAM && curDate <= endDateAM) return true;
  if (curDate >= beginDatePM && curDate <= endDatePM) return true;

  return false;
};
