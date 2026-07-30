# TASK-313 — Граф: исправить порядок коммитов (--topo-order)

## Баг
В реальной репе `git-pawl` (см. скриншоты пользователя) на графе merge-коммиты идут **друг за другом наверху**, хотя в SourceTree они чередуются с feature-коммитами в правильном порядке timeline:

**Наш граф (неправильно):**
```
937bdd feat(commit-graph): редизайн графа коммитов
070e3d fix(workspace-icon)
c39473 docs(tasks): отметить TASK-300..304
7108d8 merge: TASK-304
0c84b1 merge: TASK-303          ← идут подряд!
ad59b5 merge: TASK-302
1f51c7 merge: TASK-301
1af9b5 merge: TASK-300
b0606c feat(commit-graph): переделан граф коммитов — нормальное дерево  ← запоздал
3b813b fix(drawer)
...
```

**SourceTree (правильно):**
```
fix(commit-graph): исправлен парсер
feat(commit-graph): редизайн графа
fix(workspace-icon)
docs(tasks): отметить TASK-300..304
merge: TASK-304
feat(commit-graph): переделан граф коммитов  ← встроен в timeline
merge: TASK-303
fix(drawer)
merge: TASK-302
feat(workspace-meta)
merge: TASK-301
...
```

Merge-коммиты должны стоять **в точке слияния** на timeline, а не скапливаться наверху.

## Корневая причина
Файл: `electron/main/services/git/index.ts:88-102`.

`gitLog` использует дефолтный порядок `git log`, который сортирует по **commit date** (когда коммит был сделан). Merge-коммиты часто создаются позже, чем feature-работа которую они мержут — поэтому они все оказываются наверху, а оригинальная feature-работа «откатывается» вниз.

В SourceTree используется **`--topo-order`** (topological order), который гарантирует:
- Коммит всегда показывается **после всех своих parents**.
- Merge-коммиты оказываются в той точке timeline, где их создали (после всех коммитов которые они сливают).

## Что сделать

### Шаг 1. Добавить `--topo-order` в gitLog
Файл: `electron/main/services/git/index.ts`.

В массив `gitArgs` добавить `'--topo-order'`:
```ts
const gitArgs = ['log', '--topo-order', `--format=${LOG_FORMAT}`, '-z'];
if (typeof args.maxCount === 'number') {
  gitArgs.push('-n', String(args.maxCount));
}
```

Также добавить `--topo-order` (или другой флаг порядка) в `gitBranches`, `gitTags` если они тоже используются в UI (для согласованности с log order).

### Шаг 2. Тесты
Файл: `electron/main/services/git/parser.test.ts`.

- Добавить тест: для истории с merge-коммитами, после `--topo-order`, merge-коммиты должны идти **после** всех коммитов, которые они мержут.
- Или: snapshot-тест вывода `parseLog` с merge-коммитами.

### Шаг 3. Верификация
- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Storybook `widgets/RepoGraph` → Dark → проверить, что merge-коммиты чередуются с feature-коммитами (как в SourceTree).
- В реальной репе `git-pawl` через `npm run dev`: сравнить порядок коммитов с SourceTree.

### Шаг 4. Обновить task-файл и README
- `docs/tasks/TASK-313.md`: status DONE + AC + notes.
- `docs/tasks/README.md`: TASK-313 row → 🔧 in_progress, потом ✅ done.

## Acceptance criteria
- [x] Merge-коммиты в графе отображаются **в правильной точке timeline** (после коммитов, которые они мержут), а не скапливаются наверху.
- [x] Порядок коммитов в нашем графе совпадает с SourceTree (для одной и той же репы).
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] Все тесты проходят.

## Зависит от
—

## Заметки
- `--topo-order` эквивалентно `--date-order` + топологической сортировке. Можно использовать любой из них, но `--topo-order` явнее.
- Не путать с `--first-parent` — это показывает только первый parent каждого merge, что не то что нам нужно.
- AGENTS.md: стрелочные функции, без комментариев в коде, без enum.

## Статус: DONE — добавлен `--topo-order` в gitLog + тесты на состав аргументов

### Что сделано
- В `electron/main/services/git/index.ts` в массив `gitArgs` функции `gitLog` добавлен флаг `'--topo-order'` (сразу после `'log'` и до `--format=...`).
- Создан `electron/main/services/git/index.test.ts` с тремя тестами, проверяющими:
  - `gitLog` передаёт `--topo-order` в `execGit`;
  - `--topo-order` стоит после `log` и до `--format=...`;
  - при наличии `maxCount` флаг `-n <N>` добавляется в конец (вместе с `--topo-order`).
- `gitBranches`/`gitTags` в виде отдельных команд не существуют — есть `gitBranch`/`gitTag` в собственных файлах и работают по другим путям (`for-each-ref`/`tag -l`), порядок коммитов там не релевантен. Менять их не требовалось.

### Acceptance criteria (отметить выполненные)
- [x] Merge-коммиты в графе отображаются в правильной точке timeline (после коммитов, которые они мержут).
- [x] `git log --topo-order --oneline -n 12` в этой репе даёт порядок, совпадающий со скриншотами SourceTree из задачи (merge-коммиты чередуются с feature-коммитами).
- [x] `npm run tsc` — без ошибок.
- [x] `npx eslint electron/main/services/git/index.ts electron/main/services/git/index.test.ts` — без ошибок.
- [x] `npm test` — 195/195 тестов проходят.

### Заметки для ревьюера
- Флаг `-z` в примере кода из задачи был опущен: текущий `parseLog` использует собственные сепараторы (`\x1f`, `\x1e`) и не зависит от null-terminated output. Менять парсер не было необходимости в рамках этой задачи.
- Мок `execGit` сделан через `vi.mock('./exec', …)`, что позволяет проверять именно состав аргументов без реального запуска `git`.
- Storybook `widgets/RepoGraph` (Dark) визуально проверить не удалось в headless-окружении; правка проверена через прямой запуск `git log --topo-order` в этой репе — порядок merge-коммитов теперь соответствует ожидаемому (чередуется с feature-коммитами, как в SourceTree).
- В `gitTag`/`gitBranch` флаг `--topo-order` не добавлялся: эти команды не используют `git log` и работают с собственными выводами (`for-each-ref`, `tag -l`), где топологический порядок не применяется.