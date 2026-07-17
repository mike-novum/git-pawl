# TASK-061 — Feature: git-pull

## Цель
UI для `git pull`.

## Acceptance criteria
- [x] Кнопка в RepoHeader/меню.
- [x] При успехе — toast + обновление commit-списка.
- [x] Ошибка отображается.

## Зависит от
- TASK-022, TASK-060

## Что сделано
- `src/features/git-pull/ui/PullButton.tsx` — Button (UI-kit) c иконкой `GitBranch` + `Download`, отображает branch name; показывает spinner от `Button.loading` пока мутация в pending.
- `src/features/git-pull/model/useGitPull.ts` — react-query `useMutation`, вызывает `window.api.gitPull({ repoPath })`, на успех инвалидирует `['git-status', repoPath]`, `['branches', repoPath]`, `['commits', repoPath]`.
- Toast-уведомления: success/error показываются из UI-компонента через `useToast` (success — `Pull complete`, error — `Pull failed` с `err.message`).
- Public API вынесено в `index.ts` + `ui/index.ts` + `model/index.ts`.
- `npm run tsc` — clean, `npm run lint` — 0 errors, в новых файлах 0 warnings.
