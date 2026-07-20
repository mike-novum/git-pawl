# TASK-208 — RepositoryPage: данные не отображаются (баг: repo.id передаётся как путь)

## Баг (КРИТИЧЕСКИЙ)
В `src/pages/workspace/ui/WorkspacePage.tsx:54`:
```ts
navigate(`/repos/${encodeURIComponent(repo.id)}`);
```
Передаётся `repo.id` (хеш вида `4a3ee8f2d87fd6da`, см. `src/entities/repository/lib/buildRepository.ts:53-58`), а должен передаваться `repo.path` (абсолютный путь к репо). В результате на странице `RepositoryPage` параметр `id` — это хеш, который затем декодируется и передаётся в IPC `git:status` / `git:log` / `fs:size` как путь → ENOENT. Из-за этого:
- не отображаются ветки/тэги/сташ
- не рендерится граф коммитов
- в консоли ошибки `ENOENT ... /Users/mikenovum/projects/git-pawl/4a3ee8f2d87fd6da`

## Что сделать
1. Открыть `src/pages/workspace/ui/WorkspacePage.tsx`.
2. В `handleRepoClick` заменить `repo.id` на `repo.path`.
3. Убедиться, что `RepositoryPage` принимает `repoPath` через `useParams` и корректно передаёт его во все IPC-вызовы (`git:status`, `git:branch`, `git:log`, `fs:size` и т.д.).
4. Проверить, что путь с пробелами/спецсимволами корректно URL-кодируется (`encodeURIComponent(repo.path)` уже используется).

## Acceptance criteria
- [ ] На странице `/repos/:id` отображаются: текущая ветка, ветки, тэги, stash, граф коммитов, статус.
- [ ] В консоли нет ошибок ENOENT / "Repository path does not exist" с хешем.
- [ ] `npm run tsc` + `eslint` проходят без ошибок.

## Зависит от
—

## Статус
⏳ pending