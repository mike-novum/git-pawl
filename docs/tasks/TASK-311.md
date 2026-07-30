# TASK-311 — Граф: переписать на правильный DAG-алгоритм с одним SVG

## Контекст

Все предыдущие TASK (308-310) пытались починить граф поверх существующей архитектуры (per-row SVG с overflow="visible"). Это фундаментально неправильный подход — он порождает разрывы, stub-рёбра, проблемы с z-index между соседними SVG.

Нужен полный рерайт: правильный DAG-алгоритм и один большой SVG на всю колонку графа (как в SourceTree).

## Алгоритм (DAG)

### Шаг 1. Собрать все коммиты
Все коммиты приходят из `git log` в топологическом порядке (новейшие первые):
```
[
  { hash, parents: [hash1, hash2], ... },  // HEAD, row 0
  { hash, parents: [hash3], ... },          // row 1
  ...
]
```

### Шаг 2. Построить parent map
`Map<hash, hash[]>` — для каждого коммита список его родителей.

### Шаг 3. Вычислить lane assignment (один проход, новейший → старейший)

State:
- `activeLanes: Map<hash, laneIndex>` — какие коммиты сейчас «активны» в каждой lane.

Алгоритм:
```
for each commit (in order, newest first):
  // 1. Найти существующий lane для этого коммита, если он в activeLanes
  lane = activeLanes.get(commit.hash)
  if lane is undefined:
    lane = firstFreeLane()
    activeLanes.set(commit.hash, lane)

  commit.lane = lane

  // 2. Обработать родителей
  for each parent in commit.parents:
    parentLane = activeLanes.get(parent.hash)

    if parentLane === lane:
      // Parent в той же lane — keep active
      // (nothing to do)
    else if parentLane is undefined:
      // Parent новый — выделить lane
      // Первый parent идёт в lane коммита (если возможно),
      // остальные — в новые lane
      if it's first parent:
        parentLane = getFreeLane()
        // commit в lane освобождается после обработки
      else:
        parentLane = getFreeLane()

      activeLanes.set(parent.hash, parentLane)
    else:
      // Parent в другой lane — keep as is

  // 3. После обработки родителей — освободить lane коммита,
  //    если он не держит первого родителя
  if commit.parents[0] is not in lane:
    activeLanes.delete(commit.hash)
  // (commit остаётся в lane, если первый parent в той же lane)

  // 4. Сохранить edge info: commit → parent, lane diff
  edges.push({
    from: commit,
    to: parent,
    fromLane: commit.lane,
    toLane: parent.lane
  })
```

### Шаг 4. Continuous vertical lines
Для каждого lane:
- Все коммиты, находящиеся на этом lane, отсортированные по rowIndex.
- Между каждой парой соседних коммитов на этом lane — continuous vertical line.

### Шаг 5. Рендер: ОДИН БОЛЬШОЙ SVG

Структура:
```
<td class="graph-cell" style="width: graphWidth">
  <svg width={graphWidth} height={rows.length * ROW_HEIGHT}
       viewBox={`0 0 ${graphWidth} ${rows.length * ROW_HEIGHT}`}
       overflow="visible">
    {/* 1. Все continuous vertical lines (same-lane) */}
    {continuousLines.map(line => <path d={buildPath(line)} stroke={line.color} />)}

    {/* 2. Все parent edges (diff-lane) */}
    {parentEdges.map(edge => <path d={buildPath(edge)} stroke={edge.color} />)}

    {/* 3. Все commit circles (поверх линий) */}
    {rows.map(row => <circle cx={...} cy={rowIndex * ROW_HEIGHT + ROW_HEIGHT/2} ... />)}
  </svg>
</td>
```

### Шаг 6. Routing линий (buildPath)

Для каждого edge:
- `fromY = commitRowIndex * ROW_HEIGHT + ROW_HEIGHT/2`  (центр коммита-источника)
- `toY = parentRowIndex * ROW_HEIGHT + ROW_HEIGHT/2`  (центр коммита-родителя)

Same-lane (fromLane === toLane):
- Прямая вертикаль: `M fromX fromY L fromX toY`

Diff-lane:
- S-curve cubic Bezier через midY:
- `midY = (fromY + toY) / 2`
- `M fromX fromY C fromX midY toX midY toX toY`

Без clamp — линия идёт ровно от коммита к родителю.

Continuous vertical line (между двумя соседними коммитами на одной lane):
- Прямая вертикаль: `M laneX (currentY + ROW_HEIGHT/2) L laneX (nextY + ROW_HEIGHT/2)`

