import type { FC } from 'react';

import type { Tag } from '../model/types';

export type TagBadgeProps = {
  tag: Tag;
  className?: string;
};

export type FC_TagBadge = FC<TagBadgeProps>;
