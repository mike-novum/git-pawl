import { SearchX } from 'lucide-react';
import type { FC } from 'react';

import { Button, Empty } from '@/shared/ui';

import type { NoResultsStateProps } from '../types';

export const NoResultsState: FC<NoResultsStateProps> = ({ query, onReset }) => (
  <div className="flex flex-1 items-center justify-center p-6">
    <Empty
      icon={<SearchX aria-hidden="true" className="size-6" />}
      title="No matching repositories"
      description={`No repositories match "${query}". Try a different search query.`}
      action={
        <Button type="button" variant="secondary" onClick={onReset}>
          Clear search
        </Button>
      }
    />
  </div>
);

NoResultsState.displayName = 'NoResultsState';