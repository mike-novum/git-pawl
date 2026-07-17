# TASK-041 — Feature: workspace-create

## Цель
UI создания нового workspace.

## Что сделать
1. Диалог: имя + «Browse» для выбора директории.
2. После выбора — превью найденных репо (через `detectRepos`).
3. Submit → создаёт workspace, переключает `activeWorkspaceId`.

## Acceptance criteria
- [x] Использует `selectDirectory` из TASK-026.
- [x] Превью найденных репо.
- [x] Workspace создаётся и активируется.

## Зависит от
- TASK-040, TASK-002

## Статус: DONE — реализован UI диалога создания workspace с превью репо и активацией.

### Что сделано
- `src/features/workspace-create/ui/CreateWorkspaceDialog.tsx` — Dialog с input имени, read-only input пути, кнопкой Browse, превью найденных репо (basenames), Cancel/Submit.
- `src/features/workspace-create/ui/types.ts` — тип `CreateWorkspaceDialogProps`.
- `src/features/workspace-create/ui/index.ts` — публичный API сегмента UI.
- `src/features/workspace-create/model/useCreateWorkspaceFlow.ts` — хук-обёртка: scanRepos при выборе пути, стейдж-машина (idle/picking/previewing/submitting), submit через `useCreateWorkspace` (активирует workspace).
- `src/features/workspace-create/model/index.ts` — публичный API сегмента model.
- `src/features/workspace-create/index.ts` — публичный API фичи.
- Toast success/error, ресет состояния при закрытии, отмена мутации через `mutation.reset()`.

