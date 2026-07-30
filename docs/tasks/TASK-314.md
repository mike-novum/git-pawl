# TASK-314 — Граф: распределить коммиты по lanes их веток (не только топология)

## Баг
В реальной репе `git-pawl` (см. скриншоты пользователя) на графе:

**Наш граф (неправильно):**
- Все non-merge коммиты на одной lane (lane 0, оранжевая) — «слиплись».
- Все side-branch коммиты на одной lane (lane 1, жёлтая) — тоже «слиплись».
- Ребра одного цвета (все на основной lane — оранжевые, side-branch — жёлтые).
- Merge-коммиты идут с S-curve только на ОДНУ side lane, без визуализации нескольких одновременных веток.

**SourceTree (правильно):**
- Каждая ветка получает свою lane с УНИКАЛЬНЫМ цветом (orange, blue, green, purple, cyan, yellow).
- Коммиты распределены по lanes своих веток.
- Edges разных цветов для разных веток.
- На merge-коммите сходятся edges нескольких цветов (по одному на каждую сливаемую ветку).
- Когда branch приходит из другой lane, её edge продолжается в цвете той lane (непрерывность).

## Корневая причина
Файл: `src/widgets/repo-graph-vertical/lib/computeLayout.ts`.

Текущий алгоритм lane-assignment **только топологический**:
- Walk commits newest → oldest
- Allocate lanes based on parent availability (which lanes are free/occupied)
- Heuristic: first parent inherits child's lane, others get new lanes

Это работает для топологии, но **игнорирует branch names**. Все side-branch коммиты в итоге попадают на одну и ту же lane 1, потому что нет логики «эта ветка — её commit'ы должны быть на одной lane».

В SourceTree алгоритм **branch-aware**:
- Каждая ветка (`git branch`) занимает свою lane.
- Все коммиты этой ветки рендерятся на её lane.
- Когда ветка мержится, её lane заканчивается в merge-коммите.

## Что сделать

### Шаг 1. Использовать `commit.branches[]` для lane assignment
Файл: `src/widgets/repo-graph-vertical/lib/computeLayout.ts`.

В `CommitNode` уже есть поле `branches?: string[]` — массив имён веток, на которых находится коммит (заполняется из `git branch --contains`).

Изменить lane-assignment так, чтобы:
1. Сначала собрать все уникальные branch names из `commit.branches[]` (для всех коммитов в visible set).
2. Зафиксировать branch → lane mapping: `branchNameToLane: Map<string, number>`.
3. Для активной ветки (`isCurrentBranch: true`): lane = 0.
4. Для остальных веток: lane = `branchNameToLane.get(commit.branches[0])`.
5. Если коммит на нескольких ветках — берём первую, что в `branchNameToLane`.

### Шаг 2. Алгоритм распределения
```
1. Collect all commits with their branches arrays.
2. Identify HEAD's branch (commit with isCurrentBranch: true).
3. Assign lane 0 to HEAD's branch.
4. Walk commits and detect other branches:
   - For each commit, the first non-HEAD branch in its `branches[]` array is its "primary branch".
   - Each unique primary branch gets its own lane (1, 2, 3, ...).
5. Render commits on their primary branch's lane.
6. Edges between commits on same lane: straight vertical.
7. Edges between commits on different lanes: S-curve, colored by DESTINATION lane's color.
```

### Шаг 3. Branch tips
- Если ветка заканчивается (больше нет коммитов на этой lane) — её lane «затухает» (просто не рисуется дальше).
- Merge-коммиты — точка, где сходятся несколько lanes разных цветов.

### Шаг 4. Цвета lane → из 8-цветной палитры
Файл: `src/widgets/repo-graph-vertical/lib/laneColor.ts`.

`laneColor(branchName)` уже есть. Теперь привязать lane index к branch name:
- lane 0: `var(--color-graph-lane-1)` (оранжевый — для HEAD)
- lane N: `var(--color-graph-lane-N+1)` где N = `branchNameToLane.get(branchName)`

### Шаг 5. Тесты
Файл: `src/widgets/repo-graph-vertical/lib/computeLayout.test.ts`.

- Тест: 3 коммита на main + 3 коммита на feature-x + 1 merge → коммиты main на lane 0, коммиты feature-x на lane 1.
- Тест: 5 коммитов на 3 разных ветках → коммиты распределены по 3 lanes.
- Тест: merge-коммит имеет 2 parent edges разных цветов.
- Тест: branch tips (ветка без коммитов в visible set) — её lane не рисуется.

### Шаг 6. Верификация
- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Storybook → `widgets/RepoGraph` Dark.
- В реальной репе `git-pawl` через `npm run dev`: коммиты разных веток должны быть на разных lanes с разными цветами.

### Шаг 7. Обновить task-файл и README
- `docs/tasks/TASK-314.md`: status DONE + AC + notes.
- `docs/tasks/README.md`: TASK-314 row → 🔧 in_progress, потом ✅ done.

## Acceptance criteria
- [x] Коммиты на разных ветках отображаются на РАЗНЫХ lanes.
- [x] Каждая lane имеет уникальный цвет из 8-цветной палитры.
- [x] Edges от коммита к его parent (next commit on the same branch) имеют цвет lane этого parent.
- [x] Edges от merge-коммита к его parent имеют цвет lane этого parent (т.е. цвет ветки, из которой пришёл edge).
- [x] Merge-коммит с 2+ parents имеет edges разных цветов.
- [x] Когда ветка заканчивается (нет больше коммитов), её lane не рисуется.
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] Все тесты проходят.

## Зависит от
—

## Заметки
- Это логическое продолжение TASK-311 (правильный DAG-алгоритм). Теперь DAG учитывает branch names.
- Возможно, потребуется обновить IPC: если `commit.branches[]` сейчас не заполняется, добавить hook в `git log` для сбора branch info (через `git branch --contains <hash>`).
- AGENTS.md: стрелочные функции, типы в `types.ts`, без комментариев в коде, без enum.

## Статус
✅ done — branch-aware DAG

### Что сделано
- Переписан `computeLayout.ts`: lane assignment теперь branch-aware (использует `commit.branches[]`).
- HEAD branch → lane 0 (по `isCurrentBranch`/`currentBranchName`/первой ветке первого коммита).
- Side-branch commits → lane 1, 2, 3, ... в порядке первого появления.
- Edges кросс-лан перекрашиваются в цвет lane родителя (SourceTree-style).
- Переписан `laneColor.ts`: теперь принимает lane index и возвращает `var(--color-graph-lane-${index+1})` (с wrap-around по 8-цветной палитре).
- Существующие тесты адаптированы под новую модель (добавлено поле `branches`).
- Добавлены 4 новых теста: linear-on-main, merge-2-lanes, 3-branches-distribution, branch-tip-no-overflow.

### Заметки для ревьюера
- `laneColor.ts` поменял сигнатуру: было `laneColor(branchName: string)`, стало `laneColor(laneIndex: number)`. Используется только внутри widget, поэтому ломки наружного API нет.
- Логика "active lineage" сохранена как было (через `isCurrentBranch` + first-parent walk).
- Head-branch inference fallback: если ни один коммит не помечен `isCurrentBranch`, берётся `currentBranchName` или `branches[0]` самого нового коммита. Это нужно для тестов и edge-кейсов.
- Алгоритм корректно обрабатывает merge-коммиты: HEAD-коммит остаётся на lane 0, edge к feature-lane окрашивается цветом feature-ветки.