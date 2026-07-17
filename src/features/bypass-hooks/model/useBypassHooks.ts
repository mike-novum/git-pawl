import { useState } from 'react';

const STORAGE_KEY = 'git-pawl:bypass-hooks';

const readStoredValue = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const writeStoredValue = (value: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    return;
  }
};

export const useBypassHooks = () => {
  const [value, setValue] = useState<boolean>(readStoredValue);

  const handleChange = (next: boolean): void => {
    writeStoredValue(next);
    setValue(next);
  };

  return { value, setValue: handleChange, isActive: value };
};
