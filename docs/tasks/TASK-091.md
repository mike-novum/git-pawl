# TASK-091 — Widget: commit-graph

## Цель
Визуализация графа коммитов (SVG, лейаут в виде слоёв).

## Что сделать
1. Подход — алгоритм «lane assignment» (как в SourceTree):
   - каждой ветке — lane (вертикальная колонка).
   - merge → branch → линкует lane'ы.
   - виртуализация через windowed rendering.
2. UI:
   - колонка с линиями (SVG).
   - колонка с commit message + author + date.
3. Клик → переход к diff или checkout.

## Acceptance criteria
- [ ] Граф рисуется для репо с линейной историей.
- [ ] Merge-коммиты корректно отображаются.
- [ ] Виртуализация — лагает не больше, чем на 10k коммитов.

## Зависит от
- TASK-090, TASK-002
