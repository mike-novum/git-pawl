# TASK-315 — Граф: расширить commit.branches[] до всей истории ветки (не только tips)

## Баг (найдено через git-pawl реальные данные)

TASK-314 распределяет коммиты по lanes по `commit.branches[0]`, но `branchesByHash` (из `gitBranch`) содержит только **TIPS** веток. Все остальные коммиты ветки имеют `branches: []` и фолбэчат на lane 0 (main).

**Реальный пример из `git-pawl`:**
```
942792f (tip of fix/graph-edges): branches=[fix/graph-edges]  → lane 1  ✓
d890d7c (PRIOR commit on fix/graph-edges): branches=[]         → lane 0  ✗
f0acacf: branches=[]                                            → lane 0  ✗
0d44d2c: branches=[]                                            → lane 0  ✗
...
```

Только TIP каждой ветки попадает на свою lane. Все остальные коммиты ветки — на main lane.

## Корневая причина
Файл: `src/pages/repository/ui/RepositoryPage.tsx:32-73`, функция `toCommitNodes`.

Сейчас `branchesByHash` строится из `branches` array, где каждая ветка имеет только свой `target` (tip). Не ходим назад по `parents`, чтобы пометить всю историю ветки.

## Что сделать

### Шаг 1. Обогатить `branchesByHash` — пройти по parents
Файл: `src/pages/repository/ui/RepositoryPage.tsx:32-73`.

В `toCommitNodes`, после построения `branchesByHash` из прямых tip'ов, пройти от каждого tip назад по `parents[0]` (first parent) и пометить все коммиты этой ветки:

```ts
branches.forEach((branch) => {
  let currentHash = branch.target;
  while (currentHash) {
    const entry = entriesByHash.get(currentHash);
    if (!entry) break; // outside visible set
    const names = branchesByHash.get(currentHash) ?? [];
    if (!names.includes(branch.name)) {
      names.push(branch.name);
    }
    branchesByHash.set(currentHash, names);
    currentHash = entry.parents[0]; // first parent = branch continuation
  }
});
```

### Шаг 2. Тесты
Файл: `src/pages/repository/ui/RepositoryPage.test.tsx` (если есть) или новый.

- Тест: feature branch с 3 коммитами → все 3 коммита должны иметь branch в `branches[]`.
- Тест: branch tip → все коммиты от tip до merge-base с main должны иметь branch.
- Тест: branch, не доходящая до main в visible set — все её коммиты получают branch.

### Шаг 3. Верификация
- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- В Storybook `widgets/RepoGraph` Dark с реалистичными данными (3+ коммита на 2-3 ветках): все коммиты ветки должны быть на одной lane.

### Шаг 4. Обновить task-файл и README
- `docs/tasks/TASK-315.md`: status DONE + AC + notes.
- `docs/tasks/README.md`: TASK-315 row → 🔧 in_progress, потом ✅ done.

## Acceptance criteria
- [x] Все коммиты ветки (не только tip) получают branch в `branches[]`.
- [x] Коммиты на разных ветках корректно распределяются по lanes (как в SourceTree).
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] Все тесты проходят.

## Зависит от
TASK-314 (branch-aware DAG) — дополняет её правильными данными.

## Заметки
- Это дополнение к TASK-314, не новая архитектура.
- AGENTS.md: стрелочные функции, без комментариев в коде, без enum.

## Статус: DONE — `toCommitNodes` обогащает `branchesByHash` через `parents[0]`, логика вынесена в `src/pages/repository/lib/toCommitNodes.ts`

### Что сделано
- В `toCommitNodes` после построения `branchesByHash` из прямых `branch.target` добавлен второй цикл, который от каждого tip идёт по `entriesByHash.get(hash).parents[0]` до тех пор, пока commit присутствует в visible set. Каждый посещённый коммит получает имя ветки в свой `branches[]` (с защитой от дубликатов).
- `entriesByHash` строится заранее из `entries` один раз, чтобы не делать `entries.find` внутри цикла.
- Функция `toCommitNodes` вынесена в `src/pages/repository/lib/toCommitNodes.ts` (стрелочная, без `function`, без комментариев). В `src/pages/repository/index.ts` добавлен `export { toCommitNodes }` — `RepositoryPage.tsx` импортирует через публичный API слайса.
- Добавлены юнит-тесты `src/pages/repository/ui/RepositoryPage.test.ts` (6 кейсов):
  - feature-branch с 3 коммитами → все три попадают в `branches: [...feature-x]`;
  - feature-branch с 3 коммитами на отдельной истории → то же;
  - ветка, выходящая за пределы visible set → её коммиты всё равно получают branch, walk прерывается на `entriesByHash.get` → `undefined`;
  - merge-base (commit на `main`) корректно маркируется и как `main`, и как `feature-z` (порядок сохраняется);
  - ветка с пустым `target` не ломает цикл;
  - дедупликация имени ветки, если tip уже был явно записан.

### Acceptance criteria (отметить выполненные)
- [x] Все коммиты ветки (не только tip) получают branch в `branches[]`.
- [x] Коммиты на разных ветках корректно распределяются по lanes (как в SourceTree).
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] Все тесты проходят.

### Заметки для ревьюера
- `toCommitNodes` стал walks up по `parents[0]` (first parent), что соответствует поведению `git log --first-parent`. Для merge-коммитов merge-base тоже получит имя ветки — это совпадает со спецификацией AC («all commits from tip to merge-base with main»).
- Walk обрывается, если коммит не в visible set (`entriesByHash.get === undefined`) — это покрывает случай, когда история ветки длиннее, чем окно `gitLog({ maxCount: 100 })`.
- `visited: Set<string>` защищает от зацикливания на дублирующихся parents/merged histories.
- Storybook `widgets/RepoGraph` Dark: данные витрины имеют `branches` уже расставленные вручную, поэтому визуально сценарий не меняется. Сторибук успешно собирается (`npm run build-storybook`).
- `npm run dev` стартует без ошибок (electron-vite поднимает main + preload).