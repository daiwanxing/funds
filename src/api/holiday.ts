import axios from "axios";
import type { HolidayData } from "@/types/holiday";

export const fetchLocalHoliday = async (): Promise<HolidayData> => {
  const { data } = await axios.get<HolidayData>("/holiday.json");
  return data;
};

export const fetchRemoteHoliday = async (): Promise<HolidayData> => {
  const { data } = await axios.get<HolidayData>(
    "https://x2rr.github.io/funds/holiday.json",
  );
  return data;
};
