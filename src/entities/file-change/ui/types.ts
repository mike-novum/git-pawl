import type { FC } from 'react';

import type { FileChange } from '../model/types';

export type FileChangeRowProps = {
  change: FileChange;
  className?: string;
};

export type FC_FileChangeRow = FC<FileChangeRowProps>;
