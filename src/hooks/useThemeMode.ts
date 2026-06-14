import { useEffect, useState } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

const storageKey = 'mobile-spiner.theme';

function readStoredTheme(): ThemeMode {
  const stored = window.localStorage.getItem(storageKey);
  if (stored === 'system' || stored === 'light' || stored === 'dark') {
    return stored;
  }
  return 'system';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'system') {
    return mode;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => readStoredTheme());

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      document.documentElement.dataset.theme = resolveTheme(themeMode);
    };

    applyTheme();
    window.localStorage.setItem(storageKey, themeMode);
    media.addEventListener('change', applyTheme);

    return () => {
      media.removeEventListener('change', applyTheme);
    };
  }, [themeMode]);

  return { themeMode, setThemeMode };
}
