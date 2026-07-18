import { Clock } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/theme';

const relativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export type RecentActivityItem = {
  id: string;
  workspaceName: string;
  repoName: string;
  message: string;
  timestamp: number;
  href: string;
};

type RecentActivityProps = {
  items: RecentActivityItem[];
};

export const RecentActivity: FC<RecentActivityProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <section className="bg-surface border-border rounded-xl border p-5">
      <h2 className="text-foreground mb-4 flex items-center gap-2 text-sm font-semibold">
        <Clock aria-hidden="true" className="text-muted-foreground size-4" />
        Recent activity
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={item.href}
              className={cn(
                'hover:bg-surface-elevated flex items-center justify-between gap-4 rounded-md px-3 py-2 text-sm transition-colors',
                'duration-(--duration-fast)'
              )}
            >
              <span className="text-muted-foreground truncate">
                <span className="text-foreground">last commit</span>{' '}
                {relativeTime(item.timestamp)} in {item.workspaceName}/
                {item.repoName}
              </span>
              <span className="text-foreground truncate">{item.message}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

RecentActivity.displayName = 'RecentActivity';
