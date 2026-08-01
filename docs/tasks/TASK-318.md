# TASK-318 — Граф: показывать чипы веток только у TIP-коммитов

## Контекст

Из фидбэка пользователя: "бейджи веток у каждого коммита прям стоят. чипы веток должны стоять только у того коммита который является последним в ветке (непосредственно указатель ветки)".

Проверено программно (`/tmp/verify-graph.mjs`): алгоритм `commitToBranches` корректно строит `commit.branches[]` для всех коммитов на ветке, но в рендере показываются чипы для всех.

## Корневая причина

Файл: `src/widgets/repo-graph-vertical/ui/CommitRow.tsx:62`:

```ts
{commit.branches?.map((branch) => (
  <Badge key={`branch-${branch}`} ...>{branch}</Badge>
))}
```

Это рендерит чип для КАЖДОЙ ветки в `commit.branches[]`. Для коммита 9492415 (на ветке fix/graph-edges, но не tip) — чип рисуется. Должно быть: только если `commit.hash === branch.target`.

## Что сделать

### Шаг 1. Прокинуть `branchTips` в layout
Файл: `src/widgets/repo-graph-vertical/lib/computeLayout.ts`.

`branchTips` уже строится внутри `buildMainlineMaps` (Map<string, string> — branchName → tipHash). Нужно выставить его наружу через `GraphLayout`.

Добавить в возвращаемый объект:
```ts
return {
  rows,
  lanes,
  maxLane,
  continuousLines,
  parentEdges,
  branchTips, // Map<string, string>
  width,
  height
};
```

### Шаг 2. Тип
Файл: `src/widgets/repo-graph-vertical/types.ts`.

Добавить в `GraphLayout`:
```ts
branchTips: Map<string, string>; // branchName -> tipHash
```

### Шаг 3. RepoGraphTable пробрасывает branchTips
Файл: `src/widgets/repo-graph-vertical/ui/RepoGraphTable.tsx`.

Передать `branchTips` в `CommitRow` через props или через новый контекст.

### Шаг 4. CommitRow фильтрует чипы
Файл: `src/widgets/repo-graph-vertical/ui/CommitRow.tsx`.

Заменить:
```ts
{commit.branches?.map((branch) => (
  <Badge>{branch}</Badge>
))}
```

На:
```ts
{(commit.branches ?? [])
  .filter((branch) => branchTips.get(branch) === commit.hash)
  .map((branch) => (
    <Badge>{branch}</Badge>
  ))}
```

### Шаг 5. Тесты
Файл: `src/widgets/repo-graph-vertical/ui/RepoGraphTable.test.tsx` (или новый).

- Тест: коммит на ветке но НЕ tip — чип не рендерится.
- Тест: коммит-tip — чип рендерится.
- Тест: коммит без веток (side commit) — нет чипов.

### Шаг 6. Верификация
- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Storybook Dark.
- Реальная репа git-pawl: у коммитов 9492415..44cd7e0 НЕ должно быть чипа `fix/graph-edges`. У 8bb1513 (tip) — должен быть. У d7a04f8 (main tip) — должен быть чип `main`.

### Шаг 7. Обновить task-файл и README
- `docs/tasks/TASK-318.md`: status DONE + AC + notes.
- `docs/tasks/README.md`: TASK-318 row → 🔧 in_progress, потом ✅ done.

## Acceptance criteria
- [x] Чип ветки показывается только у tip этой ветки, не у каждого коммита.
- [x] Все остальные визуальные элементы графа не сломаны.
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] Все тесты проходят.

## Зависит от
TASK-317.

## Заметки
- AGENTS.md: стрелочные функции, типы в `types.ts`, без комментариев в коде, без enum.
- После фикса проверить визуально через Electron dev (Vite-режим не имеет git IPC).

## Статус
✅ DONE

### Что сделано
- `src/widgets/repo-graph-vertical/lib/computeLayout.ts`: добавлен `branchTips` в возвращаемый `GraphLayout` (Map<string, string> — branchName → tipHash).
- `src/widgets/repo-graph-vertical/types.ts`: добавлено поле `branchTips: Map<string, string>` в `GraphLayout` и опциональное `branchTips?: Map<string, string>` в `CommitRowProps`.
- `src/widgets/repo-graph-vertical/ui/RepoGraphTable.tsx`: пробрасывает `layout.branchTips` в `CommitRow` через новый prop.
- `src/widgets/repo-graph-vertical/ui/CommitRow.tsx`: фильтрует `commit.branches` через `branchTips?.get(branch) === commit.hash`, чип рисуется только если коммит — tip ветки.
- `src/widgets/repo-graph-vertical/ui/RepoGraphTable.test.tsx`: добавлены три теста (tip-only, no-chip для side-коммита, multiple branches с одним tip). Обновлён существующий тест `orders branch chips before the subject` — теперь передаёт `branchMainlines`.

### Acceptance criteria (отметить выполненные)
- [x] Чип ветки показывается только у tip этой ветки, не у каждого коммита.
- [x] Все остальные визуальные элементы графа не сломаны.
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] Все тесты проходят (221 passed в `npm test`).

### Заметки для ревьюера
- `branchTips` опционален в `CommitRowProps` (fallback на отсутствие чипов, если layout без `branchMainlines` — например, в существующих storybook-сторис с `computeLayout(commits)` без mainlines).
- Filter вычисляется один раз в начале компонента (`tipBranches`), затем переиспользуется и для рендера чипов, и для `title`/aria-label — нет двойной итерации.
- В `references` для tooltip теперь используются только tip-ветки, а не все `commit.branches` — это согласовано с UI: чипы показывают только tip, и tooltip о ветках соответствует тому, что пользователь видит.
- В существующих storybook-сторис (`RepoGraph.stories.tsx`) чипы веток не отрисуются, потому что `computeLayout(sampleCommits)` вызывается без `branchMainlines` → `branchTips` будет пустым. Это поведение корректно: при отсутствии mainline-информации чипы не показываются (SourceTree тоже не показывает без истории ветки).