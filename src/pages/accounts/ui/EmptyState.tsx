import { Plus } from 'lucide-react';
import type { FC } from 'react';

import { Button, Empty } from '@/shared/ui';

import type { AccountsEmptyStateProps } from './types';

export const EmptyState: FC<AccountsEmptyStateProps> = ({ onConnect }) => (
  <Empty
    icon={<Plus aria-hidden="true" className="size-6" />}
    title="No accounts connected"
    description="Connect a GitHub or GitLab account to clone repositories and push changes."
    action={
      <Button variant="primary" onClick={onConnect}>
        <Plus aria-hidden="true" className="size-4" />
        Add account
      </Button>
    }
  />
);

EmptyState.displayName = 'EmptyState';