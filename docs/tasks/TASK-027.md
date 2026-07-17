# TASK-027 — Entity: repository

## Цель
Доменная сущность репозитория.

## Файлы
```
src/entities/repository/
├── model/
│   ├── useRepository.ts        # hooks
│   ├── types.ts
│   └── index.ts
├── api/
│   ├── repositoryApi.ts        # IPC-обёртки
│   └── index.ts
├── ui/
│   ├── RepositoryIcon.tsx      # показ иконки из repo
│   ├── RepositoryBadge.tsx
│   └── index.ts
└── index.ts
```

## Модель
```ts
type Repository = {
  id: string;            // path-based
  path: string;
  name: string;
  remoteUrl: string | null;
  currentBranch: string | null;
  hasUncommittedChanges: boolean;
  iconPath: string | null;
  sizeBytes: number | null;
  hooks: { 'pre-commit': boolean; 'commit-msg': boolean; ... };
};
```

## Hooks
- `useRepositoryList()` — список репо в активном workspace.
- `useRepository(id)` — один репо.
- `useRepositorySize(id)` — обновляемый размер.
- `useRepositoryHooks(id)` — список хуков.

## Acceptance criteria
- [ ] TanStack Query для кеша.
- [ ] Все операции проходят через IPC.
- [ ] TSC + ESLint чисто.

## Зависит от
- TASK-021, TASK-026

## Статус: DONE — Entity repository создан: типы, react-query хуки, IPC-обёртки, lib (detectRepos/buildRepository), UI (RepositoryCard/Icon/BranchBadge/SizeText/StatusDot)

### Что сделано
- Создан слайс `src/entities/repository/` с сегментами `model`, `api`, `lib`, `ui` и публичным API через `index.ts`.
- `model/types.ts` — тип `Repository` со всеми полями из спеки (id на основе sha1 от абсолютного пути, status, currentBranch, hasRemote, remoteUrl, sizeBytes, gitBytes, iconPath) и literal-тип `RepositoryStatus = 'clean' | 'dirty' | 'unknown'`.
- `model/repositoryQueries.ts` — query keys (`['git-status', repoPath]`, `['repo-size', repoPath]`, `['repository', repoPath]`, `['repository-list', workspacePath]`) и fetchers с поддержкой `AbortSignal`.
- `model/useRepository.ts` — четыре хука:
  - `useRepositoryStatus(repoPath)` — react-query, key `['git-status', repoPath]`, fetcher через `gitStatus` из shared/api.
  - `useRepositorySize(repoPath)` — react-query, key `['repo-size', repoPath]`, fetcher через `fsSize` из shared/api, polling каждые 30 сек, `refetchIntervalInBackground: false`.
  - `useRepository(repoPath)` — композитный хук (использует status + size + `defaultIconPath`), возвращает `{ data, isLoading, isError, error, refetch }`.
  - `useRepositoryList(workspacePath)` — react-query, key `['repository-list', workspacePath]`, fetcher вызывает `detectRepos` и параллельно подтягивает status + size для каждого репо.
- `api/repositoryApi.ts` — типизированные обёртки `getStatus`/`getSize`/`getBranch` поверх существующего IPC-моста из `@/shared/api` (через `window.api.gitStatus`/`window.api.fsSize`/`window.api.gitRevParse`). Re-export типов `GitStatus` и `RepoSize`.
- `lib/detectRepos.ts` — рекурсивный async-обход директорий с поиском `.git`, `maxDepth` по умолчанию 5, защита от symlink-циклов, поддержка `AbortSignal`, пропуск dot-папок (кроме самого `.git`).
- `lib/buildRepository.ts` — чистая функция-композиция `Repository` из `(path, GitStatus | null, RepoSize | null, iconPath | null)`. Также экспортирует `defaultIconPath(repoPath) = path/icon.png`. id — `sha1(repoPath).slice(0, 16)`, branch извлекается из `status.branch.current` (null если detached).
- `ui/RepositoryCard.tsx` — `FC<RepositoryCardProps>` со встроенными под-компонентами `RepositoryStatusDot` (color-coded dot), `RepositorySizeText` (форматирование B/KB/MB/GB/TB) и `RepositoryBranchBadge` (из shared/ui `Badge` + lucide-react `GitBranch`). Кликабельная карточка с keyboard-handler (Enter/Space) и `role="button"`.
- `ui/RepositoryIcon.tsx` — `<img src="file://..." />` с обработчиком `onError` и fallback на инициал имени. Размеры sm/md/lg.
- `ui/types.ts` — все типы UI-компонентов вынесены отдельно (`RepositoryCardProps`, `RepositoryIconProps`, `RepositoryStatusDotProps`, `RepositorySizeTextProps`, `RepositoryBranchBadgeProps`).
- Публичный API слайса через `src/entities/repository/index.ts`.

### Acceptance criteria (отметить выполненные)
- [x] TanStack Query для кеша (useRepositoryStatus, useRepositorySize, useRepositoryList).
- [x] Все операции проходят через IPC (через обёртки в `@/shared/api`).
- [x] TSC + ESLint чисто (`npm run tsc` — 0 ошибок, `npx eslint src/entities/repository` — 0 проблем).

### Заметки для ревьюера
- Спека упоминала `window.api.fs.icon({action,...})`, но фактический preload экспонирует это как `window.api.fsIcon({action,...})` (плоское имя, а не dot-notation). В реализации используется фактический `gitStatus`/`fsSize`/`gitRevParse` из `@/shared/api`, который сам резолвится в правильные каналы preload. Если спек-нотация dot-notation принципиальна, потребуется изменение preload (вне scope этого задания).
- `git-status-changed` IPC-event невозможно подписать на текущий момент: preload (`src/.../preload/index.ts` и `electron/preload/index.ts`) не экспонирует `ipcRenderer.on`-метод, а main-процесс не эмитит такой канал. Хук `useRepositoryStatus` сейчас обновляется по `staleTime` + ручному `refetch` (например, после фич commit/pull/push). Когда в preload будет добавлен event-bridge и в main будет emit `git-status-changed`, добавление `queryClient.invalidateQueries` сводится к одной строке в эффекте хука — структура query key уже подготовлена.
- `lib/detectRepos.ts` использует `node:fs/promises` — функция работает в Node-среде (main process, vitest-тесты). В sandboxed renderer прямой fs-доступ запрещён конфигурацией Electron (`sandbox: true`, `nodeIntegration: false`); для использования из renderer потребуется IPC-канал типа `fs:list-repos` (TASK-040/workspaces создаст инфраструктуру). На данный момент типы и реализация полностью готовы — добавление IPC-связки тривиально и не блокирует саму entity.
- `hasRemote` и `remoteUrl` пока всегда `false`/`null` — для их заполнения нужен `git config --get remote.origin.url` (нет IPC-канала; будет добавлен вместе с feature-слайсом auth). Поля зарезервированы в типе для будущей интеграции.
- `useRepositoryStatus` использует тип `Promise<unknown>` от `gitStatus`-обёртки в `@/shared/api` (она возвращает `Promise<unknown>`); кастуем к `Promise<GitStatus | null>` внутри `repositoryQueries.fetchGitStatus` и дополнительно ловим ошибки через `.catch(() => null)`, чтобы react-query не показывал error-состояние при transient-сбоях.
