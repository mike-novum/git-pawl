# TASK-209 — WorkspaceSettingsDrawer: реализовать реальное удаление воркспейса

## Баг
В `src/pages/workspace/ui/WorkspaceSettingsDrawer.tsx` колбэк `onDelete` (приходит из `WorkspacePage.handleDelete`) только показывает тост и переходит на `/workspaces`, но реально не удаляет воркспейс из store. Из-за этого воркспейс остаётся в списке на `/workspaces` и в `WorkspaceSelector`. Нужно удалять только метаданные воркспейса в store (`workspace-list`), но **НЕ трогать файлы на диске**.

## Что сделать
1. Изучить, как хранится список воркспейсов: `electron/main/services/fs.ts` (WORKSPACE_STORE_KEY = 'workspaces'), IPC-каналы `fsWorkspaceList` / `fsWorkspaceCreate`.
2. Добавить новый IPC-канал `fsWorkspaceRemove({ id })`, который удаляет воркспейс из store по `id`. Файлы на диске НЕ трогать.
3. Экспонировать в preload, shared types, IPC-клиенте (`src/shared/api`).
4. В entity `workspace/api/workspaceApi.ts` добавить `removeWorkspace({ id })`.
5. В `src/entities/workspace/model/useWorkspace.ts` добавить хук `useRemoveWorkspace()` (мутация через `useMutation`, инвалидирует `WORKSPACE_LIST_QUERY_KEY`).
6. В `WorkspacePage.handleDelete` вызвать этот хук; после успеха — тост + navigate на `/workspaces`.
7. Если активный workspaceId совпадает с удалённым — сбросить `activeWorkspaceId` в `useAppStore`.

## Acceptance criteria
- [ ] После подтверждения удаления воркспейс пропадает из `/workspaces` и из `WorkspaceSelector`.
- [ ] Файлы на диске НЕ удаляются.
- [ ] Активный workspaceId сбрасывается, если удалили активный.
- [ ] `npm run tsc` + `eslint` проходят без ошибок.
- [ ] Если есть тесты для workspace entity — обновить/добавить.

## Зависит от
—

## Статус
⏳ pending