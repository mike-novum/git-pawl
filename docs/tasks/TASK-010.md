# TASK-010 — App-shell, роутинг, Electron-preload bridge

## Цель
Скелет приложения: layout + HashRouter (для Electron) + IPC-bridge.

## Что сделать

1. `electron/preload/index.ts` — `contextBridge.exposeInMainWorld('api', {...})` со всеми каналами, пока stub-функции.
2. `electron/main/index.ts` — `ipcMain.handle('channel', ...)` для каждого канала (пока echos).
3. `src/shared/api/ipc.ts`:
   - `import type { ApiSchema } from '@electron/preload'`
   - типизированные обёртки `gitStatus(args): Promise<...>`
4. `src/app/entrypoint/index.tsx` — `createRoot(...).render(<App />)`.
5. `src/app/providers/AppProviders.tsx` — QueryClientProvider + ThemeProvider + Router.
6. `src/app/routes/index.tsx` — HashRouter + список роутов (пока пустые Placeholder-страницы):
   - `/` → redirect to workspace
   - `/workspace/:id` → WorkspacePage
   - `/repo/:id` → RepositoryPage
   - `/accounts` → AccountsPage
   - `/settings` → SettingsPage
7. `src/app/layouts/AppLayout.tsx` — sidebar (placeholder) + content area.
8. `src/pages/workspace/ui/WorkspacePage.tsx` и остальные — заглушки с `Empty` UI-кита.

## Acceptance criteria
- [ ] `npm run dev` поднимает Electron-окно, рендерит App.
- [ ] HashRouter работает — навигация переключает страницы.
- [ ] QueryClientProvider работает (пока видно по React Query Devtools в dev).
- [ ] `window.api` доступен в renderer, типизирован.
- [ ] IPC echo работает (smoke-тест: вызвать → получить ответ).

## Зависит от
- TASK-000

## Файлы
- `electron/main/index.ts`
- `electron/preload/index.ts`
- `src/shared/api/ipc.ts`
- `src/app/entrypoint/index.tsx`
- `src/app/providers/AppProviders.tsx`
- `src/app/routes/index.tsx`
- `src/app/layouts/AppLayout.tsx`
- `src/pages/workspace/ui/WorkspacePage.tsx`
- `src/pages/repository/ui/RepositoryPage.tsx`
- `src/pages/accounts/ui/AccountsPage.tsx`
- `src/pages/settings/ui/SettingsPage.tsx`
- `src/pages/clone/ui/ClonePage.tsx`
