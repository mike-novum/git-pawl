import { gitTag } from '@/shared/api';

import type { Tag } from '../model/types';

export type { Tag };

export const listTags = (repoPath: string): Promise<Tag[]> =>
  gitTag({ repoPath, action: 'list' }) as Promise<Tag[]>;
