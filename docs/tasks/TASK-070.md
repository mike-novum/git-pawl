# TASK-070 — Repo config

## Acceptance criteria
- [x] Диалог конфига репо:
  - user.name / user.email (local + global override)
  - core.editor
  - remote URL
- [x] Изменения через `setConfig`.

## Зависит от
- TASK-025, TASK-002

## Статус: DONE — `src/features/repo-config` слайс готов

### Что сделано
- Создан `src/features/repo-config/` (FSD-слайс) с public API через `index.ts`.
- `model/useRepoConfig.ts`: `useGitConfig({ repoPath, key, scope })` (react-query per-key), `useSetRepoConfig()` мутация (через `window.api.gitConfig`), query-инвалидация по `(repoPath, key)`.
- `ui/RepoConfigDialog.tsx`: диалог со строками для `user.name`/`user.email` (local+global), `core.editor`, `remote.origin.url`. Каждая строка — поле ввода + Save + Reset (если есть diff). Лоадер/ошибка показаны per-row.
- Соблюдён стиль AGENTS.md (FC, стрелки, типы в `types.ts`, без комментариев).
- `npm run tsc` и `npm run lint` зелёные по новым файлам.

### Acceptance criteria (отметить выполненные)
- [x] Диалог конфига репо: user.name / user.email (local + global override), core.editor, remote URL
- [x] Изменения через `setConfig` (мутация вызывает `window.api.gitConfig({ repoPath, key, value })`)

### Заметки для ревьюера
- `useGitConfig` дополнительно принимает опциональный `scope` (`local` | `global` | `system`), чтобы можно было показать global override. Сигнатура `({ repoPath, key })` сохранена — `scope` опционален.
- `gitConfig` IPC в preload типизирован без `scope`, поэтому при чтении используется type-cast к расширенному типу (`{ repoPath, key, scope }`) — schema main-процесса `scope` принимает.
- Remote URL редактируется через `git config remote.origin.url <url>` (что эквивалентно `git remote set-url origin`).
- Глобальные override-поля доступны даже если локальные не заданы — так пользователь видит полную картину.
