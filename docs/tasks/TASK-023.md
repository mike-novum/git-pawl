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

## Статус: DONE — git-сервис для commit, stash, merge, rebase

### Что сделано
- `electron/main/services/git/commit.ts` — `gitCommit`, поддерживает string и structured message (`{ header, body?, footer? }`), multi-line → `-F <tmp>`, флаги `--author` и `--no-verify`, возвращает `CommitResult` с хэшем через `git rev-parse HEAD`.
- `electron/main/services/git/commit-format.ts` — чистые хелперы `formatCommitMessage` и `needsMessageFile`, тестируются отдельно.
- `electron/main/services/git/stash.ts` — `gitStash` для `push`/`pop`/`apply`/`drop`, парсит `stash@{n}` через `parseStashRef` и бросает ошибку при невалидном формате.
- `electron/main/services/git/merge.ts` — `gitMerge`, поддерживает `--no-ff` и `-m <message>`.
- `electron/main/services/git/rebase.ts` — `gitRebase` (только simple, без interactive).
- `electron/main/services/git/runner.ts` — общий `runGit` через `promisify(execFile)`; ошибки содержат stderr/stdout и команду.
- `electron/shared/types/git.ts` — добавлены `CommitMessage` и `CommitResult`.
- `electron/shared/schemas.ts` — zod-схемы `gitCommitSchema` (union-`message`, `files?`, `author?`), `gitStashSchema` (+`ref?`), `gitMergeSchema` (+`noFF?`, `message?`), `gitRebaseSchema` (поле `onto`).
- `electron/shared/ipc-channels.ts` — каналы `GIT_COMMIT`, `GIT_STASH`, `GIT_MERGE`, `GIT_REBASE`.
- `electron/shared/handler.ts` — `safeHandle` для валидации и проброса ошибок.
- `electron/main/index.ts` — `safeHandle` для четырёх каналов.
- `electron/main/services/git/commit-format.test.ts` — 10 unit-тестов на формат сообщений.
- `vite.config.ts` — `include` расширен на `electron/**/*.test.ts`.

### Acceptance criteria (отметить выполненные)
- [x] Commit поддерживает message как объект `{ header, body?, footer? }`.
- [x] `--no-verify` корректно передаётся.
- [x] Возвращают `CommitResult { hash, stdout, stderr }`.

### Заметки для ревьюера
- Хэш коммита получается через `git rev-parse HEAD` сразу после `git commit` (cwd тот же), результат парсится без переносов строк.
- Tmp-файл для `-F` создаётся в `os.tmpdir()` с уникальным UUID и удаляется в `finally` (`unlink().catch(() => undefined)`).
- `runGit` поднимает stderr **и** stdout в сообщение ошибки, потому что `git commit` без изменений пишет "nothing to commit" именно в stdout.
- `parseStashRef` валидирует формат `stash@{\d+}`; несоответствие → `Error`, а не молчаливый пропуск.
- `gitRebase` принимает `interactive?` в схеме, но намеренно не реализует interactive-режим (по спецификации).
- `electron/shared/handler.ts`, `electron/shared/schemas.ts`, `electron/shared/ipc-channels.ts` создаются с нуля в этом worktree (в TASK-020 их ещё не было); при merge с main могут быть конфликты — они решаются merge-агентом.
- Smoke-тест против реального git-репозитория (tmp): все 4 сервиса работают end-to-end (commit, structured message, no-verify, stash push/pop/drop, merge с no-ff, rebase).