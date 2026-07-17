import type { FC } from 'react';

import type { Commit } from '../model/types';

export type CommitHashProps = {
  hash: string;
  length?: number;
  className?: string;
};

export type CommitRowProps = {
  commit: Commit;
  className?: string;
};

export type FC_CommitHash = FC<CommitHashProps>;
export type FC_CommitRow = FC<CommitRowProps>;
