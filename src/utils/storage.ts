import type { PreferencesStorageSchema } from "@/types/preferences";

const STORAGE_KEY = "funds_config";

const getAll = (): PreferencesStorageSchema => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as PreferencesStorageSchema) : {};
  } catch {
    return {};
  }
};

function get(
  keys: null,
  callback: (res: PreferencesStorageSchema) => void,
): void;
function get<K extends keyof PreferencesStorageSchema>(
  keys: K | readonly K[],
  callback: (res: Partial<Pick<PreferencesStorageSchema, K>>) => void,
): void;
function get<K extends keyof PreferencesStorageSchema>(
  keys: K | readonly K[] | null,
  callback:
    | ((res: PreferencesStorageSchema) => void)
    | ((res: Partial<Pick<PreferencesStorageSchema, K>>) => void),
): void {
  const all = getAll();
  if (keys === null) {
    (callback as (res: PreferencesStorageSchema) => void)(all);
    return;
  }

  const normalizedKeys = (typeof keys === "string" ? [keys] : keys) as readonly K[];
  const result = {} as Partial<Pick<PreferencesStorageSchema, K>>;
  normalizedKeys.forEach((key) => {
    if (key in all) {
      result[key] = all[key] as PreferencesStorageSchema[K];
    }
  });
  (callback as (res: Partial<Pick<PreferencesStorageSchema, K>>) => void)(result);
}

const set = <K extends keyof PreferencesStorageSchema>(
  data: Pick<PreferencesStorageSchema, K> | Partial<PreferencesStorageSchema>,
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
