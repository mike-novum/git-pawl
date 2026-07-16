# TASK-025 — git-сервис: tags, patch, config, hooks bypass

## Цель
Расширенные операции.

## Методы
- `tags({ repoPath, action: 'list'|'create'|'delete', name?, target?, message?, annotated? })`
- `createPatch({ repoPath, range, dest })` — `git format-patch [range] --output-directory [dest]`
- `applyPatch({ repoPath, file, threeWay? })` — `git am [file]` или `git apply`
- `getConfig(repoPath, scope: 'local'|'global'|'system', key?)` → string | map
- `setConfig(repoPath, scope, key, value)`
- `unsetConfig(...)`
- `listHooks(repoPath)` → записи `pre-commit`, `commit-msg`, etc.

## Acceptance criteria
- [ ] Patch — генерирует `.patch` файл, можно выбрать директорию.
- [ ] Config поддерживает все 3 scope.
- [ ] Hooks listing используется для отображения.

## Зависит от
- TASK-020
