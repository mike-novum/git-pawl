# TASK-026 — fs-сервис: размер директории, иконка репо, workspace create

## Цель
Файловые операции, которые нужны UI.

## Методы
- `selectDirectory()` — открывает native dialog `dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] })`.
- `getRepoSize(repoPath)` → `{ totalBytes, fileCount, .gitBytes }` — рекурсивный обход с игнором `.git/objects`.
- `setRepoIcon(repoPath, sourceImagePath)`:
  - читает изображение, ресайзит до 256×256
  - сохраняет как `icon.png` или `icon.jpg` в корень repo (выбор формата по расширению исходника)
- `removeRepoIcon(repoPath)`
- `createWorkspace(path)` — создать workspace manifest (или просто зарегистрировать).

## Acceptance criteria
- [ ] `getRepoSize` исключает `.git` внутренние файлы (или хотя бы показывает отдельный размер .git).
- [ ] `setRepoIcon` обрезает до квадрата.
- [ ] `selectDirectory` открывает диалог в Electron main.

## Зависит от
- TASK-020

## Параллелизация
Параллельно с git-сервисами.

## Статус: DONE — fs-сервис реализован, IPC прокинут, тесты зелёные

### Что сделано
- `electron/shared/types/fs.ts` — типы `RepoSize`, `Workspace`
- `electron/shared/schemas.ts` — обновлены `fsSizeSchema` (repoPath), `fsIconSchema` (дискриминированный union set/remove), `fsWorkspaceListSchema` (noArgs); добавлены `fsSelectDirectorySchema` (noArgs) и `fsWorkspaceCreateSchema`
- `electron/shared/ipc-channels.ts` — новые каналы `fs:select-directory`, `fs:workspace-create`
- `electron/main/services/fs.ts` — `selectDirectory`, `getRepoSize`, `setRepoIcon`, `removeRepoIcon`, `workspaceList`, `workspaceCreate`. Обход с лимитом конкурентности (16 параллельных readdir), `.git/objects` исключается из общего размера и считается отдельно как `gitBytes`, симлинки игнорируются. Иконка: sharp `fit: cover` обрезает до квадрата 256×256, формат выбирается по расширению источника (.png/.jpg), старые icon.png/icon.jpg удаляются.
- `electron/main/index.ts` — `fs:*` хендлеры подключены вместо echo
- `electron/preload/index.ts` — обновлены типы и `window.api` (fsIcon теперь `Promise<void>`, добавлены `fsSelectDirectory` и `fsWorkspaceCreate`)
- `src/shared/api/ipc.ts` — обёртки `fsSelectDirectory`, `fsWorkspaceCreate`; `fsWorkspaceList` теперь без аргументов; `fsIcon` типизирован как `Promise<void>`
- `electron/main/services/fs.test.ts` — 11 unit-тестов (размер с/без .git, симлинки, несуществующий путь, файл вместо директории, глубокая вложенность, workspace create/list/duplicate)
- `vite.config.ts` — добавлены electron тесты (`environmentMatchGlobs: node`)

### Acceptance criteria
- [x] `getRepoSize` исключает `.git/objects` из `totalBytes/fileCount` и считает их отдельно в `gitBytes`
- [x] `setRepoIcon` обрезает до квадрата (sharp `fit: cover`, 256×256)
- [x] `selectDirectory` открывает диалог `openDirectory + createDirectory`
- [x] `workspaceCreate` регистрирует workspace в electron-store
- [x] tsc/eslint clean
- [x] vitest 11/11 passing

### Заметки для ревьюера
- В `electron/shared/schemas.ts` тип `FsIconArgs` стал discriminated union; в `electron/main/index.ts` дискриминатор используется в обёртке для маршрутизации в `setRepoIcon`/`removeRepoIcon`.
- Path validation: пути резолвятся в абсолютные, проверяется существование и тип (директория/файл); разрешённые пользовательские пути (user-allowed paths) не вводились — задача для будущего, если потребуется.
