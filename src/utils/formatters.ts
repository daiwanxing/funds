export const formatNum = (val: number | string): string => {
  const num = typeof val === "string" ? parseFloat(val) : val;
  const absNum = Math.abs(num);

  if (absNum < 10) return num.toFixed(2);
  if (absNum < 100) return num.toFixed(1);
  if (absNum < 1000) return num.toFixed(0);
  if (absNum < 10000) return (num / 1000).toFixed(1) + "k";
  if (absNum < 1000000) return (num / 1000).toFixed(0) + "k";
  if (absNum < 10000000) return (num / 1000000).toFixed(1) + "M";
  return (num / 1000000).toFixed(0) + "M";
};

export const formatQuoteTime = (value: string | null | undefined): string => {
  if (!value) return "--";

  const normalizedValue = value.trim();
  if (!normalizedValue) return "--";

  const dateTimeMatch = normalizedValue.match(
    /^\d{4}-\d{2}-\d{2}\s+(\d{2}:\d{2})(?::\d{2})?$/,
  );
  if (dateTimeMatch) {
    return dateTimeMatch[1];
  }

  const dateMatch = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    return `${dateMatch[2]}-${dateMatch[3]}`;
  }

  return normalizedValue;
};

export const getGuid = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
