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
- [x] Все методы возвращают типизированные ответы.
- [x] Пустая ошибка от git (exitCode !== 0) пробрасывается как `GitError` с stdout/stderr.
- [x] Тесты:
   - unit для парсеров (log → массив коммитов)
   - integration (опционально, через fixture-репо)

## Зависит от
- TASK-020

## Статус: DONE — read-only git сервис (status, log, diff, rev-parse) с парсерами, типизированным IPC и тестами

### Что сделано
- `electron/shared/types/git.ts` — типы и `GitError`: `FileStatus`, `BranchInfo`, `GitStatus`, `Commit`, `DiffHunk`, `DiffLine`.
- `electron/main/services/git/exec.ts` — `execGit(args, { cwd, signal?, env?, stdin? })` через `child_process.spawn` с поддержкой `AbortSignal` и возвратом `{ stdout, stderr, exitCode }`.
- `electron/main/services/git/parser.ts` — парсеры `parseStatusPorcelain`, `parseLog`, `parseDiff` с поддержкой `-z` (NUL) разделения и rename-entries.
- `electron/main/services/git/index.ts` — публичные функции `gitStatus`, `gitLog`, `gitDiff`, `gitRevParse` с валидацией пути (`resolve` + проверка `.git`), пробросом `AbortSignal` и пробросом `GitError` при ненулевом exit code.
- `electron/main/services/git/parser.test.ts` — 18 unit-тестов для парсеров (status с upstream/detached/rename/untracked/ignored, log одиночный и multi-commit, diff с hunks/multiple files/new file).
- `electron/main/index.ts` — обновлены хендлеры: `safeHandle(IPC_CHANNELS.GIT_STATUS, gitStatusSchema, gitStatus)` и т.д.
- `electron/preload/index.ts` — типизированные возвраты `gitStatus: Promise<GitStatus>`, `gitLog: Promise<GitCommit[]>`, `gitDiff: Promise<DiffHunk[]>`, `gitRevParse: Promise<string>`.
- `vite.config.ts` — vitest теперь подхватывает `electron/**/*.test.ts`.

### Acceptance criteria
- [x] Все методы возвращают типизированные ответы (`GitStatus`, `Commit[]`, `DiffHunk[]`, `string`).
- [x] Пустая ошибка от git (exitCode !== 0) пробрасывается как `GitError` с stdout/stderr/cwd/args.
- [x] Unit-тесты парсеров проходят (`npm test`: 19 passed).
- [x] `npm run tsc` чистый.
- [x] `npm run lint` без ошибок по новым файлам.

### Заметки для ревьюера
- Парсер `parseStatusPorcelain` корректно обрабатывает формат с `-z`: для rename-entries (`XY old\0new`) следующая после статуса запись читается как новый путь, а не разделяется по NUL.
- `GitError` пробрасывается именно до прелоада (через IPC pipeline `safeHandle`), рендер получает `Error.message` и `code` от git-а.
- Используется `child_process.spawn` (не `exec`), чтобы не упереться в лимит буфера на больших репо.
- `ensureRepoPath` проверяет, что путь абсолютный, существует и содержит `.git`, чтобы не выполнять git-команды вне репозитория.

