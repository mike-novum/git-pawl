# TASK-307 — Граф коммитов: фикс связей, phantom-коммит, SourceTree-style рендер и табличный layout

## Контекст (воспроизведено в реальной репе `lmm-docs`)
В реальной репе `lmm-docs`:
1. **Между коммитами нет линий.** Все коммиты отображаются как изолированные точки, граф выглядит как список.
2. **Phantom `(no subject) · 20654d ago`** (Unix epoch = 0, `parents: 0`, `lane: 0`) — побочный эффект бага парсера.
3. **Двухстрочный лейаут тратит место** — нужно компактнее.

Дополнительно (см. `workflow/references/source-tree-{1,2}.png`): хочется приблизить качество рендера к SourceTree — table layout с resizable columns, lane-цвета per branch, Manhattan-routing для линий.

## Корневые причины

### Bug #1 — нет линий между коммитами
`electron/main/services/git/parser.ts:169`, `parseLog` использует `git log --format=%H\x1f%P\x1e -z`. С флагом `-z` git вставляет `\0` МЕЖДУ коммитами (а не только между полями внутри коммита). Парсер split'ит только по `\x1e`, поэтому записи начиная со второй получают ведущий `\0`. Это ломает парсинг поля `%P` (parents) и поля `%at` (timestamp), и эти «обрезанные» хвосты становятся phantom-коммитами с пустым subject, timestamp 0 и пустым parents.

### Bug #2 — phantom `(no subject)`
Побочный эффект #1. Запись `\x0rec2\x1e\x0rec3...` после split порождает «rec2» без темы и без родителей.

### Bug #3 — двухстрочный лейаут
Не баг, а UX. SourceTree использует однострочный лейаут с table columns.

## Референс (SourceTree workflow/references/source-tree-{1,2}.png)

### Структура таблицы
| Graph | Description | Commit | Author | Date |

- **Graph** — узкая колонка (~110-130px) с SVG-графом (lanes + circles).
- **Description** — широкая, гибкая колонка с subject и branch/tag chips **СЛЕВА** от subject.
- **Commit** — короткий хеш (7 символов).
- **Author** — имя + email (truncate).
- **Date** — относительное время (`Today at 20:04`).
- Колонки **resizable** — draggable dividers между заголовками.

### Алгоритм рендера графа (SourceTree-style)
1. **Lane = branch**. Каждая ветка получает свой lane index (0..N) и цвет из палитры.
2. **Цвета**: 8-цветная палитра `--color-graph-lane-1`..`--color-graph-lane-8` в `theme.css`. Дефолт: orange/blue/green/purple/cyan/yellow/magenta/grey (light + dark варианты).
3. **Цвет узла = цвет lane**, в которой он находится.
4. **Линии — straight vertical + right-angle steps** (Manhattan routing):
   - Коммит на lane X, parent на lane Y:
     - Если X == Y: одна вертикальная линия от строки коммита до строки parent.
     - Если X != Y: вертикаль вниз на ~половины строки → горизонталь к lane Y → вертикаль вниз до parent.
   - Никаких кривых (CURVE_RADIUS = 0 в нашей реализации).
5. **Continuous vertical lines**: после вычисления всех (commit → parent) рёбер, для каждого lane X и для каждой пары соседних коммитов (current, next), где оба на lane X, рисуется вертикаль от current до next.
6. **Merge-коммит**: из узла выходит несколько линий — по одной на каждого parent в цвете соответствующего lane.
7. **Branch tips**: lane заканчивается «заглушкой» (color stop) на последнем коммите ветки.

### Цвета lanes в theme.css
Добавить токены:
```css
--color-graph-lane-1: #ff8c42; /* orange (active/main) */
--color-graph-lane-2: #4d9fff; /* blue */
--color-graph-lane-3: #4caf50; /* green */
--color-graph-lane-4: #ab47bc; /* purple */
--color-graph-lane-5: #26c6da; /* cyan */
--color-graph-lane-6: #fdd835; /* yellow */
--color-graph-lane-7: #ec407a; /* magenta */
--color-graph-lane-8: #90a4ae; /* slate */
```

Для тёмной темы — слегка приглушённые оттенки (тот же hue, ниже lightness).

### Выбор цвета lane для branch
Детерминированный: `hash(branchName) % 8 + 1`. Или явный маппинг в `useBranches` для известных веток (main → lane-1, master → lane-1, develop → lane-2).

### Row layout (одна строка)
```
[●] [graph SVG] [branch/tag chips] subject truncate ... [author] [date]
       (lanes)     (left aligned)                       (right aligned, sm+)
```

