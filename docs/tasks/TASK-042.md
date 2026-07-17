# TASK-042 — Widget: workspace-switcher

## Цель
Виджет переключения workspace в шапке.

## Acceptance criteria
- [ ] DropdownMenu в AppLayout header.
- [ ] Список всех workspace + "+ New workspace".
- [ ] Выбор меняет `activeWorkspaceId` в store.

## Зависит от
- TASK-040, TASK-003

## Статус: DONE — workspace-switcher widget implemented.

### Что сделано
- Создан слайс `src/widgets/workspace-switcher/` с public API через `index.ts`.
- `WorkspaceSwitcher` — DropdownMenu trigger с текущим workspace, активным workspace (disabled с галочкой), списком остальных workspace и пунктом "+ New workspace...", открывающим `CreateWorkspaceDialog`.
- Выбор workspace вызывает `useAppStore.setActiveWorkspaceId` и показывает toast-подтверждение.
- Типы вынесены в отдельный `types.ts`, компонент реализован как `FC<WorkspaceSwitcherProps>` через стрелочную функцию.

### Acceptance criteria (отметить выполненные)
- [x] DropdownMenu в AppLayout header.
- [x] Список всех workspace + "+ New workspace".
- [x] Выбор меняет `activeWorkspaceId` в store.

### Заметки для ревьюера
- Placeholder для неактивного состояния — "Select workspace" (как указано в задании).
- `useAppStore` импортируется напрямую в widget UI (как и в существующем `pages/accounts/ui/AccountsPage.tsx`), следуя установившемуся в проекте паттерну.
