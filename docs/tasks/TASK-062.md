# TASK-062 — Feature: git-push

## Цель
UI для `git push`.

## Acceptance criteria
- [x] Кнопка в RepoHeader.
- [x] Конфликт/отказ — toast с stderr.
- [x] Индикация во время выполнения.

## Зависит от
- TASK-022, TASK-060

## Статус: DONE — фича git-push готова

### Что сделано
- Создан slice `src/features/git-push/` со слоями `ui` и `model`, public API через `index.ts`.
- `useGitPush` — react-query мутация: вызывает `window.api.gitPush({ repoPath })`, инвалидирует `git-status`, `branches`, `commits` для репозитория.
- `PushButton` — UI-kit Button с лоадером из `loading` пропа, веткой в лейбле, success/error toast'ами.
- Соблюдён стиль AGENTS.md: стрелочные функции, `FC<Props>`, типы в `types.ts`, без комментариев.
- `npm run tsc` и `eslint` чисто.
