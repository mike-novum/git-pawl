# TASK-325 — Граф: отображение Uncommited changes

## Контекст

Из фидбэка пользователя (roadmap-9, доработка #1): сейчас если есть незакоммиченные изменения, они никак не отображаются в графе. Надо:
- от последнего коммита ветки, в которой мы находимся, рисовать ещё одну вершину с ребром, покрашенными в серый цвет.
- В колонке message — надпись `"Uncommited changes"`.
- Остальные колонки пустые.

## Что сделать

### Шаг 1. Entity: получить информацию об uncommitted

Файл: `src/entities/repository/model/useRepository.ts` (или аналог) — уже есть `repo.status` ('dirty' | 'clean').

Если `repo.status === 'dirty'`, значит есть uncommitted.

### Шаг 2. Подготовить "виртуальный" коммит

Файл: `src/widgets/repo-graph-vertical/lib/toCommitNodes.ts` (или где `toCommitNodes` определён):

- Добавить логику: если `isDirty`, то к `commits` в начало (или в конец) добавить ВИРТУАЛЬНУЮ ноду:
  ```ts
  const uncommittedNode: CommitNode = {
    hash: 'UNCOMMITTED',
    shortHash: '------',
    subject: 'Uncommited changes',
    author: '',
    authorEmail: '',
    timestamp: Date.now(),
    parents: [<head-commit-hash>],
    lane: 0,
    color: 'var(--color-muted-foreground)',
    isUncommitted: true
  };
  ```

- Эта нода — ребёнок последнего (HEAD) коммита. Серое edge.

### Шаг 3. Layout: добавить uncommitted-строку

Файл: `src/widgets/repo-graph-vertical/lib/computeLayout.ts`:
- В `buildRows`/`buildMainlineMaps` учитывать uncommitted-ноду.
- `color` для вершины = `var(--color-muted-foreground)`.
- `color` для edge = `var(--color-muted-foreground)`.

Файл: `src/widgets/repo-graph-vertical/types.ts`:
- Добавить `isUncommitted?: boolean` в `CommitNode`.

### Шаг 4. Рендер: помочь `computeLayout` идентифицировать uncommitted

Файл: `src/widgets/repo-graph-vertical/lib/computeLayout.ts`:
- В `GraphRow` хранить `commit: CommitNode`. Ничего специального не нужно.
- Если `commit.isUncommitted` — использовать `commit.color` (он серый), не авто-генерировать lane color.

### Шаг 5. Edge от HEAD к Uncommited

Файл: `src/widgets/repo-graph-vertical/ui/GraphLayer.tsx`:
- При `rows.map` для не-uncommitted коммита — рендерить стандартный `<circle>`.
- Для uncommitted — `<circle>` с `r={NODE_RADIUS}` и `fill={commit.color ?? 'var(--color-muted-foreground)'}`.
- В `parentEdges` для uncommitted — край серый (`var(--color-muted-foreground)`).

Файл: `src/widgets/repo-graph-vertical/ui/CommitRow.tsx`:
- Если `commit.isUncommitted` — не рендерить branch chips, tag chips, author, date.
- В subject — `"Uncommited changes"`.
- По возможности — отобразить серую иконку (например, `FileQuestion` или `AlertCircle`).

### Шаг 6. RepositoryPage

Файл: `src/pages/repository/ui/RepositoryPage.tsx`:
- Получить `repo.status` (через `useRepository`).
- Передать `isDirty: repo?.status === 'dirty'` в `toCommitNodes` или в `commits`-билдер.

### Шаг 7. Тесты

Файл: `src/widgets/repo-graph-vertical/lib/computeLayout.test.ts` (обновить):
- Тест: при `isUncommitted=true` добавляется строка с `color = muted-foreground`.
- Тест: edge между последним коммитом и uncommitted — серый.

Файл: `src/widgets/repo-graph-vertical/ui/RepoGraphTable.test.tsx` (обновить):
- Тест: uncommitted-строка не показывает branch chips и теги.

### Шаг 8. Верификация

- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Dev: в реальном репо с грязным состоянием — на графе появляется серая вершина `"Uncommited changes"`.

## Acceptance criteria

- [ ] При наличии uncommitted-изменений в графе появляется виртуальная нода.
- [ ] Нода и ребро покрашены в серый.
- [ ] Subject = `"Uncommited changes"`.
- [ ] Остальные колонки пустые.
- [ ] `npm run tsc` + `npx eslint` — без ошибок.
- [ ] `npm test` — без новых fallов.

## Зависит от
TASK-324 (panel использует `commit.kind === 'uncommitted'`).

## Заметки

- Стиль AGENTS.md.
- Не ломать порядок обычных коммитов.
- Использовать `var(--color-muted-foreground)` для серого (он уже в теме).

## Статус: DONE — добавлена виртуальная нода Uncommited changes в графе

### Что сделано
- Добавлено поле `isUncommitted?: boolean` в `CommitNode` (`src/widgets/repo-graph-vertical/types.ts`).
- В `toCommitNodes` (`src/pages/repository/lib/toCommitNodes.ts`) добавлен опциональный параметр `isDirty`; при `true` в начало массива добавляется виртуальная нода `UNCOMMITTED` со ссылкой на HEAD, серым цветом (`var(--color-muted-foreground)`) и `subject: 'Uncommited changes'`.
- В `computeLayout` (`src/widgets/repo-graph-vertical/lib/computeLayout.ts`) цвет узла и линий для uncommitted-ноды использует `commit.color` (`var(--color-muted-foreground)`), а не lane color. Для continuous lines добавлена проверка: если один из концов — uncommitted, цвет серый.
- В `CommitRow` (`src/widgets/repo-graph-vertical/ui/CommitRow.tsx`) добавлен отдельный рендер для `isUncommitted`: без branch/tag chips, без автора/даты, с иконкой `AlertCircle` и серым цветом текста.
- В `RepositoryPage` (`src/pages/repository/ui/RepositoryPage.tsx`) добавлена передача `{ isDirty: repo?.status === 'dirty' }` в `toCommitNodes` и `repo?.status` в зависимости `useMemo`.
- Обновлены тесты в `computeLayout.test.ts` и `RepoGraphTable.test.tsx`.

### Acceptance criteria (отметить выполненные)
- [x] При наличии uncommitted-изменений в графе появляется виртуальная нода.
- [x] Нода и ребро покрашены в серый.
- [x] Subject = `"Uncommited changes"`.
- [x] Остальные колонки пустые.
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] `npm test` — без новых fallов.

### Заметки для ревьюера
- В текущем алгоритме UNCOMMITTED и HEAD оказываются на одной lane (0), поэтому связь между ними генерируется через `continuousLines`, а не `parentEdges`. Логика цвета покрывает оба случая.
- `var(--color-muted-foreground)` уже определён в `src/app/styles/theme.css` (dark и light).
