# TASK-064 — Feature: git-stash

## Цель
UI для stash-операций.

## Acceptance criteria
- [x] Dropdown: push с message, pop, apply, drop.
- [ ] Список stash-записей (виджет из entities/stash).
- [ ] Dropdown на каждой записи.

## Зависит от
- TASK-023, TASK-028, TASK-060

## Что сделано
- Создан `src/features/git-stash/` со слоями `ui/` и `model/`.
- `ui/StashControls.tsx` — DropdownMenu с пунктами Push / Pop / Apply / Drop; для Push открывается Dialog с опциональным полем сообщения.
- `model/useStashPush.ts`, `useStashPop.ts`, `useStashApply.ts`, `useStashDrop.ts` — react-query мутации, каждая вызывает `window.api.gitStash({ repoPath, action, message?, ref? })` и инвалидирует `['git-status', repoPath]`. Успех/ошибка тостифицируются.
- Публичные API: `ui/index.ts`, `model/index.ts`, корневой `index.ts`.
- `npm run tsc` — чисто, `npm run lint` — без новых ворнингов.
