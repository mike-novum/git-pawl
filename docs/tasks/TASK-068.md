# TASK-068 — Feature: create-patch

## Цель
Создание патча из диапазона коммитов.

## Acceptance criteria
- [x] Dialog: выбор from/to коммитов.
- [x] Выбор директории для .patch файлов.
- [ ] После создания — открывает Finder с выбранной папкой.

## Зависит от
- TASK-025, TASK-002

## Статус: DONE

### Что сделано
- Создан slice `src/features/create-patch/` с сегментами `ui/` и `model/`.
- `useCreatePatch` — react-query мутация, вызывает `window.api.gitPatch({ repoPath, range, destDir? })` и приводит ответ к `{ files: string[] }`.
- `CreatePatchDialog` — Dialog с двумя cmdk-picker (from/to) и полем destination directory через `window.api.fsSelectDirectory()`.
- Toast'ы на успех (с количеством созданных файлов) и ошибку.
- Стиль/архитектура соответствуют AGENTS.md и FSD (`ui/types.ts`, `ui/index.ts`, `model/index.ts`, корневой `index.ts`).

### Acceptance criteria (отметить выполненные)
- [x] Dialog: выбор from/to коммитов.
- [x] Выбор директории для .patch файлов.
- [ ] После создания — открывает Finder с выбранной папкой. (вне scope: нет IPC для открытия Finder; добавление потребует отдельной задачи и правок в `electron/*`.)

### Заметки для ревьюера
- `window.api.gitPatch` имеет preload-тип `{ repoPath, range }`, но backend-схема `gitPatchSchema` допускает `destDir`. В хуке используется type-cast для передачи `destDir` — runtime поддерживает, тип не менялся (запрещено трогать `electron/*`).
