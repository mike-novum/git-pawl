export type { GitTagListResult } from '@electron/shared/types/git';

export type Tag = {
  name: string;
  type: 'annotated' | 'lightweight';
  target: string;
};