- `ROW_HEIGHT` — 28-32px (одна строка).
- Branch/tag chips СЛЕВА от subject, не справа.
- На `<sm`: скрывать author/email и date, оставлять hash + subject + chips.
- Selected row — горизонтальная подсветка через ВСЕ колонки (background `bg-surface-elevated`).

## Что сделать

### Шаг 1. Фикс парсера
Файл: `electron/main/services/git/parser.ts`.

Заменить формат и парсер:
1. `gitLog` в `electron/main/services/git/index.ts:88-102`: убрать `-z`.
2. Новый `LOG_FORMAT`: использовать newline-terminated records с явным sentinel:
   ```
   %H\n%P\n%an\n%ae\n%at\n%s\n%b\n--RECORD-END--
   ```
   (или просто парсить по N строк, если subject/body не содержат `\n` — вынести body в отдельное поле через `--format=%H%x00%P%x00...` с NUL-разделителем полей, без `-z`).

   Рекомендую: **record-based парсинг с sentinel** — `git log --format=...%x1e` (где `%x1e` это RS) без `-z`, потом split по `%x1e`, и trim trailing empty.
3. `parseLog`:
   - Каждая запись — 7 строк через `\n` (hash, parents, an, ae, at, subject, body).
   - `subject` может быть пустой, но не должен становиться phantom — фильтровать записи с пустым hash.
   - `body` — многострочный, остаток строк до конца record.
4. Обновить существующие тесты в `parser.test.ts` + добавить новые:
   - Linear history (3 коммита, parent = предыдущий).
   - Merge commit (2 родителя).
   - Commit с пустым subject.
   - Commit с multi-line body.
   - Commit с subject, содержащим `\x1f` или `\x1e`.
   - **Phantom-guard**: пустой hash / пустой timestamp → запись отбрасывается, не превращается в «(no subject)».

### Шаг 2. Lane-цвет per branch
1. Добавить токены `--color-graph-lane-{1..8}` в `src/app/styles/theme.css` (light + dark варианты).
2. Утилита `laneColor(branchName: string): string` в `src/widgets/repo-graph-vertical/lib/laneColor.ts`:
   - Хеш branchName → lane index (1..8).
   - Возвращает CSS variable `var(--color-graph-lane-${index})`.
3. `computeLayout`:
   - Расширить, чтобы возвращал `lanes: { index: number; branchName: string; color: string }[]` для использования в UI.
   - `commit.lane` уже есть, добавить `commit.color` (вычисляется из branch, на которой коммит).
4. CommitRow: цвет узла и линий — `commit.color` вместо `primary`/`muted-foreground`.

### Шаг 3. SourceTree-style алгоритм линий
1. В `computeLayout.ts` изменить `buildPath`: вместо кривых — Manhattan routing:
   ```
   step1: vertical от (X, rowCenter) вниз на ROW_HEIGHT/2 - CORNER_RADIUS
   step2: horizontal от X к parent.lane (если X != parent.lane)
   step3: vertical вниз до (parent.lane, parentRowCenter)
   ```
   `CORNER_RADIUS = 4` (для скругления углов через маленький радиус).
2. После построения рёбер — построить **continuous vertical lines**:
   - Для каждого lane X: найти все коммиты, где `commit.lane === X`, отсортированные по rowIndex.
   - Для каждой пары соседних коммитов (current, next) — нарисовать сплошную вертикаль от current.rowCenter до next.rowCenter.
3. Active lane (ветка, на которую указывает HEAD) — цвет `lane-1` (оранжевый), даже если её branchName не «main».

### Шаг 4. Table layout с resizable columns
Файл: новый `src/widgets/repo-graph-vertical/ui/RepoGraphTable.tsx`.

1. Структура:
   ```tsx
   <table>
     <thead>
       <tr><th>Graph</th><th>Description</th><th>Commit</th><th>Author</th><th>Date</th></tr>
     </thead>
     <tbody>
       {commits.map(c => <CommitRow ... />)}
     </tbody>
   </table>
   ```
2. Resizable columns: draggable dividers между `<th>` — состояние в localStorage (`commit-graph-columns`).
3. Default widths:
   - Graph: 120px
   - Description: flex (min 400px)
   - Commit: 90px
   - Author: 140px
   - Date: 130px
4. CommitRow обновлён для рендеринга в `<tr>`:
   - `<td class="graph-cell">` — SVG граф.
   - `<td class="description-cell">` — chips + subject + meta.
   - `<td class="hash-cell">` — shortHash.
   - `<td class="author-cell">` — author.
   - `<td class="date-cell">` — relativeTime.