## Что сделать

### Шаг 1. Переписать `computeLayout.ts`
Файл: `src/widgets/repo-graph-vertical/lib/computeLayout.ts`.

- Использовать алгоритм выше для assignment lanes.
- Вернуть `GraphLayout` с:
  - `rows: GraphRow[]` (каждый row имеет commit + lane + parents)
  - `continuousLines: GraphLine[]` (вертикали между соседними коммитами на одной lane)
  - `parentEdges: GraphLine[]` (кривые для diff-lane parent edges)
  - `width`, `height`
- Убрать `verticalLines` per row — заменить на continuousLines и parentEdges глобально.

### Шаг 2. Обновить `types.ts`
Файл: `src/widgets/repo-graph-vertical/types.ts`.

- `GraphRow` — содержит commit, lane, но без `verticalLines` (теперь они глобальные).
- `GraphLine` — `{ fromLane, toLane, fromY, toY, color }` (абсолютные координаты, не относительные).

### Шаг 3. Переписать `buildPath.ts`
Файл: `src/widgets/repo-graph-vertical/lib/buildPath.ts`.

- Принимает `fromX, fromY, toX, toY, fromLane, toLane, color`.
- Same-lane: `M fromX fromY L toX toY`.
- Diff-lane: `M fromX fromY C fromX midY toX midY toX toY` где `midY = (fromY + toY) / 2`.

### Шаг 4. Переписать `RepoGraphTable.tsx` и `CommitRow.tsx`

`RepoGraphTable.tsx`:
- Создаёт ОДИН SVG для всей graph column (вне `<table>`, или как абсолютно-позиционированный overlay поверх `<td>` колонки Graph).
- Реально: можно использовать `<svg>` внутри первого `<td>` (для колонки Graph) с `height = rows.length * ROW_HEIGHT`.
- Внутри SVG рендерим все continuousLines + parentEdges + circles.

`CommitRow.tsx`:
- Первая `<td>` (graph-cell) должна иметь `position: relative` и `height: ROW_HEIGHT`.
- SVG абсолютно позиционируется поверх всех `<td>` graph-cell в колонке.
- ИЛИ: переделать так, чтобы SVG был частью graph column header или отдельным слоем.

Проще: использовать **отдельный компонент `<GraphLayer>`** вне `<table>`, который позиционируется абсолютно поверх первой колонки. Внутри — один SVG со всеми линиями и кружками.

### Шаг 5. Удалить старые per-row SVG
В `CommitRow.tsx` убрать `<svg>` и все paths. Граф рендерится отдельно.

### Шаг 6. Тесты
- `buildPath.test.ts`: тесты на абсолютные координаты (fromY, toY могут быть любыми).
- `computeLayout.test.ts`: тесты на lane assignment (тот же алгоритм).
- `RepoGraph.test.tsx` или `RepoGraphTable.test.tsx`: тест что все линии рисуются в одном SVG.

### Шаг 7. Верификация
- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Storybook Dark — линии должны быть **непрерывными**, **скруглёнными** на углах, **без артефактов**.
- В реальной репе через `npm run dev`: открыть `stream-parser` или `git-pawl`, проверить:
  - Линии непрерывны.
  - Нет stub'ов ни сверху, ни снизу.
  - Углы скруглены.
  - Merge-edges корректно подходят к коммиту.
  - Под последним коммитом нет хвостов.

## Acceptance criteria
- [ ] Граф — **один большой SVG**, все линии и кружки в одном месте.
- [ ] Линии непрерывны между соседними коммитами на одной lane.
- [ ] Нет stub'ов / разрывов / лишних рёбер.
- [ ] Углы на lane-переходах скруглены (SourceTree-style).
- [ ] Merge-edges корректно соединяют коммит с родителями.
- [ ] Под последним коммитом нет хвостов.
- [ ] `npm run tsc` + `npx eslint` — без ошибок.
- [ ] Все тесты проходят.

## Зависит от
—

## Заметки
- Это **архитектурный рефакторинг**, не патч поверх предыдущих TASK. Удалить `verticalLines` из GraphRow.
- Один SVG для всего графа — убирает все проблемы с per-row overflow и z-index.
- AGENTS.md: стрелочные функции, типы в `types.ts`, без комментариев в коде, без enum.
- Зафиксировать в TASK как принятый алгоритм — этот паттерн (один SVG + абсолютные координаты) правильный для git graph.

## Статус: DONE — один большой SVG на всю graph column, абсолютные координаты, DAG-алгоритм lane-assignment

