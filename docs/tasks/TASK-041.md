# TASK-041 — Feature: workspace-create

## Цель
UI создания нового workspace.

## Что сделать
1. Диалог: имя + «Browse» для выбора директории.
2. После выбора — превью найденных репо (через `detectRepos`).
3. Submit → создаёт workspace, переключает `activeWorkspaceId`.

## Acceptance criteria
- [ ] Использует `selectDirectory` из TASK-026.
- [ ] Превью найденных репо.
- [ ] Workspace создаётся и активируется.

## Зависит от
- TASK-040, TASK-002
