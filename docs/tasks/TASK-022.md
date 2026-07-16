# TASK-022 — git-сервис: clone, fetch, pull, push

## Цель
Сетевые git-операции.

## Что сделать

1. `clone(args: { url, dest, progress? })` — `git clone [url] [dest]`, поток progress через IPC event.
2. `fetch(repoPath, options?)` — `git fetch [remote]`.
3. `pull(repoPath, options?)` — `git pull [options]`.
4. `push(repoPath, options?)` — `git push [options]`.
5. Все поддерживают cancellation (AbortSignal).

## Acceptance criteria
- [ ] Все методы доступны через `window.api.git.*`.
- [ ] Progress clone транслируется в renderer через событие `git:clone:progress`.
- [ ] При отмене AbortSignal — процесс убит, частичный клон удаляется.

## Зависит от
- TASK-020

## Статус: DONE — сетевые git-операции подключены

### Что сделано
- `electron/main/services/git/progress.ts` — `emitCloneProgress(webContents, msg)` отправляет событие `git:clone:progress` через `webContents.send`
- `electron/main/services/git/clone.ts` — `gitClone(args, onProgress?, options?)` через `spawn('git', ['clone', '--progress', ...])`, парсит stderr-строки, чистит частичный клон при ошибке/abort, поддерживает `AbortSignal` и PAT-инжекцию в URL (`https://oauth2:TOKEN@host/...`)
- `electron/main/services/git/network.ts` — `gitFetch`, `gitPull`, `gitPush` через `spawn` с `--progress`, валидация пути (`existsSync` + `isDirectory`), PAT-инжекция в URL при `options.token`, поддержка `AbortSignal` (SIGTERM при отмене)
- `electron/shared/handler.ts` — `safeHandle` расширен: handler получает `IpcMainInvokeEvent` как опциональный второй аргумент (обратно совместимо)
- `electron/main/index.ts` — `GIT_CLONE` использует `event.sender` для прогресса, `GIT_FETCH/PULL/PUSH` вызывают реальные сервисы
- `vite.config.ts` — vitest подхватывает тесты из `electron/**` (без изменений для src/)
- Юнит-тесты: `clone.test.ts` (13), `network.test.ts` (7), `progress.test.ts` (2) — всего 22 новых, 1 существующий

### Acceptance criteria
- [x] Все методы доступны через `window.api.git.*` (IPC `git:clone`, `git:fetch`, `git:pull`, `git:push` зарегистрированы через `safeHandle`)
- [x] Progress clone транслируется в renderer через событие `git:clone:progress` (через `emitCloneProgress(event.sender, msg)`)
- [x] При отмене AbortSignal — процесс убит (SIGTERM), частичный клон удаляется (`rm(dest, { recursive: true, force: true })`)

### Verification
- `npm run tsc` — clean
- `npm run lint` — 0 errors (warnings не относятся к моим файлам)
- `npm test` — 23/23 passed