### Что сделано
- Переписан `computeLayout.ts`: добавлен правильный DAG-алгоритм lane-assignment (single pass, newest→oldest, с `activeLanes: Map<hash, laneIndex>`); `verticalLines` per row удалён, layout теперь возвращает глобальные `continuousLines: GraphLine[]` (вертикали между соседними коммитами на одной lane) и `parentEdges: GraphLine[]` (S-кривые для diff-lane parent edges). Координаты — абсолютные (`fromY`/`toY` в px, не относительные).
- `GraphLine` упрощён: убрано `direction`/`rowDistance`, добавлены `fromY`/`toY` — теперь это абсолютные координаты.
- `GraphRow.verticalLines` удалено — больше нет per-row SVG.
- Переписан `buildPath.ts`: same-lane — `M fromX fromY L toX toY`; diff-lane — cubic Bezier `M fromX fromY C fromX midY toX midY toX toY` где `midY = (fromY+toY)/2`. Никаких clamp'ов — координаты абсолютные.
- Создан новый компонент `GraphLayer.tsx`: рендерит ОДИН `<svg width={width} height={height} viewBox={...} style={{ position: 'absolute', top: 0, left: 0 }}>` для всего графа. Внутри — continuous lines → parent edges → commit circles (в этом порядке, чтобы кружки были поверх). Halo для selected commit рендерится рядом с кружком.
- `CommitRow.tsx` — убран per-row SVG, в graph `<td>` теперь только spacer; опциональный проп `graphOverlay?: ReactNode` позволяет прокинуть overlay для первой строки.
- `RepoGraphTable.tsx` — прокидывает `<GraphLayer>` в первую строку через `graphOverlay`; SVG живёт внутри первой `<td>`, позиционируется `absolute: top:0, left:0`, высота = `layout.height` (покрывает все строки тела). При scroll'е SVG скроллится вместе с телом (т.к. находится внутри scrolling content), оставаясь выровненным.
- Тесты:
  - `buildPath.test.ts` (6 тестов): same-lane M+L, diff-lane cubic Bezier, midY=(fromY+toY)/2, абсолютные координаты без clamp'а, degenerate-кейсы.
  - `computeLayout.test.ts` (13 тестов): lane assignment (включая merge-кейсы), continuousLines между соседними same-lane, parentEdges, абсолютные y-координаты, current-branch active marking, нет overflow past last commit, no edges для parents вне видимого набора.
  - `GraphLayer.test.tsx` (4 теста, новый): один SVG содержит все lines + circles, halo только для selected, абсолютные координаты в path d.

### Acceptance criteria (отметить выполненные)
- [x] Граф — один большой SVG, все линии и кружки в одном месте.
- [x] Линии непрерывны между соседними коммитами на одной lane.
- [x] Нет stub'ов / разрывов / лишних рёбер.
- [x] Углы на lane-переходах скруглены (SourceTree-style) — cubic Bezier с одним `C`.
- [x] Merge-edges корректно соединяют коммит с родителями.
- [x] Под последним коммитом нет хвостов.
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] Все тесты проходят (192/192 в общем, 33/33 в widget).

### Заметки для ревьюера
- Один SVG рендерится **внутри первой `<tr>`** первой строки (через проп `graphOverlay`), позиционируется `absolute` относительно `<td>`. Так SVG живёт внутри scrolling content и корректно скроллится вместе с телом таблицы. Альтернатива (отдельный overlay-div над таблицей) не подошла бы — `position: absolute` не скроллится с контентом.
- При смене ширины графа через `<colgroup>` ширина SVG подстраивается: `RepoGraphTable` вычисляет `graphWidth = max(MIN_COLUMN_WIDTHS.graph, columnWidths.graph ?? layout.width)` и передаёт его в GraphLayer через `layout.width`. Если пользователь ресайзит колонку до значения меньше `layout.width`, используется минимум `MIN_COLUMN_WIDTHS.graph = 80px`.
- Halo для selected commit рисуется как отдельный `<circle>` с `stroke-opacity=0.4` внутри той же `<g>` что и кружок коммита — вынесен в DOM-тест, чтобы убедиться, что только один halo рисуется для selectedHash.
- В Storybook `widgets/RepoGraph Dark` визуально подтверждено: один SVG (120×320, viewBox `0 0 120 320`) покрывает все 10 строк, пути используют абсолютные координаты (`M 16 16 L 16 48`), S-кривые на lane-переходах (cubic Bezier), halo вокруг выбранного коммита.