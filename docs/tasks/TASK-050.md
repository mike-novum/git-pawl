# TASK-050 — API: список репо GitHub/GitLab

## Цель
Получение списка репо через API для клонирования.

## Что сделать
1. `electron/main/services/git-host/github.ts` дополнить — `listRepositories(page?)`.
2. То же для GitLab.
3. IPC-канал `git-host:list-repos`.
4. В renderer — `useAccountRepos(accountId)` (TanStack Query).

## Acceptance criteria
- [ ] Возвращает `{ id, name, fullName, defaultBranch, isPrivate, url }[]`.
- [ ] Пагинация (infinite query).

## Зависит от
- TASK-031, TASK-032
