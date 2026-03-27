const STORAGE_KEY = "funds_config";

function getAll(): Record<string, any> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export const storage = {
  get(
    keys: string | string[] | null,
    callback: (res: Record<string, any>) => void,
  ): void {
    const all = getAll();
    if (keys === null) {
      callback(all);
      return;
    }
    if (typeof keys === "string") keys = [keys];
    const result: Record<string, any> = {};
    keys.forEach((key) => {
      if (key in all) result[key] = all[key];
    });
    callback(result);
  },

  set(data: Record<string, any>, callback?: () => void): void {
    const all = getAll();
    Object.assign(all, data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    callback?.();
  },
};
