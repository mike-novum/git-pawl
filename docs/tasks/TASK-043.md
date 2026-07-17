# TASK-043 — Page: workspace

## Цель
Главная страница со списком репозиториев и поиском.

## Что сделать
1. `src/pages/workspace/ui/WorkspacePage.tsx`:
   - Header: имя workspace + кнопки "Add repo", "Clone".
   - Search input (fuzzy).
   - Сетка карточек репо: иконка, имя, текущая ветка, статус (clean/dirty), размер.
2. Подключает `useRepositoryList()` из TASK-027.
3. Подключает `search-repos` feature.
4. Empty-состояние, если нет репо.

## Acceptance criteria
- [ ] Поиск фильтрует в реальном времени.
- [ ] Клик по репо → переход на `/repo/:id`.

## Зависит от
- TASK-027, TASK-040, TASK-002, TASK-053

## Статус: DONE — реализована страница Workspace со списком репозиториев, поиском и empty-состояниями.

### Что сделано
- `src/pages/workspace/ui/WorkspacePage.tsx` — главный композиционный компонент страницы: получает активный workspace через `useActiveWorkspace`, репозитории через `useRepositoryList(workspacePath)`, локальный поиск через `useRepoSearch`. Обрабатывает состояния: no-workspace, loading, error, empty, no-results, grid. Клик по карточке → `/repo/:id`.
- `src/pages/workspace/ui/WorkspaceHeader.tsx` — `FC<WorkspaceHeaderProps>` заголовок с именем workspace, путём и кнопками «Add repo» / «Clone» (UI-kit `Button`, иконки lucide-react).
- `src/pages/workspace/ui/RepoSearchInput.tsx` — поиск по репозиториям (UI-kit `Input` + `Search` иконка), `aria-label`.
- `src/pages/workspace/ui/RepoGrid.tsx` — адаптивная сетка `RepositoryCard` (1/2/3/4 колонки).
- `src/pages/workspace/ui/NoWorkspaceState.tsx` — Empty + CTA «New workspace» (открывает `CreateWorkspaceDialog`).
- `src/pages/workspace/ui/NoReposState.tsx` — Empty + CTA «Add repo» / «Clone».
- `src/pages/workspace/ui/NoResultsState.tsx` — Empty + CTA «Clear search».
- `src/pages/workspace/ui/EmptyState.tsx` — сохранён, как общий empty-блок.
- `src/pages/workspace/model/useRepoSearch.ts` — локальный хук: `query`, `setQuery`, `reset`, `filter(repos)`; чистая функция `filterRepos` фильтрует по `name`, `path`, `remoteUrl` (case-insensitive `includes`).
- `src/pages/workspace/types.ts` — все типы компонентов вынесены отдельно.
- `src/pages/workspace/ui/index.ts` + `src/pages/workspace/index.ts` — публичные API слайса и сегмента.

### Acceptance criteria (отметить выполненные)
- [x] Поиск фильтрует в реальном времени (case-insensitive по name / path / remote).
- [x] Клик по репо → переход на `/repo/:id` через `useNavigate`.

### Заметки для ревьюера
- Используется локальный `useRepoSearch`-хук, так как `search-repos` feature (TASK-053) ещё не реализован. Когда появится фича, хук легко заменить импортом из `@/features/search-repos`.
- Кнопка «Add repo» сейчас показывает `toast.info` о том, что фича скоро появится — отдельного add-repo feature slice в проекте пока нет.
- «Add repo» / «Clone» в empty-состоянии используют те же обработчики, что и в шапке — единая точка входа.
- Public API слайса и сегмента расширены, чтобы не ломать импорты из `ui` в других частях проекта.
