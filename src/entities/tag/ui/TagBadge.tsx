import { Tag as TagIcon } from 'lucide-react';
import type { FC } from 'react';

import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/theme';

import type { TagBadgeProps } from './types';

const variantFor = (type: TagBadgeProps['tag']['type']): 'default' | 'outline' =>
  type === 'annotated' ? 'default' : 'outline';

export const TagBadge: FC<TagBadgeProps> = ({ tag, className }) => (
  <Badge
    variant={variantFor(tag.type)}
    size="sm"
    className={cn('gap-1', className)}
    title={`${tag.type} tag · ${tag.target}`}
  >
    <TagIcon className="h-3 w-3" aria-hidden="true" />
    <span className="font-mono">{tag.name}</span>
  </Badge>
);
