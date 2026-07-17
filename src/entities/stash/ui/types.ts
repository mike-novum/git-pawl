import type { FC } from 'react';

import type { StashEntry } from '../model/types';

export type StashRowProps = {
  entry: StashEntry;
  className?: string;
};

export type FC_StashRow = FC<StashRowProps>;
