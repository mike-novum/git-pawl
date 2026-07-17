# TASK-090 — Entity: commit-relations

## Цель
Доменная сущность для графа коммитов (parent → children edges).

## Что сделать
1. `src/entities/commit-graph/` (отдельно от commit, чтобы не раздувать):
   - `model/buildGraph(commits: Commit[])` → `Map<hash, CommitNode>` с `parents: hash[]`, `children: hash[]`.
   - `model/topologicalCommits(...)` — топологическая сортировка по дате.
2. Юнит-тесты на корректность.

## Acceptance criteria
- [x] Merge-коммиты с 2+ parents корректно отображаются.
- [x] Root commits не имеют parents.

## Зависит от
- TASK-028

## Что сделано

Создан слайс `src/entities/commit-graph/`:

- `lib/types.ts` — `CommitNode`, `CommitGraph`.
- `model/buildGraph.ts` — `buildGraph(commits: Commit[])` строит граф, заполняет `children` и `roots`.
- `model/topologicalCommits.ts` — DFS-топосортировка по `parents → children`.
- `model/useCommitGraph.ts` — react-query хук поверх `useCommitList(repoPath)`, граф собирается в `useMemo`.
- `model/buildGraph.test.ts`, `model/topologicalCommits.test.ts` — юнит-тесты (10 тестов, все зелёные).
- `lib/index.ts`, `model/index.ts`, корневой `index.ts` — public API.

Проверки: `npm run tsc` (только мои файлы — ошибка `src/features/commit-changes` существовала до задачи), `npm run lint` чисто, `npm test src/entities/commit-graph` — 10/10.
