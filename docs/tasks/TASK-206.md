# TASK-206 — WorkspaceSettingsDrawer: реализовать смену иконки воркспейса

## Баг
В `src/pages/workspace/ui/WorkspaceSettingsDrawer.tsx` кнопка выбора иконки (секция `<section>` с `<button>Change</button>`) не имеет `onClick` — нажатие ничего не делает.

## Что сделать
1. Открыть `src/pages/workspace/ui/WorkspaceSettingsDrawer.tsx`.
2. Реализовать выбор иконки через IPC-мост `window.api.fsSelectFile` (или аналогичный, посмотреть в `electron/preload/index.ts`/`@electron/shared/types`).
3. Если готового API нет — добавить минимальный IPC-канал в `electron/main` + preload + shared types (FSD: новые файлы под `electron/main/ipc/` + `electron/shared/types/`).
4. При выборе файла — вызвать `onSave(name, iconPath)` или новый колбэк `onIconChange`.
5. В `WorkspacePage` (`src/pages/workspace/ui/WorkspacePage.tsx`) пробросить обработчик, который сохраняет иконку в store (`storeSet` с ключом `workspace-icon:${workspace.id}`).
6. Если MVP-минимум — хотя бы открывать диалог выбора файла и отображать выбранное имя в UI.

## Acceptance criteria
- [ ] Клик по кнопке «Change» открывает системный диалог выбора файла.
- [ ] Выбранный файл отображается как превью или сохраняется в стор.
- [ ] `npm run tsc` + `eslint` проходят без ошибок.
- [ ] FSD-слои соблюдены (новый IPC-канал через shared types).

## Зависит от
—

## Статус
⏳ pending