### Шаг 5. Branch chips СЛЕВА от subject
В CommitRow (description-cell):
```tsx
<span className="flex items-center gap-2 truncate">
  {chips.map(c => <Chip ... />)}
  <span className="truncate flex-1">{subject}</span>
</span>
```

### Шаг 6. Однострочный row layout
- `ROW_HEIGHT = 32` (вместо 44).
- Все элементы — в одной flex-строке.
- Author/email/date скрываются на `<sm`.

### Шаг 7. Selected row highlight across all columns
- `<tr>` с `aria-selected={isSelected}`.
- CSS: `tr[aria-selected="true"] { background-color: var(--color-surface-elevated); }`.
- Border-bottom: `divide-y divide-border/20` на `<tbody>`.

### Шаг 8. Регрессионные тесты
- `parser.test.ts` (новые кейсы).
- `computeLayout.test.ts` (lane color, continuous lines).
- `RepoGraphTable.test.tsx`:
  - 3 линейных коммита → 1 continuous vertical line в lane 1.
  - 3 коммита с merge → 2 lanes, line от merge к обоим parents.
  - Branch chips слева от subject.
- `RepoGraph.stories.tsx` — добавить stories с merge-коммитами и несколькими ветками.

### Шаг 9. Верификация
- [ ] `npm run tsc` — без ошибок.
- [ ] `npx eslint <files>` — без ошибок.
- [ ] `npm test` — все тесты проходят.
- [ ] В реальной репе `lmm-docs`: граф показывает 4 коммита БЕЗ phantom, между `cdd6003 → 947b39 → 991cb4` — реальная lane-линия.
- [ ] Visual check в dev: lane-цвета разные для разных веток, Manhattan-routing линий, table columns resizable.
- [ ] Storybook — обновить stories под новый формат.

## Acceptance criteria
- [ ] Между соседними коммитами видны вертикальные lane-линии (для линейной истории — сплошная оранжевая линия).
- [ ] Phantom-коммит `(no subject) · 20654d ago` исчез.
- [ ] Lane-цвета per branch: 8 цветов из палитры, разные ветки = разные цвета.
- [ ] Линии рисуются Manhattan-routing (вертикаль + step), без кривых.
- [ ] Continuous vertical lines в каждом lane.
- [ ] Branch/tag chips СЛЕВА от subject.
- [ ] Table layout с resizable columns: Graph | Description | Commit | Author | Date.
- [ ] Однострочная верстка, ROW_HEIGHT ≤ 32.
- [ ] Selected row подсвечивается через все колонки.
- [ ] Все регрессионные тесты добавлены и проходят.
- [ ] `npm run tsc` + `eslint` чисто.

## Зависит от
—

## Заметки
- `computeLayout.ts` менять можно (расширять lanes/colors), но базовый алгоритм lane-assignment сохранить.
- `CommitRow` переписать под table-row (был `<li>`, станет `<tr>`/`<td>`).
- Lane-цвета добавить в `theme.css` под data-theme (light + dark).
- Resizable columns — простой `mousedown` + drag, без сторонних библиотек.
- Не вводить новые зависимости.
- AGENTS.md: стрелочные функции, FC, типы в `types.ts`, без комментариев в коде, без enum.

## Статус
✅ done (review fixes applied: Manhattan routing, per-parent lane colors, control-char sentinels, author email + current branch, accessibility)

### Review fixes
- **buildPath**: pure Manhattan routing (M + L only) — `src/widgets/repo-graph-vertical/lib/buildPath.ts`. No Q/C/S curves.
- **GraphParent.color**: каждый parent edge рендерится в цвете lane родителя (а не в цвете source коммита). `computeLayout.ts` проставляет `color` per parent.
- **Parser sentinels**: `LOG_FORMAT` и `parseLog` переключены на `\x1f` (поле) и `\x1e` (запись) — control chars не могут встречаться в commit text, sentinel collision невозможен.
- **Author email + current branch**: `toCommitNodes` пробрасывает `entry.author.email` и `branchQuery.data?.name` через `currentBranchName`.
- **Accessibility**: `<caption className="sr-only">Commit graph</caption>` на таблице, `aria-orientation="vertical"` на resize handles, keyboard resize (Arrow keys / Shift = step x3, focusable).
- **Tests**: добавлены `buildPath.test.ts` (3), расширены `computeLayout.test.ts` (+4: ROW_HEIGHT, lane colors, continuous lines, per-parent colors), `RepoGraphTable.test.tsx` (8), `parser.test.ts` (+3: subject/body sentinels, multi-line body).
