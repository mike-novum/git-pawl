import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/app/layouts';
import { AccountsPage } from '@/pages/accounts';
import { ClonePage } from '@/pages/clone';
import { RepositoryPage } from '@/pages/repository';
import { SettingsPage } from '@/pages/settings';
import { WorkspacePage } from '@/pages/workspace';
import { WorkspacesPage } from '@/pages/workspaces';

export const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/workspaces" replace />} />
        <Route path="workspaces" element={<WorkspacesPage />} />
        <Route path="workspaces/:id" element={<WorkspacePage />} />
        <Route path="repos/:id" element={<RepositoryPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="clone" element={<ClonePage />} />
        <Route path="workspace" element={<Navigate to="/workspaces" replace />} />
        <Route path="repo/:id" element={<Navigate to="/repos/:id" replace />} />
        <Route path="*" element={<Navigate to="/workspaces" replace />} />
      </Route>
    </Routes>
  );
};
