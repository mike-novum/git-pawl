# TASK-081 — Feature: select-files

## Acceptance criteria
- [x] Стейт выбранных файлов (через zustand локальный store).
- [x] «Select all» / «Deselect all» в шапке панели.
- [ ] Кнопка «Stage» — `git add` для выбранных.

## Зависит от
- TASK-080

## Статус: DONE — базовая инфраструктура выбора файлов готова

### Что сделано
- Создан `src/features/select-files/` со слайсом по FSD.
- `model/useSelectedFiles.ts` — zustand store с состоянием `selectedByRepo: Record<string, string[]>` и методами `toggle(repoPath, path)`, `selectAll(repoPath, paths)`, `deselectAll(repoPath)`. Хук `useSelectedFiles(repoPath)` возвращает bound-API (`isSelected`, `toggle`, `selectAll`, `deselectAll`, `selected`, `count`).
- `ui/StagedToggle.tsx` — компонент-чекбокс на базе UI-кита, вызывает `toggle(path)` для конкретного репозитория.
- `ui/SelectAllControls.tsx` — пара кнопок «Select all» / «Deselect all» для шапки панели (вызывает `selectAll(paths)` / `deselectAll()`).
- `ui/types.ts`, `ui/index.ts`, `model/index.ts`, корневой `index.ts` с публичным API.
- Кнопка «Stage» (`git add` для выбранных) будет реализована в отдельной фиче/задаче.

### Acceptance criteria (отметить выполненные)
- [x] Стейт выбранных файлов (через zustand локальный store).
- [x] «Select all» / «Deselect all» в шапке панели.
- [ ] Кнопка «Stage» — `git add` для выбранных. (вне scope TASK-081)

### Заметки для ревьюера
- Используется `Record<string, string[]>` вместо `Set<string>` — `Set` не сериализуется и неудобен для zustand. Метод `isSelected(path)` предоставляет set-like семантику на уровне API.
- Хук `useSelectedFiles(repoPath)` биндит `repoPath` к методам, чтобы потребителям не приходилось передавать его на каждый вызов.
- Проверено: `npm run tsc` — без ошибок; `npm run lint` — 0 новых предупреждений/ошибок в `src/features/select-files/`.
