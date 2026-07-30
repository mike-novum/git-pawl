# TASK-309 — Граф: заменить разорванный curve на SourceTree-style S-curve

## Контекст
После TASK-308 на графе в репе `git-pawl` ребра на lane-переходах выглядят **разорванно**:
- Текущая реализация: два Q-curve в углах + короткий прямой горизонтальный сегмент между ними.
- `LANE_WIDTH = 14px`, `CORNER_RADIUS = 5px` → между curves остаётся только `14 - 2*5 = 4px` прямого горизонтального сегмента.
- Визуально: вертикаль обрывается, потом маленький горизонтальный кусок, потом обрыв — выглядит как «штрих-пунктир».

В SourceTree (см. `workflow/references/source-tree-1.png`) lane-переход — это **плавный S-curve** одним непрерывным path, без разрывов.

## Корневая причина
`src/widgets/repo-graph-vertical/lib/buildPath.ts` использует **два отдельных quadratic Bezier** (Q) для верхнего и нижнего углов + L-сегмент между ними. При малой ширине lane и большом radius относительный размер straight segment становится пренебрежимо малым, и линия визуально «рвётся».

## Что сделать

### Шаг 1. Заменить два Q на один C (cubic Bezier)
Файл: `src/widgets/repo-graph-vertical/lib/buildPath.ts`.

Для случая `fromX !== toX` использовать **один cubic Bezier с вертикальными control points**:

```
M fromX fromY
C fromX midY toX midY toX toY
```

Где:
- Start: `(fromX, fromY)` — текущая строка, текущий lane
- Control 1: `(fromX, midY)` — control ниже по вертикали, на текущем lane
- Control 2: `(toX, midY)` — control выше по вертикали, на целевом lane
- End: `(toX, toY)` — следующая строка, целевой lane

Это даёт плавный S-curve, как в SourceTree.

Для случая `fromX === toX` — без изменений (прямая вертикаль).

`CORNER_RADIUS` больше не нужен — убираем. `toY` clamp до `fromY + ROW_HEIGHT` оставляем (для защиты от `rowDistance > 1`).

### Шаг 2. Fallback для узких lane diff
Если `|toX - fromX| < LANE_WIDTH` (маленькая разница lane), cubic Bezier всё равно даст плавный S-curve. Проверить визуально, что нет необходимости в fallback.

### Шаг 3. Тесты
Файл: `src/widgets/repo-graph-vertical/lib/buildPath.test.ts`.

- Тест: diff-lane path содержит **одну** `C` команду (cubic Bezier) и **не содержит** `Q`.
- Тест: same-lane path содержит только `M` и `L`.
- Тест: `toY` clamp'ится до `fromY + ROW_HEIGHT` для `rowDistance > 1` (same-lane и diff-lane).
- Тест: для `rowDistance = 1` корректный путь с одним `C` и `midY = fromY + ROW_HEIGHT/2`.
- Тест: для `rowDistance = 0` (защитный) путь degenerated, но не ломает рендер.

### Шаг 4. Storybook / dev verification
- Storybook `widgets/RepoGraph` → Dark.
- Проверить:
  - Углы плавные (нет разрывов).
  - Все lane-переходы выглядят как непрерывная линия.
  - Same-lane линии — прямые вертикали (без изменений).
  - Continuous vertical lines на одной lane соединяются без зазоров.

### Шаг 5. Реальный репо
Если возможно — открыть репо `git-pawl` или `stream-parser` через `npm run dev` и убедиться:
- Линии непрерывны (нет видимых разрывов).
- Углы выглядят как SourceTree.
- Под последним коммитом нет «хвостов».

### Шаг 6. Обновить task-файл и README
- `docs/tasks/TASK-309.md`: status DONE + AC + notes.
- `docs/tasks/README.md`: TASK-309 row → 🔧 in_progress, потом ✅ done.

## Acceptance criteria
- [x] Lane-переходы выглядят как непрерывный S-curve (SourceTree-style).
- [x] Нет видимых разрывов между вертикальной частью и горизонтальным поворотом.
- [x] Same-lane линии остаются прямыми вертикалями (без изменений).
- [x] Continuous vertical lines корректно соединяются между соседними коммитами на одном lane.
- [x] Под последним коммитом на lane нет «хвостов».
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] Все тесты проходят, новые тесты добавлены.

## Зависит от
—

## Заметки
- Убрать `CORNER_RADIUS` из `buildPath.ts` — больше не используется.
- Если cubic Bezier в Storybook выглядит слишком «резиновым» — попробовать control points не строго на `midY`, а на 1/3 и 2/3 высоты row (т.е. `fromY + ROW_HEIGHT/3` и `toY - ROW_HEIGHT/3`).
- AGENTS.md: стрелочные функции, типы в `types.ts`, без комментариев в коде, без enum.

## Статус: DONE — заменены два Q-curve на единый cubic Bezier, smooth S-curve как в SourceTree

### Что сделано
- `src/widgets/repo-graph-vertical/lib/buildPath.ts`: удалена константа `CORNER_RADIUS` и её Manhattan-fallback для узких lane diff; для diff-lane теперь один `C` cubic Bezier с вертикальными control points на `midY`. Same-lane — без изменений (`M + L`). Сохранён clamp `toY` до `fromY + ROW_HEIGHT`.
- `src/widgets/repo-graph-vertical/lib/buildPath.test.ts`: переписаны тесты под новую формулу — проверки на ровно одну `C`, отсутствие `Q`, корректный `midY = fromY + ROW_HEIGHT/2`, клампы для same-lane и diff-lane при `rowDistance > 1`, защитный кейс `rowDistance = 0`.
- `docs/tasks/README.md`: TASK-309 🔧 in_progress → ✅ done.

### Acceptance criteria (отметить выполненные)
- [x] Lane-переходы выглядят как непрерывный S-curve (SourceTree-style).
- [x] Нет видимых разрывов между вертикальной частью и горизонтальным поворотом.
- [x] Same-lane линии остаются прямыми вертикалями (без изменений).
- [x] Continuous vertical lines корректно соединяются между соседними коммитами на одном lane.
- [x] Под последним коммитом на lane нет «хвостов».
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] Все тесты проходят, новые тесты добавлены.

### Заметки для ревьюера
- Удалён fallback для `laneDiff < 2 * CORNER_RADIUS` (был straight Manhattan). С новой cubic Bezier все lane-diff'ы дают плавный S-curve, включая fractional lanes — отдельный fallback больше не нужен.
- Тест на `rowDistance = 0` проверяет, что путь остаётся валидным `M ... C ...` без падений рендера (контрольные точки схлопываются, но path синтаксически корректен).
- В Storybook Dark на `widgets/RepoGraph` подтверждено визуально: lane-переходы — плавные S-curve'ы без штрих-пунктира; DOM-инспекция показала корректный path вида `M 16 16 C 16 32 30 32 30 48`. `Q` команд нет, fallback на L-цепочку не задействован.
- Стиль соблюдён: стрелочные функции, `LANE_WIDTH` импортируется (используется внутри `laneCenter`), без комментариев, без enum.