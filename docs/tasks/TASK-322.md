# TASK-322 — Граф: hover-скейл только на наведённом коммите

## Контекст

Из фидбэка пользователя (roadmap-9, баг #4): при наведении на последний коммит в графе кругляши (точки-коммиты, рисуются через SVG) увеличиваются у всех коммитов, а не только у наведённого.

## Корневая причина

Файл: `src/widgets/repo-graph-vertical/ui/GraphLayer.tsx:76`.

```tsx
<circle
  ...
  className="[transform-box:fill-box] origin-center transition-transform duration-fast ease-out group-hover:scale-[1.2]"
  ...
/>
```

`group-hover:scale-[1.2]` — Tailwind класс, который активируется при hover любого элемента с классом `group` внутри родителя.

Сейчас `group` стоит на `<tr>` (`src/widgets/repo-graph-vertical/ui/CommitRow.tsx:54`). На каждой `<tr>` есть свой `group`, и кружок этой строки должен скейлиться при hover этой `<tr>`.

**Проблема:** SVG `<circle>` с `transform-box: fill-box` технически работает, но если на разных `<tr>` кружки разделяют один и тот же `<svg>` (через позиционирование)... Подожди, посмотрим — каждая `<tr>` имеет свой SVG-overley (`graphOverlay`)? Или один общий SVG?

Из `GraphLayer.tsx` — `<svg>` рендерится ОДИН раз сразу для всех строк (`rows.map`). То есть `GraphLayer` — один SVG слой сверху, и каждая `<tr>` ссылается на свой lane через абсолютное позиционирование, но `graphOverlay` (`<CommitRow>` td) — это пустая `<td>` заданной ширины, а ВСЕ `<circle>` лежат в одном `<svg>`.

**Из-за этого `group-hover:scale-[1.2]` ломается:** Tailwind `group-hover` срабатывает на любом hover родителя с `group`. Поскольку `<svg>` общий, и `group` на каждой `<tr>` отдельный, но скругления применяются ко ВСЕМ `<circle>` сразу при hover любой `<tr>`? Нет, скейл применяется к `<circle>` который находится внутри `<tr>` с `group`. Технически `<circle>` не находится внутри `<tr>` — он в общем `<svg>`.

**Итог:** `group-hover` фактически ни на что не реагирует (или реагирует всегда, потому что `<svg>` общий и не имеет `group`). Это объясняет баг: "scale меняется у всех коммитов".

## Что сделать

### Шаг 1. Перенести hover на `<circle>` напрямую

Файл: `src/widgets/repo-graph-vertical/ui/GraphLayer.tsx`:
- Заменить `group-hover:scale-[1.2]` на `hover:scale-[1.2]` (хотя SVG `<circle>` имеет свой `:hover`).
- Добавить класс `hover:cursor-pointer` (опционально).
- Если `:hover` не работает на `<circle>` в SVG — обернуть `<circle>` в `<g>` с hover-handler или использовать React state.

### Шаг 2. Альтернатива: React state

Если CSS hover не работает — использовать `useState` для `hoveredRowIndex` в `GraphLayer.tsx` или `RepoGraphTable.tsx`, на `<tr>` повесить `onMouseEnter`/`onMouseLeave`, передать `hoveredIndex` в `GraphLayer`, в SVG увеличивать `r` (или `transform: scale`) только для нужного `<circle>`.

Файл: `src/widgets/repo-graph-vertical/types.ts`:
- Добавить `hoveredRowIndex?: number | null` в `GraphLayerProps`.

Файл: `src/widgets/repo-graph-vertical/ui/RepoGraphTable.tsx`:
- `const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null)`.
- На `<tr>` повесить `onMouseEnter={() => setHoveredRowIndex(rowIndex)} onMouseLeave={() => setHoveredRowIndex(null)}`.
- Передать `hoveredRowIndex` в `<GraphLayer />`.

Файл: `src/widgets/repo-graph-vertical/ui/GraphLayer.tsx`:
- В `rows.map` проверить `if (rowIndex === hoveredRowIndex) r = NODE_RADIUS * 1.2 else r = NODE_RADIUS`.
- Или через `transform: scale(...)` с `transform-origin: center`.

### Шаг 3. Тесты

Файл: `src/widgets/repo-graph-vertical/ui/GraphLayer.test.tsx` (обновить):
- Тест: hover на строку 2 увеличивает только `<circle>` для этой строки (через `r` или `transform`).
- Использовать `fireEvent.mouseEnter` / `fireEvent.mouseLeave`.

### Шаг 4. Верификация

- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Storybook / Dev: hover на один коммит — увеличивается ТОЛЬКО он.

## Acceptance criteria

- [ ] При hover на одну строку увеличивается ровно один `<circle>` (только этот коммит).
- [ ] При выходе курсора — кружок возвращается к нормальному размеру.
- [ ] Никаких глобальных эффектов на другие коммиты.
- [ ] `npm run tsc` + `npx eslint` — без ошибок.
- [ ] `npm test` — без новых fallов.

## Зависит от
—

## Заметки

- Предпочтительно переделать на React state (Step 2) — это надёжнее CSS hover для SVG.
- Не использовать `group-hover` на общем `<svg>`.

## Статус: DONE — hover-скейл теперь только на наведённом коммите

### Что сделано
- В `GraphLayerProps` добавлен `hoveredRowIndex?: number | null`.
- В `RepoGraphTable` добавлен `useState<number | null>` + `handleRowMouseEnter` / `handleRowMouseLeave`, хэндлеры прокидываются в `<CommitRow>`, `hoveredRowIndex` передаётся в `<GraphLayer>`.
- В `<CommitRow>` добавлены опциональные `onMouseEnter` / `onMouseLeave` (типы вынесены в `types.ts`).
- В `GraphLayer` убран `group-hover:scale-[1.2]`; вместо CSS hover через общий `<svg>` используется `r` (NODE_RADIUS vs HOVERED_NODE_RADIUS) с `transition-[r]`.
- Тесты `GraphLayer.test.tsx` и `RepoGraphTable.test.tsx` обновлены: hover на строку увеличивает ровно один `<circle>`, mouse leave — сбрасывает.

### Acceptance criteria (отметить выполненные)
- [x] При hover на одну строку увеличивается ровно один `<circle>` (только этот коммит).
- [x] При выходе курсора — кружок возвращается к нормальному размеру.
- [x] Никаких глобальных эффектов на другие коммиты.
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] `npm test` — без новых fallов (37 файлов / 245 тестов passed).

### Заметки для ревьюера
- Подход через React state (`hoveredRowIndex`) — надёжнее CSS hover для SVG, как и рекомендовано в TASK-322.
- `group-hover` полностью убран из общего `<svg>`; класс `group` остался на `<tr>` для подсветки строки.
- В `RepoGraphTable.tsx` хэндлеры `handleRowMouseEnter` / `handleRowMouseLeave` объявлены стрелочными функциями в `useState`-блоке, чтобы не пересоздавать функции на каждом рендере и при этом не плодить `useCallback`.
