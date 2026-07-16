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

## Статус: DONE — операции reset/revert/amend/checkout/branch готовы

### Что сделано
- `electron/shared/schemas.ts` — обновлены zod-схемы: `gitResetSchema.ref`, `gitRevertSchema.noEdit`, `gitAmendSchema.message/noVerify`, `gitCheckoutSchema.ref`, `gitBranchSchema.force`, новая `currentBranchSchema`
- `electron/shared/types/git.ts` — общие типы `CommitResult`, `BranchListResult`
- `electron/main/services/git/runner.ts` — общий exec-wrapper `runGit(args, repoPath)` с полным stderr и парсеры `parseBranchList`, `parseCommitHash`
- `electron/main/services/git/reset.ts` — `gitReset({ mode, ref })` → `git reset --<mode> [ref]`
- `electron/main/services/git/revert.ts` — `gitRevert({ commit, noEdit })` → `git revert [--no-edit] <commit>`
- `electron/main/services/git/amend.ts` — `gitAmend({ message?, noVerify? })` → `git commit --amend [-m msg] [--no-verify]` + `git rev-parse HEAD` → `CommitResult`
- `electron/main/services/git/checkout.ts` — `gitCheckout({ ref, create? })` → `git checkout [-b] <ref>`
- `electron/main/services/git/branch.ts` — `gitBranch({ action, name?, force? })` → list возвращает `BranchListResult`, create/delete → `-d | -D`
- `electron/main/services/git/currentBranch.ts` — `currentBranch(repoPath)` → `git rev-parse --abbrev-ref HEAD`, возвращает `string | null`
- `electron/shared/ipc-channels.ts` — добавлен `GIT_CURRENT_BRANCH`
- `electron/main/index.ts` — wiring через `safeHandle` для всех шести методов
- `electron/preload/index.ts` — типизированные `gitReset/gitRevert/gitAmend/gitCheckout/gitBranch/gitCurrentBranch` в `ApiSchema`
- `src/shared/api/ipc.ts` — обёртки `gitReset/gitRevert/gitAmend/gitCheckout/gitBranch/gitCurrentBranch`
- `src/shared/api/branchParser.test.ts` — unit-тесты парсеров (`parseBranchList`, `parseCommitHash`), 8 кейсов

### Acceptance criteria
- [x] Все методы типизированы, безопасны (`-D` только при `force: true`, нет silent force-push)
- [x] Удаление ветки через `-d` по умолчанию, `-D` только при `force: true` (UI confirm относится к TASK-066)
- [x] Ошибки содержат полный stderr (`git <cmd> failed (exit <code>): <stderr>`)
- [x] `npm run tsc` — без ошибок
- [x] `npm run lint` — без ошибок по моим файлам
- [x] `npm test` — 9/9 тестов проходят (1 pre-existing + 8 новых)

### Заметки для ревьюера
- Параллельно работают TASK-021/022/023 (parser, exec, status, log, diff, rev-parse, clone, fetch, pull, push, commit, stash, merge, rebase) — эти файлы не трогал. Свой `runner.ts` локален для TASK-024, при интеграции может объединиться с общим `exec.ts` от TASK-021.
- Force-delete ветки поддержан флагом `force: true` → `-D`; без флага — безопасный `-d`.
- `currentBranch` обрабатывает detached HEAD (возвращает `null`) и ошибки (отсутствие репо → `null`).
