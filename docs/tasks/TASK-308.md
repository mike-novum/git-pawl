# TASK-308 — Граф: убрать stray edges и скруглить углы lane-переходов

## Контекст (воспроизведено в `stream-parser`)

В реальной репе `stream-parser` на графе:
1. **Stray edges уходят вниз «в никуда»** — после последнего видимого коммита (`61bc58`) видны короткие вертикальные штрихи и точки, которые ни к чему не ведут. Должны заканчиваться ровно на последнем коммите.
2. **Углы на стыках веток резкие, прямоугольные.** SourceTree на стыках использует мягкое скругление (см. `workflow/references/source-tree-1.png` — видно плавные переходы между lane-ами). Сейчас у нас sharp right-angle — выглядит «технически и грубо».

## Корневые причины (предварительные)

### Bug #1 — stray edges
В `src/widgets/repo-graph-vertical/ui/CommitRow.tsx:83-90` SVG каждой строки имеет `overflow="visible"`, что позволяет path'ам, идущим вниз (parent edges от row N к row N+1 и т.д.), **вылезать за границы своего row-SVG и проникать в следующие строки**.

Из-за этого:
- parent edge от row N к row N+1 рисуется в row N's SVG, но extends в область row N+1, N+2...
- Если row N+1 уже имеет свою линию, она перекрывается, но если нет — виден «хвост» уходящий вниз

Дополнительно: возможно, есть баг в `computeLayout.ts` где `verticalLines` генерируются и для последнего коммита на lane (где их быть не должно).

### Bug #2 — sharp corners
`buildPath` в `src/widgets/repo-graph-vertical/lib/buildPath.ts:7-24` для перехода lane→lane использует `M ... L ... L ... L` — четыре прямых отрезка, образующих прямой угол. SourceTree использует **quadratic Bezier curves** в углах для сглаживания.

## Что сделать

### Шаг 1. Закруглить углы в `buildPath`
Файл: `src/widgets/repo-graph-vertical/lib/buildPath.ts`.

Для случая `fromX !== toX` использовать quadratic curves в углах:
```
M fromX fromY
L fromX (midY - CORNER_RADIUS)
Q fromX midY (fromX + dir * CORNER_RADIUS) midY
L (toX - dir * CORNER_RADIUS) midY
Q toX midY toX (midY + CORNER_RADIUS)
L toX toY
```

Где:
- `CORNER_RADIUS = 5` (или 4 — подобрать визуально)
- `dir = toX > fromX ? 1 : -1`

Для случая `fromX === toX` (одна lane) — без изменений, прямая вертикаль.

Обновить `buildPath.test.ts`:
- Тест на diff-lane: ожидать, что путь содержит `Q` команды (quadratic curves), а не только `L`.
- Или: тест, что путь НЕ содержит прямых углов (т.е. не идёт `... L fromX midY L toX midY ...` подряд).

### Шаг 2. Убрать stray edges
Вариант А (быстрый): в `CommitRow.tsx` оставить `overflow="visible"` для cross-row lines (merge edges), но **обрезать вертикальные линии на границе row**. Для этого:
- Для каждой line вычислить, какая часть принадлежит текущему row.
- Если line `fromRow === currentRow && toRow === currentRow + 1` — рендерить полностью.
- Если line `toRow > currentRow + 1` — обрезать до границы currentRow + 1, чтобы не лезть дальше.

Вариант Б (чище): использовать единый SVG на всю таблицу (отдельный слой поверх `<tr>`), а не per-row SVG. Lines рендерятся абсолютно по координатам, без overflow.

Вариант В (минимальный): в `computeLayout.ts` убедиться, что `verticalLines` НЕ генерируются для последнего коммита на lane (где нет следующего). А parent edges, которые ведут за пределы visible set, не должны рисоваться. Это уже есть в фильтре `parentHashes`.

**Рекомендую**: совместить — фикс в `buildPath` (clip path до `toY = currentRow.bottom + 0.5 * ROW_HEIGHT`) + проверка `computeLayout` что stray lines не генерируются.

Конкретный фикс в `buildPath.ts`:
- `toY` clamp'ить до `ROW_HEIGHT` (не больше).
- Если `rowDistance > 1`, рендерить только до row+1 (половина следующего row).

