import type { StorageSchema } from "@/types/settings";

const STORAGE_KEY = "funds_config";

const getAll = (): StorageSchema => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as StorageSchema) : {};
  } catch {
    return {};
  }
};

function get(
  keys: null,
  callback: (res: StorageSchema) => void,
): void;
function get<K extends keyof StorageSchema>(
  keys: K | readonly K[],
  callback: (res: Partial<Pick<StorageSchema, K>>) => void,
): void;
function get<K extends keyof StorageSchema>(
  keys: K | readonly K[] | null,
  callback: ((res: StorageSchema) => void) | ((res: Partial<Pick<StorageSchema, K>>) => void),
): void {
  const all = getAll();
  if (keys === null) {
    (callback as (res: StorageSchema) => void)(all);
    return;
  }

  const normalizedKeys = (typeof keys === "string" ? [keys] : keys) as readonly K[];
  const result = {} as Partial<Pick<StorageSchema, K>>;
  normalizedKeys.forEach((key) => {
    if (key in all) {
      result[key] = all[key] as StorageSchema[K];
    }
  });
  (callback as (res: Partial<Pick<StorageSchema, K>>) => void)(result);
}

const set = <K extends keyof StorageSchema>(
  data: Pick<StorageSchema, K> | Partial<StorageSchema>,
  callback?: () => void,
): void => {
  const all = getAll();
  Object.assign(all, data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  callback?.();
};

export const storage = {
  get,
  set,
};
