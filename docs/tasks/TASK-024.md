# TASK-024 — git-сервис: reset, revert, amend, checkout, branch

## Цель
Операции над HEAD/ветками.

## Методы
- `reset({ repoPath, mode: 'soft'|'mixed'|'hard', ref })`
- `revert({ repoPath, commit, noEdit? })`
- `amend({ repoPath, message?, noVerify? })`
- `checkout({ repoPath, ref, create? })`
- `branch({ repoPath, action: 'list'|'create'|'delete', name?, force? })`
- `currentBranch(repoPath)` → string|null

## Acceptance criteria
- [ ] Все методы типизированы, безопасны (no silent force-push).
- [ ] Подтверждение через UI для destructive (hard reset, force delete branch).

## Зависит от
- TASK-020

## Параллелизация
Параллельно с TASK-023, TASK-025.