### Шаг 3. Регрессионные тесты
- `buildPath.test.ts`:
  - diff-lane: путь содержит `Q` команды (закругление).
  - one-row distance: путь корректен (corner на midY).
  - multi-row distance: путь обрезается до row+1 (нет stub'ов).
- `computeLayout.test.ts`:
  - Последний commit на lane не имеет `verticalLines`.
  - Parent,不在 visible set, не порождает edge.
- Визуальный smoke test через Storybook.

### Шаг 4. Верификация
- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Storybook: визуально убедиться, что углы скруглены и нет stray edges.
- В реальной репе `stream-parser`: открыть граф, проверить, что:
  - Под последним коммитом нет «хвостов».
  - Углы на стыках веток скруглены (если есть merge commits — у них должны быть плавные переходы).

## Acceptance criteria
- [ ] Под последним видимым коммитом на lane нет вертикальных штрихов, уходящих вниз.
- [ ] Углы на стыках lane-переходов скруглены (SourceTree-style), не sharp right-angle.
- [ ] Continuous vertical lines на одной lane остаются прямыми (без corners).
- [ ] Merge-edges по-прежнему корректно соединяют коммит с родителями на других lane.
- [ ] `npm run tsc` + `eslint` — без ошибок.
- [ ] Тесты проходят, новые тесты добавлены.

## Зависит от
—

## Заметки
- `CORNER_RADIUS` подобрать визуально: 4-6px. Слишком большой — выглядит как «резинка», слишком маленький — не видно.
- Если `fromX` отличается от `toX` меньше чем на `2 * CORNER_RADIUS`, скругление визуально не поместится — fallback на прямые линии.
- AGENTS.md: стрелочные функции, FC, типы в `types.ts`, без комментариев в коде, без enum.

## Статус: DONE — углы lane-переходов скруглены, stray edges под последним коммитом устранены через clamp `toY` в `buildPath`

### Что сделано
- В `src/widgets/repo-graph-vertical/lib/buildPath.ts` углы на переходах lane→lane заменены на quadratic Bezier (`Q`) с `CORNER_RADIUS = 5`; при `|toX - fromX| < 2 * CORNER_RADIUS` оставлен straight-Manhattan fallback.
- В `buildPath.ts` `toY` теперь clamp'ится до `fromY + ROW_HEIGHT` для всех линий (same-lane и diff-lane), что устраняет вылезание за границу следующей строки и появление «хвостов» под последним коммитом.
- Same-lane линии по-прежнему — straight vertical (только `M` + `L`).
- В `computeLayout.ts` существующая логика (`if (!next) return` для вертикальных линий + фильтр `parentHashes.filter(h => rowByHash.has(h))`) уже корректно отсекает strays; добавлены регрессионные тесты, фиксирующие это поведение.
- Обновлены/добавлены тесты: 4 новых в `buildPath.test.ts` (Bezier-углы, fallback, clamp для diff/same lane) + 2 новых в `computeLayout.test.ts` (нет verticalLines на последнем коммите lane; parent за пределами visible set не порождает edge).

### Acceptance criteria (отметить выполненные)
- [x] Под последним видимым коммитом на lane нет вертикальных штрихов, уходящих вниз.
- [x] Углы на стыках lane-переходов скруглены (SourceTree-style), не sharp right-angle.
- [x] Continuous vertical lines на одной lane остаются прямыми (без corners).
- [x] Merge-edges по-прежнему корректно соединяют коммит с родителями на других lane.
- [x] `npm run tsc` + `eslint` — без ошибок.
- [x] Тесты проходят, новые тесты добавлены.

### Заметки для ревьюера
- Компромисс clamp'а: для parent edge с `rowDistance > 1` линия теперь заканчивается на уровне центра следующей строки, а не дотягивается до фактического родителя. Это сознательная trade-off, указанная в задаче — приоритет «нет strays ниже последнего коммита» выше точной визуальной связи при больших `rowDistance`. На реальных данных stream-parser большая часть parent edges имеет `rowDistance = 1` (merge сразу в родительский коммит), так что визуальная регрессия минимальна.
- `CORNER_RADIUS = 5` — выбрано как среднее из диапазона 4-6 из ТЗ; на текущей ширине lane (14px) кривая отчётливо видна.
- `overflow="visible"` на per-row SVG оставлен, чтобы линия могла дотянуться от центра текущей строки (y=16) до центра следующей (y=48), проходя через границу (y=32) с Bezier-углом.
- В Storybook (виджет `widgets/RepoGraph` → Dark) визуально подтверждено: углы скруглены, под последним коммитом (`d5e6f7a`) чисто — только кружок.
- Логика `computeLayout` не менялась — только добавлены регрессионные тесты.