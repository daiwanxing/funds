export function formatNum(val: number | string): string {
  const num = typeof val === "string" ? parseFloat(val) : val;
  const absNum = Math.abs(num);

  if (absNum < 10) return num.toFixed(2);
  if (absNum < 100) return num.toFixed(1);
  if (absNum < 1000) return num.toFixed(0);
  if (absNum < 10000) return (num / 1000).toFixed(1) + "k";
  if (absNum < 1000000) return (num / 1000).toFixed(0) + "k";
  if (absNum < 10000000) return (num / 1000000).toFixed(1) + "M";
  return (num / 1000000).toFixed(0) + "M";
}

export function getGuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
