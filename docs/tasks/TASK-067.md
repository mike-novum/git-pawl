# TASK-067 — Feature: manage-tags

## Acceptance criteria
- [x] Список тегов (из entities/tag).
- [x] Create: name, target (branch/commit), annotated?
- [x] Delete с подтверждением.

## Зависит от
- TASK-025, TASK-060, TASK-028

## Что сделано

Создан слайс `src/features/manage-tags/`:
- `ui/TagsPanel.tsx` — список тегов из `useTags(repoPath)`, отображает имя, тип (annotated/lightweight) и target. Кнопка «New tag» открывает диалог создания с полями name, target (с datalist из веток), переключателем annotated и опциональным message. Для каждой строки — кнопка Delete с подтверждением через отдельный Dialog.
- `model/useCreateTag.ts` — react-query мутация вызывает `window.api.gitTag({ repoPath, action: 'create', name, target?, message?, annotated?, force? })`, инвалидирует `tagListQueryKey(repoPath)`.
- `model/useDeleteTag.ts` — react-query мутация вызывает `window.api.gitTag({ repoPath, action: 'delete', name })`, инвалидирует `tagListQueryKey(repoPath)`.
- `ui/types.ts` — `TagsPanelProps`, `ui/index.ts`, `model/index.ts`, корневой `index.ts` для публичного API.

Проверки:
- `npm run tsc` — чисто.
- `npm run lint` — в новом коде 0 ошибок и 0 предупреждений (существующие 7 warning в `src/shared/*` не относятся к этой задаче).
