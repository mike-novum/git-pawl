import { useState, type FC } from 'react';

import {
  SettingsAgentsTab,
  SettingsGeneralTab,
  SettingsGitTab
} from '@/features/global-settings/ui';

import { SettingsSideNav } from './SettingsSideNav';
import type { SettingsPageProps, SettingsTab } from '../types';

export const SettingsPage: FC<SettingsPageProps> = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm">
          Global preferences for git-pawl. Saved locally and applied to all
          repositories.
        </p>
      </header>

      <div className="flex min-h-0 flex-1 gap-6">
        <SettingsSideNav activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'general' ? <SettingsGeneralTab /> : null}
          {activeTab === 'git' ? <SettingsGitTab /> : null}
          {activeTab === 'agents' ? <SettingsAgentsTab /> : null}
        </div>
      </div>
    </div>
  );
};

SettingsPage.displayName = 'SettingsPage';