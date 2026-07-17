const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
const KILOBYTE = 1024;
const LARGE_VALUE_THRESHOLD = 100;

export const formatSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined) return '—';
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';

  let value = bytes;
  let unitIndex = 0;

  while (value >= KILOBYTE && unitIndex < SIZE_UNITS.length - 1) {
    value /= KILOBYTE;
    unitIndex += 1;
  }

  const precision = unitIndex === 0 || value >= LARGE_VALUE_THRESHOLD ? 0 : 1;
  return `${value.toFixed(precision)} ${SIZE_UNITS[unitIndex]}`;
};
