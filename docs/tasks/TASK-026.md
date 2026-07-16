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
