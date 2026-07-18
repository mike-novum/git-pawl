import { useState } from 'react';

export const useLocalStorageBool = (
  key: string,
  initial: boolean
): [boolean, (v: boolean) => void] => {
  const [value, setValue] = useState<boolean>(() => {
    if (typeof window === 'undefined') return initial;
    const raw = window.localStorage.getItem(key);
    return raw === null ? initial : raw === 'true';
  });
  const update = (v: boolean): void => {
    setValue(v);
    window.localStorage.setItem(key, String(v));
  };
  return [value, update];
};
