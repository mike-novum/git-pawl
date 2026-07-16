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
