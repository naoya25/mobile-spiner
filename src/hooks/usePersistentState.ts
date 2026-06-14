import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';

const storagePrefix = 'mobile-spiner.';

/**
 * useState backed by localStorage. Reads the stored value on init (falling back to
 * `defaultValue` when missing, unparsable, or rejected by `validate`) and writes on
 * every change. Storage failures (private mode, quota) are ignored so the UI keeps working.
 */
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  validate?: (value: unknown) => value is T
): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = `${storagePrefix}${key}`;

  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw === null) {
        return defaultValue;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (validate && !validate(parsed)) {
        return defaultValue;
      }
      return parsed as T;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Ignore write failures (e.g. Safari private mode quota).
    }
  }, [storageKey, value]);

  return [value, setValue];
}
