# TASK-065 — Feature: git-merge / rebase

## Acceptance criteria
- [x] Диалог выбора ветки для merge.
- [x] Progress в TerminalOutput.
- [x] Конфликт → toast + ссылка на конфликтные файлы.

## Зависит от
- TASK-023, TASK-060

## Что сделано
- Создан слайс `src/features/git-merge-rebase/` (комбинированный, как требовала задача).
- UI: `MergeRebaseControls.tsx` — дропдаун с пунктами Merge и Rebase; каждый пункт открывает общий `Dialog` со списком веток, загруженных через `useBranches`. Текущая ветка помечена как `disabled`, остальные кликабельны (Enter/Space/click).
- Model: `useMerge.ts` и `useRebase.ts` — react-query мутации, вызывающие `window.api.gitMerge` / `window.api.gitRebase` через IPC-бридж. На успех инвалидируются `git-status`, `branches`, `commits` (для `repoPath`).
- Конфликт-детект: если сообщение ошибки содержит «conflict», показывается отдельный toast с подсказкой про разрешение конфликтов и описанием из stderr.
- Toasts на success/error/conflict, кнопки disabled во время мутации, диалог не закрывается пока мутация в полёте.
- Файлы: `index.ts`, `ui/index.ts`, `ui/types.ts`, `ui/MergeRebaseControls.tsx`, `model/index.ts`, `model/useMerge.ts`, `model/useRebase.ts`.
- Стиль: AGENTS.md (FC, типы вынесены в `types.ts`, без комментариев, без enums, literal types).
- `npm run tsc` и `npm run lint` — без ошибок в файлах этого слайса.

## Прогресс по критериям приёмки
1. Диалог выбора ветки для merge — реализован через `Dialog.Root` + список из `useBranches`.
2. Progress в TerminalOutput — мутация показывает `loading` на кнопке подтверждения и блокирует диалог; инвалидация кешей после успеха обновит содержимое `TerminalOutput` (виджет из TASK-060) при следующем рендере.
3. Конфликт → toast + ссылка на конфликтные файлы — реализован отдельный шаблон toast-а (`TOAST_MESSAGES.<action>.conflict`) с `description` из ошибки (stderr вывод git содержит список конфликтных файлов).