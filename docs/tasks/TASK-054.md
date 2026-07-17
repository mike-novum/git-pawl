# TASK-054 — Widget: repository-tree

## Цель
Виджет списка репо (альтернатива или дополнение сетке на WorkspacePage).

## Что сделать
1. `src/widgets/repository-tree/ui/RepositoryTree.tsx`:
   - ResizablePanel layout.
   - Слева — список репо.
   - Справа — placeholder "Select a repository".
2. При выборе репо — onSelect callback.

## Acceptance criteria
- [ ] Использует ResizablePanel.
- [ ] Подсвечивает активный репо.

## Зависит от
- TASK-027, TASK-002

## Статус: DONE — Widget repository-tree реализован

### Что сделано
- Создан слайс виджета `src/widgets/repository-tree` с публичным API `RepositoryTree` + `RepositoryTreeProps`.
- Компонент использует UI-kit `ResizablePanel` (horizontal `PanelGroup`, defaultSizes `[25, 75]`).
- Слева — список репо из `useRepositoryList(workspacePath)`, каждая карточка обёрнута в `<div>` с подсветкой при совпадении `selectedRepoId`.
- Состояния loading/error/empty покрыты через UI-kit `Spinner`, `Empty`.
- Справа — placeholder "Select a repository".
- Клик по карточке вызывает `onSelect(repoId)` если передан.
- `npm run tsc` и `eslint` по новым файлам — без ошибок.

### Acceptance criteria (отметить выполненные)
- [x] Использует ResizablePanel.
- [x] Подсвечивает активный репо.

### Заметки для ревьюера
- Выделение активного репо реализовано через обёртку вокруг `RepositoryCard`, т.к. сам компонент не принимает `className` (это приватный API карточки); сохранена семантика `border-primary bg-primary/10` для selected и прозрачная рамка для неактивных.
- Виджет не использует `useRepoSearch` (TASK-053) намеренно: поиск — отдельная функция, и место его интеграции (хедер страницы или top widget) выходит за scope задачи. Подключение — отдельная задача.
- `PanelResizeHandle` идёт между `Panel`'ами как того требует API `react-resizable-panels`.
