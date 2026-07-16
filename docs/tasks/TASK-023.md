# TASK-023 — git-сервис: commit, stash, merge, rebase

## Цель
Локальные операции истории.

## Что сделать

1. `commit({ repoPath, message, files?, author?, noVerify? })`:
   - `git add [files...]` если переданы
   - `git commit -m <msg>` или `-F <file>` если нужно header/body/footer
   - `--no-verify` если `noVerify: true`
2. `stash({ repoPath, action: 'push'|'pop'|'apply'|'drop', message?, ref? })`
3. `merge({ repoPath, branch, noFF?, message? })`
4. `rebase({ repoPath, onto, interactive? })` — без interactive (только simple rebase)

## Acceptance criteria
- [ ] Commit поддерживает message как объект `{ header, body?, footer? }`.
- [ ] `--no-verify` корректно передаётся.
- [ ] Возвращают `CommitResult { hash, stdout, stderr }`.

## Зависит от
- TASK-020

## Параллелизация
Можно параллельно с TASK-024, TASK-025.
