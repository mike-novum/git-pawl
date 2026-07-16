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
