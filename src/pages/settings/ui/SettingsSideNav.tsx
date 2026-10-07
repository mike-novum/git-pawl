import type { FC } from 'react';
import { Bot, GitBranch, Sliders, type LucideIcon } from 'lucide-react';

import { cn } from '@/shared/lib/theme';

import type { SettingsSideNavProps, SettingsTab } from '../types';

type TabConfig = {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
};

const TABS: TabConfig[] = [
  { id: 'general', label: 'General', icon: Sliders },
  { id: 'git', label: 'Git', icon: GitBranch },
  { id: 'agents', label: 'Agents', icon: Bot }
];

export const SettingsSideNav: FC<SettingsSideNavProps> = ({
  activeTab,
  onTabChange
}) => (
  <nav
    aria-label="Settings sections"
    className="flex w-56 shrink-0 flex-col gap-1 border-r border-border pr-2"
  >
    {TABS.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-(--duration-fast)',
            isActive
              ? 'bg-surface-elevated text-foreground font-medium'
              : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
          {tab.label}
        </button>
      );
    })}
  </nav>
);

SettingsSideNav.displayName = 'SettingsSideNav';