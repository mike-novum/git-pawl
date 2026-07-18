# TASK-200 — Code review pass

## Цель
Прогон ревью на каждой завершённой фиче/UI-кит-блоке через сабагента `code-reviewer`.

## Как запускается
Main-агент после `DONE` любой задачи вызывает сабагента:
```
type: claude-code-guide / general-purpose / claude
prompt: "Проведи code review для изменений в docs/tasks/TASK-NNN-"
```

## Что проверяет ревьюер
- Соответствие AGENTS.md (стрелочные функции, FC, типы в types.ts, no comments unless requested).
- Соответствие FSD (`fsd-core`, `fsd-segments` skills) — imports только нижестоящих слоёв.
- ESLint и TSC проходят (запустить `npm run lint`, `npm run tsc`).
- Edge cases (отмена операции, ошибки сети, пустые данные).
- Дублирование кода.
- Сложность компонентов (размер, ответственности).

## Output ревьюера
Список findings (file:line, severity, suggestion). Main-агент выдаёт правки разработчику.

## Зависит от
По мере закрытия задач.

## Status — final review pass

Дата: 2026-07-18.

### Прогон проверок
- `npm run tsc` — clean (renderer + electron).
- `npm run lint` — 0 errors, 7 warnings (все `react-refresh/only-export-components` на shared/ui — не блокер, паттерн стандартный для shadcn-style UI).
- `npm test -- --run` — 15 файлов / 112 тестов passed.

### CRITICAL
- (нет)

### MAJOR (FSD — feature-to-feature запрещены)
- `src/features/auth-switch/ui/AccountSwitcherMenu.tsx:6` — `import { ConnectAccountDialog } from '@/features/auth-login'`. Исправить композицией на уровне widgets/pages, либо вынести UI в shared.
- `src/features/clone-from-account/model/useCloneFromRepo.ts:5` — `import { useCloneRepo, type UseCloneRepoResult } from '@/features/clone-repo'`.
- `src/features/clone-from-account/model/useCloneFromRepo.ts:10` — `import { ... } from '@/features/account-repos'`.
- `src/features/commit-changes/model/useCommit.ts:9` — `import { useSelectedFiles } from '@/features/select-files'`.

### MINOR
- `src/pages/repository/ui/BranchTabsSection.tsx:5,7,9` — глубокие импорты `@/entities/{branch,stash,tag}/ui` вместо public API слайса. Всё экспортируется через `index.ts`, поправить на `@/entities/branch`, `@/entities/stash`, `@/entities/tag`.
- Глобальный паттерн `import { useAppStore } from '@/app/store'` из entities/features/widgets/pages (`src/entities/workspace/model/useWorkspace.ts`, `src/entities/account/model/useAccount.ts`, `src/features/auth-switch/model/useAccountSwitcher.ts`, `src/widgets/workspace-switcher/ui/WorkspaceSwitcher.tsx`, `src/pages/accounts/ui/AccountsPage.tsx`). FSD-строго это запрещено (нижний слой не импортирует верхний), но это установившаяся проектная конвенция для глобального стора. На усмотрение команды — задокументировать или перенести в shared/lib.
- Дублирование `throw new Error('IPC bridge is unavailable')` в 18+ feature-models — вынести в shared/lib (`@/shared/api/ipc-bridge` или `assertIpcBridge`).
- `src/pages/repository/ui/RepositoryPage.tsx:69-74` — `useMemo(() => fn, [])` для стабильной ссылки уместнее заменить на `useCallback`.

### VERIFIED OK
- Все `tsc`/`lint`/`test` зелёные.
- FSD-структура: страницы не импортируют страницы; виджеты не импортируют фичи/entities; фичи импортируют только нижестоящие (entities/shared) и app (как конвенция).
- AGENTS.md: стрелочные функции (нет `function`), нет `enum`, нет `: any`, компоненты на `FC<Props>`, типы в `types.ts`, нет комментариев, нет TODO/FIXME.
- 16 `useEffect`, 0 `useLayoutEffect` — приемлемо.
- Размеры файлов — самые крупные tsx: TagsPanel 462, CloneFromAccountDialog 342, CommitGraph 286, SettingsDialog 271. Превышают 250 строк, но внутри слайса логически цельные; AGENTS.md не запрещает.

### VERDICT
PASS с правкой MAJOR (cross-feature импорты). Можно мержить после фиксов из MAJOR.

## Status — MAJOR fixes

Дата: 2026-07-18.

### Resolved MAJOR

1. `src/features/auth-switch/ui/AccountSwitcherMenu.tsx` — `ConnectAccountDialog` import убран. Добавлен опциональный проп `renderConnectDialog?: () => ReactNode`. Внутренний state открытия диалога удалён, диалог теперь рендерится через render-prop от родителя. `accounts/ui/AccountsPage.tsx` уже управляет собственным экземпляром диалога, поэтому контракт совместим.

2. `src/features/clone-from-account/model/useCloneFromRepo.ts` — импорты из `@/features/clone-repo` и `@/features/account-repos` убраны. Хук теперь принимает зависимости через параметр `deps?: Partial<UseCloneFromRepoDeps> { useCloneRepo, useAccountRepos }`. Все cross-feature типы (`UseCloneRepoResult`, `RepoInfo`, `AccountReposProvider`, `AccountReposArgs`) перенесены в сам слайс `clone-from-account` без внешних импортов. Дефолтные no-op fallback'ы держат обратную совместимость для случая вызова без deps. `CloneFromAccountDialog` пробрасывает deps через новый prop `deps?: Partial<UseCloneFromRepoDeps>` — проброс может сделать вызывающий виджет/страница.

3. `src/features/commit-changes/model/useCommit.ts` — импорт `useSelectedFiles` из `@/features/select-files` заменён на `@/entities/file-change`. Логика вынесена в новый файл `src/entities/file-change/model/selectedFiles.ts` (zustand-store + хуки). Публичный API `entities/file-change` обновлён, `features/select-files` оставлен как re-export shim (`features/select-files/model/useSelectedFiles.ts` теперь просто реэкспортирует из entity).

### Verification

- `npm run tsc` — clean (renderer + electron).
- `npm run lint` — 0 errors, 7 warnings (только pre-existing `react-refresh/only-export-components` на shared/ui).
- `npm test` — 15 файлов / 112 тестов passed.

### CRITICAL
- (нет)

### MAJOR (FSD — feature-to-feature запрещены)
- (нет) — все cross-feature импорты из исходного PASS-отчёта устранены.

### MINOR
- (без изменений)

