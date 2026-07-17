# TASK-063 — Feature: git-fetch

## Цель
UI для `git fetch`.

## Acceptance criteria
- [x] Кнопка `Fetch` (отдельно от Pull).

## Зависит от
- TASK-022, TASK-060

## Что сделано
- `src/features/git-fetch/ui/FetchButton.tsx` — UI-kit Button с `loading` (spinner) и иконкой `RefreshCw`, показывает branch name, вызывает `useGitFetch()`, тосты success/error.
- `src/features/git-fetch/model/useGitFetch.ts` — react-query mutation, вызывает `window.api.gitFetch({ repoPath })`, onSuccess инвалидирует `['branches', repoPath]` и `['commits', repoPath]`.
- `src/features/git-fetch/ui/types.ts`, `ui/index.ts`, `model/index.ts`, корневой `index.ts`.
- `npm run tsc` и `npm run lint` чисто (0 errors).
