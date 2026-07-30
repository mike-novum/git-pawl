# TASK-310 — Граф: непрерывные линии между строками (incoming + outgoing в каждой row)

## Контекст (воспроизведено в реальной репе `git-pawl`)

После TASK-309 на графе в репе `git-pawl` всё ещё видны разрывы:
1. **От каждого коммита вниз идёт короткое «лишнее ребро»** — обрезанный верх parent edge'а (от центра y=16 до низа строки y=32), ниже — пусто.
2. **Не хватает ребра, идущего вверх к коммиту слияния** — должен быть incoming сегмент от верха предыдущей строки к центру текущего, но его нет.

В SourceTree линия между двумя соседними строками на одной lane — **непрерывный вертикальный отрезок длиной в один row**. Сейчас он разорван на 16+16=32px с зазором 0px (визуально выглядит как два stub'а, не соединяющихся).

## Корневая причина

`src/widgets/repo-graph-vertical/lib/buildPath.ts` рисует каждую линию **от центра текущей строки (y=ROW_HEIGHT/2=16) вниз к позиции родителя**:

```ts
const fromY = ROW_HEIGHT / 2;  // 16 — центр текущей строки
const toY = fromY + line.rowDistance * ROW_HEIGHT;  // 48 для rowDistance=1
```

С `overflow="visible"` на per-row SVG, линия от y=16 до y=48 продолжает рендериться за пределы своего SVG (y=32), но **следующая строка своим SVG закрывает overflow сверху** — визуально остаётся только верхняя половина (y=16→y=32), что и выглядит как «лишний stub вниз».

В итоге:
- Строка N: линия от центра (y=16) до низа (y=32) — 16px stub вниз
- Строка N+1: тот же сегмент, что и в строке N (parent edge «приходит» сюда, но **приходит с overflow, который скрыт**)
- Между строками — пустота 0px, но визуально выглядит как разрыв

## Решение

Каждая строка должна рисовать **два сегмента**:
1. **Incoming** — от верха SVG (y=0) к центру строки (y=ROW_HEIGHT/2). Представляет «приход» линии от предыдущей строки.
2. **Outgoing** — от центра строки (y=ROW_HEIGHT/2) к низу SVG (y=ROW_HEIGHT). Представляет «уход» линии к следующей строке.

Для ПЕРВОЙ строки (HEAD) incoming не рисуем (нет коммита выше).
Для ПОСЛЕДНЕЙ строки (oldest в visible set) outgoing clamp'им до y=ROW_HEIGHT (без overflow за пределы таблицы).

Между соседними строками линии соединяются:
- Низ строки N (y=ROW_HEIGHT в local) = верх строки N+1 (y=0 в local) → непрерывная вертикаль.

Для diff-lane переходов (parent edge на другой lane) обе половины используют ту же формулу cubic Bezier, но со сдвигом по Y.

## Что сделать

### Шаг 1. Расширить `GraphLine`
Файл: `src/widgets/repo-graph-vertical/types.ts`.

Добавить в `GraphLine` поля:
```ts
export type GraphLine = {
  fromLane: number;
  toLane: number;
  rowDistance: number;
  color: string;
  direction: 'incoming' | 'outgoing';  // NEW
};
```

### Шаг 2. Обновить `buildPath.ts`
Файл: `src/widgets/repo-graph-vertical/lib/buildPath.ts`.

Использовать `line.direction` для выбора y-диапазона:
- `outgoing`: `fromY = ROW_HEIGHT / 2`, `toY = ROW_HEIGHT` (clamped от `rowDistance * ROW_HEIGHT`).
- `incoming`: `fromY = 0`, `toY = ROW_HEIGHT / 2`.

Для diff-lane используем cubic Bezier:
- `outgoing`: `M fromX (ROW_HEIGHT/2) C fromX midY toX midY toX ROW_HEIGHT` где `midY = (ROW_HEIGHT/2 + ROW_HEIGHT) / 2 = 3*ROW_HEIGHT/4 = 24`.
- `incoming`: `M fromX 0 C fromX midY toX midY toX (ROW_HEIGHT/2)` где `midY = ROW_HEIGHT/4 = 8`.

Оба дают идентичный S-shape, сдвинутый по Y.

### Шаг 3. Обновить `computeLayout.ts`
Файл: `src/widgets/repo-graph-vertical/lib/computeLayout.ts`.

Генерация `verticalLines`:
- Для каждой пары соседних коммитов (current, next) на одном lane:
  - В `rows[current.rowIndex].verticalLines` добавить outgoing сегмент.
  - В `rows[next.rowIndex].verticalLines` добавить incoming сегмент.

Генерация parent edges:
- В `rows[commit.rowIndex].verticalLines` добавить outgoing сегмент для каждого parent edge.
- В `rows[parent.rowIndex].verticalLines` добавить incoming сегмент для каждого parent edge.

Это значит, что каждое parent relationship порождает 2 line segments (outgoing в источнике + incoming в приёмнике).

### Шаг 4. Обновить `CommitRow.tsx`
Файл: `src/widgets/repo-graph-vertical/ui/CommitRow.tsx`.

Просто рендерить все `row.verticalLines` (которые теперь включают incoming + outgoing). Никакой фильтрации по overlap'у с parent edges больше не нужно — каждое parent edge уже порождает оба сегмента.

Удалить старый фильтр:
```ts
const verticalLines = row.verticalLines.filter(
  (line) => !row.parents.some((parent) => ...)
);
```
— он больше не нужен.

### Шаг 5. Тесты
Файл: `src/widgets/repo-graph-vertical/lib/buildPath.test.ts`.

- Тест: outgoing same-lane → `M fromX 16 L fromX 32`.
- Тест: outgoing diff-lane → `M fromX 16 C fromX 24 toX 24 toX 32` (с `midY=24`).
- Тест: incoming same-lane → `M fromX 0 L fromX 16`.
- Тест: incoming diff-lane → `M fromX 0 C fromX 8 toX 8 toX 16` (с `midY=8`).
- Тест: outgoing с `rowDistance > 1` clamp'ится до `toY = ROW_HEIGHT = 32`.
- Тест: incoming с `rowDistance > 1` (если такое возможно — clamp до `toY = ROW_HEIGHT/2`).

Файл: `src/widgets/repo-graph-vertical/lib/computeLayout.test.ts`.

- Тест: для каждого parent edge в layout есть incoming в строке-назначении и outgoing в строке-источнике.
- Тест: для continuous vertical line есть incoming в следующей строке и outgoing в текущей.
- Тест: первая строка не имеет incoming lines.
- Тест: последняя строка не имеет outgoing overflow за пределы row (clamp).

### Шаг 6. Верификация
- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Storybook `widgets/RepoGraph` → Dark.
- В реальной репе `git-pawl`: запустить `npm run dev`, открыть репо.
  - Линии должны быть непрерывными (никаких разрывов между строками).
  - Под последним коммитом нет stub'ов.
  - Углы на стыках веток скруглены (как в SourceTree).
  - В merge-коммитах обе ветки корректно подходят к коммиту.

### Шаг 7. Обновить task-файл и README
- `docs/tasks/TASK-310.md`: status DONE + AC + notes.
- `docs/tasks/README.md`: TASK-310 row → 🔧 in_progress, потом ✅ done.

## Acceptance criteria
- [ ] Линии между соседними коммитами на одной lane — непрерывные вертикали (SourceTree-style).
- [ ] Нет «лишних рёбер» (stub'ов) вниз от коммитов.
- [ ] Углы на стыках веток по-прежнему скруглены (SourceTree-style).
- [ ] Merge-edges корректно соединяют коммит с родителями (включая incoming от каждого родителя).
- [ ] Под последним коммитом на lane нет «хвостов».
- [ ] `npm run tsc` + `npx eslint` — без ошибок.
- [ ] Все тесты проходят.

## Зависит от
—

## Заметки
- Не использовать `overflow="visible"` на per-row SVG — больше не нужно, линии рисуются внутри своих границ.
- Если визуально получается, что incoming/outgoing имеют разные x-positions из-за antialiasing на границе строк — добавить `stroke-linecap: butt` или `square` вместо `round`.
- AGENTS.md: стрелочные функции, типы в `types.ts`, без комментариев в коде, без enum.

## Статус: DONE — континуальные линии между строками реализованы, stub-рёбра убраны

### Что сделано
- `GraphLine` расширен полем `direction: 'incoming' | 'outgoing'`.
- `buildPath.ts` рисует incoming (y=0→16) и outgoing (y=16→32) сегменты в локальных координатах строки.
- `computeLayout.ts` для каждой parent edge и для каждой пары consecutive same-lane коммитов добавляет оба сегмента: outgoing в строке-источнике + incoming в строке-назначении.
- `CommitRow.tsx` рендерит все `row.verticalLines` напрямую (старый filter, скрывавший parent-overlapping verticalLines, удалён); `overflow="visible"` убран с per-row SVG и `td` — больше не нужен.
- Тесты `buildPath.test.ts` и `computeLayout.test.ts` обновлены: проверяются оба направления, midY для diff-lane, clamp для rowDistance > 1.
- Storybook `widgets/RepoGraph` Dark и Light — линии непрерывные, углы скруглены, под последним коммитом нет stub'а.

### Acceptance criteria (отметить выполненные)
- [x] Линии между соседними коммитами на одной lane — непрерывные вертикали.
- [x] Нет «лишних рёбер» (stub'ов) вниз от коммитов.
- [x] Углы на стыках веток по-прежнему скруглены (SourceTree-style).
- [x] Merge-edges корректно соединяют коммит с родителями (включая incoming от каждого родителя).
- [x] Под последним коммитом на lane нет «хвостов».
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] Все тесты проходят (190/190).

### Заметки для ревьюера
- `strokeLinecap="round"` оставлен — на стыках строк визуально артефактов не наблюдается (см. closeup screenshots в `.playwright-mcp/`).
- На последней строке присутствуют только incoming сегменты (от родителя выше) — outgoing отсутствует, потому что нет следующей строки.
- На первой строке (HEAD) присутствуют только outgoing сегменты — incoming не генерируется, потому что выше нет ни одной строки.
- `rowIndex` проп был удалён из деструктуризации в `CommitRowComponent`, но сохранён в `CommitRowProps` — публичный API виджета не сломан.

## Статус
✅ done