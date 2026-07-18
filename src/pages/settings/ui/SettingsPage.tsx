import type { FC } from 'react';

import { SettingsForm } from '@/features/global-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';

import type { SettingsPageProps } from '../types';

export const SettingsPage: FC<SettingsPageProps> = () => {
  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-6">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm">
            Global preferences for git-pawl. Saved locally and applied to all
            repositories.
          </p>
        </div>
      </header>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Application</CardTitle>
          <CardDescription>
            Theme, editor, fetch cadence and diff preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm />
        </CardContent>
      </Card>
    </div>
  );
};

SettingsPage.displayName = 'SettingsPage';