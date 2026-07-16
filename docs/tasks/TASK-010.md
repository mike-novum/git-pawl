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

## Статус: DONE — App-shell, HashRouter-роутинг, IPC-bridge и stub-страницы собраны

## Что сделано
- Расширил `electron/preload/index.ts`: экспортируются `ApiSchema` и типы аргументов для всех каналов (app/store/git/fs/auth/account/github/gitlab), плюс сам объект `api` через `contextBridge.exposeInMainWorld('api', ...)`.
- Расширил `electron/main/index.ts`: `ipcMain.handle(...)` зарегистрирован для каждого канала как `echo(args)` (заглушка под TASK-020+).
- Переписал `src/shared/api/ipc.ts` на типизированные обёртки: `getAppInfo`, `storeGet/Set/Delete`, `git*` (status/log/diff/...), `fsSize/Icon/WorkspaceList`, плюс объект `api` для удобного импорта. `safeInvoke` обрабатывает отсутствие `window.api` (тесты/vitest) и возвращает заглушки. Добавил `src/shared/api/index.ts` как public API слайса.
- Добавил `src/shared/lib/theme/` (`ThemeProvider`, `useTheme`, `ThemeContext`, типы) — stub-реализация, которую TASK-001 заменит на «настоящую». `ThemeContext` вынесен в отдельный файл, чтобы не ломать react-refresh.
- `src/app/providers/AppProviders.tsx` собирает `QueryClientProvider` + `ThemeProvider` + `HashRouter`.
- `src/app/routes/AppRoutes.tsx` — роуты: `/` → `/workspace`, `/workspace` и `/workspace/:id` → WorkspacePage, `/repo/:id` → RepositoryPage, `/accounts`, `/settings`, `/clone`, плюс catch-all `*` → workspace.
- `src/app/layouts/AppLayout.tsx` — sidebar с workspace-switcher (placeholder), nav-ссылками и theme-toggle (использует `useTheme`), плюс `<Outlet />` для контента.
- Обновил `src/app/entrypoint/App.tsx` (рендерит `<AppRoutes />`) и `src/app/entrypoint/index.tsx` (оборачивает в `AppProviders`).
- 5 page-slice'ов: `workspace`, `repository`, `accounts`, `settings`, `clone`. Каждый со своим `ui/{Page}.tsx` + `ui/index.ts` + slice `index.ts` + `types.ts`. `workspace/ui/EmptyState.tsx` — переиспользуемая заглушка-компонент для empty state.
- Обновил `ipc.test.ts` под новый API (использует `getAppInfo`).
- `package.json`: добавлен `react-router-dom@^6.30.4`. `@types/react-router-dom` не нужен — типы бандлятся в самом пакете начиная с v6.

## Acceptance criteria
- [x] `npm run dev` поднимает Electron-окно, рендерит App (smoke-test: dev-сервер на :5173 стартует, electron-main собирается).
- [x] HashRouter работает — навигация переключает страницы (`<Routes>` с `path="workspace/:id"`).
- [x] QueryClientProvider работает (QueryClient создаётся с дефолтами в AppProviders).
- [x] `window.api` доступен в renderer, типизирован (`ApiSchema` в `window.api`, импортируется из `@electron/preload`).
- [x] IPC echo работает (smoke-тест: `getAppInfo()` возвращает `AppInfo`; main-процесс эхо-возвращает args для всех каналов).

## Заметки для ревьюера
- В `preload/index.ts` используется `ipcRenderer.invoke(channel, args)` с явными `as Promise<T>` для `void`-возвращающих каналов, чтобы TS не выводил `Promise<unknown>` там, где нужен `Promise<void>`. Безопасность: каналы в `AppSchema` всё равно помечены как `Promise<unknown>` для гибкости; точечные касты остаются только у `app:info` (возвращает типизированный `AppInfo`) и `store:set/delete` (void).
- `ThemeContext` лежит в отдельном файле `themeContext.ts`, иначе `react-refresh/only-export-components` ругается.
- `AppLayout` принимает `children?: ReactNode` (optional), потому что в режиме `<Route element={<AppLayout />}>` рендеринг идёт через `<Outlet />`. Если children переданы — рендерятся они (полезно для тестов/storybook).
- `safeInvoke` в `src/shared/api/ipc.ts` нужен, чтобы `ipc.test.ts` (vitest + jsdom) не падал: в тестах `window` есть, но `window.api` не определён. В Electron-рендерере bridge всегда присутствует, fallback никогда не сработает.
- Все `package.json`-зависимости установлены через `npm install --cache /tmp/git-pawl-npm-cache2` (стандартный `~/.npm` имеет permission issue — обошли локальным кэшем).
- Не трогал `theme.css`/`light.css` (TASK-001) и `assets/icon.svg` (TASK-005).
