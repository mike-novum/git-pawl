import { Search } from 'lucide-react';
import type { FC } from 'react';

import { Input } from '@/shared/ui';
import { cn } from '@/shared/lib/theme';

import type { RepoSearchInputProps } from '../types';

export const RepoSearchInput: FC<RepoSearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search repositories by name, path or remote',
  className
}) => {
  return (
    <div className={cn('w-full max-w-md', className)}>
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        leftIcon={<Search aria-hidden="true" className="size-4" />}
        aria-label="Search repositories"
      />
    </div>
  );
};

RepoSearchInput.displayName = 'RepoSearchInput';