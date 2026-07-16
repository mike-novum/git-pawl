import type { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/app/layouts';
import { AccountsPage } from '@/pages/accounts';
import { ClonePage } from '@/pages/clone';
import { RepositoryPage } from '@/pages/repository';
import { SettingsPage } from '@/pages/settings';
import { WorkspacePage } from '@/pages/workspace';

export const AppRoutes: FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/workspace" replace />} />
        <Route path="workspace" element={<WorkspacePage />} />
        <Route path="workspace/:id" element={<WorkspacePage />} />
        <Route path="repo/:id" element={<RepositoryPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="clone" element={<ClonePage />} />
        <Route path="*" element={<Navigate to="/workspace" replace />} />
      </Route>
    </Routes>
  );
};
