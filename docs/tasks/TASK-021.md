# TASK-021 — git-сервис: status, log, diff, rev-parse

## Цель
Базовая read-only функциональность git в main-процессе.

## Что сделать

1. `electron/main/services/git/index.ts` — менеджер git-операций (per-repo instance).
2. `electron/main/services/git/exec.ts` — обёртка `execGit(args: string[], cwd: string)`.
3. Реализованные методы:
   - `status(repoPath)` → `GitStatus`
   - `log(repoPath, options?: { maxCount?, range? })` → `GitCommit[]`
   - `diff(repoPath, filePath?)` → unified diff
   - `revParse(repoPath, ref?)` → string
4. Типы в `electron/shared/types/git.ts`.

## Acceptance criteria
- [ ] Все методы возвращают типизированные ответы.
- [ ] Пустая ошибка от git (exitCode !== 0) пробрасывается как `GitError` с stdout/stderr.
- [ ] Тесты:
   - unit для парсеров (log → массив коммитов)
   - integration (опционально, через fixture-репо)

## Зависит от
- TASK-020
