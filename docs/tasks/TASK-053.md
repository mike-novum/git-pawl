# TASK-053 — Feature: search-repos

## Цель
Поиск по локальным репозиториям в workspace.

## Что сделать
1. Хук `useRepoSearch(query)` — фильтрует список репо по:
   - name
   - remoteUrl
   - path
2. UI — Input в WorkspacePage header, debounced 150 ms.

## Acceptance criteria
- [ ] Поиск case-insensitive.
- [ ] Поддерживает подстроки (не только prefix).
- [ ] Пустой query — показывает все репо.

## Зависит от
- TASK-027, TASK-002

## Статус: DONE — реализован общий feature search-repos и интегрирован в WorkspacePage

### Что сделано
- Создан feature-слайс `src/features/search-repos` с публичным API `useRepoSearch` и `RepoSearchInput`.
- `useRepoSearch(repos)` возвращает `{ query, setQuery, results }`: debounce 150 мс через `useEffect` + `setTimeout`, фильтрация case-insensitive по `name`, `path`, `remoteUrl`.
- `RepoSearchInput` — тонкая обёртка над UI-kit `Input` (иконка `Search`, `aria-label`).
- В `WorkspacePage` хук теперь импортируется из `@/features/search-repos`; локальный `pages/workspace/model/useRepoSearch.ts` и его `index.ts` удалены, ре-экспорты из `pages/workspace/index.ts` убраны.

### Acceptance criteria (отметить выполненные)
- [x] Поиск case-insensitive.
- [x] Поддерживает подстроки (не только prefix).
- [x] Пустой query — показывает все репо.

### Заметки для ревьюера
- `useRepoSearch` принимает массив репозиториев и возвращает уже отфильтрованные `results` — родителю не нужно вызывать `filter(repos)`.
- Debounce касается только фильтрации: `query` обновляется синхронно (значение в `Input`), `results` — через 150 мс.
- `pages/workspace/ui/RepoSearchInput.tsx` оставлен как есть, поскольку задача явно требовала только перенести хук; для подключения feature-версии потребуется отдельная задача.
