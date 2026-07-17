import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  DiffViewMode,
  GlobalSettingsValues,
  ThemePreference
} from '../ui/types';

export const DEFAULT_SETTINGS: GlobalSettingsValues = {
  theme: 'system',
  editor: '',
  autoFetchInterval: 5,
  diffViewMode: 'unified',
  confirmDestructiveOps: true
};

const STORAGE_KEY = 'git-pawl.global-settings';
const STORAGE_VERSION = 1;

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'dark' || value === 'light' || value === 'system';

const isDiffViewMode = (value: unknown): value is DiffViewMode =>
  value === 'unified' || value === 'split';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const sanitizeInterval = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_SETTINGS.autoFetchInterval;
  }
  const rounded = Math.round(value);
  if (rounded < 1) return 1;
  if (rounded > 1440) return 1440;
  return rounded;
};

const sanitizeSettings = (
  raw: unknown,
  fallback: GlobalSettingsValues
): GlobalSettingsValues => {
  if (!isObject(raw)) return fallback;
  return {
    theme: isThemePreference(raw.theme) ? raw.theme : fallback.theme,
    editor: typeof raw.editor === 'string' ? raw.editor : fallback.editor,
    autoFetchInterval: sanitizeInterval(raw.autoFetchInterval),
    diffViewMode: isDiffViewMode(raw.diffViewMode)
      ? raw.diffViewMode
      : fallback.diffViewMode,
    confirmDestructiveOps:
      typeof raw.confirmDestructiveOps === 'boolean'
        ? raw.confirmDestructiveOps
        : fallback.confirmDestructiveOps
  };
};

const readSettings = (): GlobalSettingsValues => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as {
      version?: number;
      values?: unknown;
    };
    return sanitizeSettings(parsed.values, DEFAULT_SETTINGS);
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const writeSettings = (values: GlobalSettingsValues): void => {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify({
      version: STORAGE_VERSION,
      values
    });
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    return;
  }
};

export type UseGlobalSettingsResult = {
  values: GlobalSettingsValues;
  setValues: (next: GlobalSettingsValues) => void;
  resetToDefaults: () => void;
};

export const useGlobalSettings = (): UseGlobalSettingsResult => {
  const [values, setValuesState] = useState<GlobalSettingsValues>(() =>
    readSettings()
  );

  useEffect(() => {
    writeSettings(values);
  }, [values]);

  const setValues = useCallback((next: GlobalSettingsValues) => {
    setValuesState(next);
  }, []);

  const resetToDefaults = useCallback(() => {
    setValuesState(DEFAULT_SETTINGS);
  }, []);

  return useMemo(
    () => ({ values, setValues, resetToDefaults }),
    [values, setValues, resetToDefaults]
  );
};