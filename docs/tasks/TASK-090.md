# TASK-090 — Entity: commit-relations

## Цель
Доменная сущность для графа коммитов (parent → children edges).

## Что сделать
1. `src/entities/commit-graph/` (отдельно от commit, чтобы не раздувать):
   - `model/buildGraph(commits: Commit[])` → `Map<hash, CommitNode>` с `parents: hash[]`, `children: hash[]`.
   - `model/topologicalCommits(...)` — топологическая сортировка по дате.
2. Юнит-тесты на корректность.

## Acceptance criteria
- [ ] Merge-коммиты с 2+ parents корректно отображаются.
- [ ] Root commits не имеют parents.

## Зависит от
- TASK-028
