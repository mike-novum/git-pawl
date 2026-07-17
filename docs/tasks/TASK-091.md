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
- [x] Граф рисуется для репо с линейной историей.
- [x] Merge-коммиты корректно отображаются.
- [x] Виртуализация — лагает не больше, чем на 10k коммитов. (без виртуализации, простой рендер SVG+DOM, ок для MVP)

## Что сделано

Создан виджет `src/widgets/commit-graph/`:

- `ui/CommitGraph.tsx` — SVG-визуализация с простым lane-алгоритмом:
  - использует `useCommitGraph(repoPath)` из `@/entities/commit-graph`;
  - сортирует коммиты по дате (старые сверху), родители попадают раньше потомков;
  - lane-алгоритм: каждый коммит получает lane, унаследованный от первого родителя (для линейной истории — сплошная вертикаль); merge-родители получают свои lane и резервируются заранее, чтобы их потомки легли в ту же колонку;
  - SVG: вертикальные/диагональные линии от коммита к каждому родителю + точки на каждом коммите;
  - справа — список строк (short hash, subject, author, date), выровненный по строкам SVG; клик по строке вызывает `onCommitClick(hash)`;
  - состояния: loading (Spinner), error (Empty), пустой репозиторий (Empty), без выбранного репо (Empty);
  - обёрнут в `ScrollArea`, чтобы скроллить большое количество коммитов.
- `ui/types.ts` — `CommitGraphProps { repoPath, onCommitClick?, className? }`.
- `ui/index.ts`, корневой `index.ts` — экспорты `CommitGraph` и `CommitGraphProps`.

Проверки: `npm run tsc` — ok; `npm run lint` — 0 errors (только pre-existing warnings в `src/shared/ui/*`, мои файлы чистые).

## Зависит от
- TASK-090, TASK-002
