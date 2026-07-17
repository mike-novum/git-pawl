# TASK-100 — Feature: set-repo-icon

## Acceptance criteria
- [x] Диалог выбора изображения (file input).
- [x] Превью обрезки до квадрата.
- [x] Сохраняет как `icon.png` или `icon.jpg` (по расширению исходника) в корень репо.
- [x] Иконка обновляется в `RepositoryIcon` UI.

## Зависит от
- TASK-026, TASK-002

## Что сделано

Создан новый FSD-слайс `src/features/set-repo-icon/` с публичной частью:

- `model/useSetRepoIcon.ts` — react-query мутация: вызывает `window.api.fsIcon({ action: 'set', repoPath, sourceImagePath })`, по успеху инвалидирует все относящиеся к репозиторию ключи (`repository`, `repository-list`, `git-status`, `repo-size`), чтобы UI репозитория обновился.
- `ui/SetRepoIconDialog.tsx` — диалог на базе shared `Dialog`: `file input` (`accept="image/*"`), кроп-превью (`aspect-square` + `object-cover`), валидация (только изображения, проверка `file.path`), submit вызывает мутацию, ошибки и успехи отображаются через `useToast`.
- `ui/types.ts` — публичные типы (`SetRepoIconDialogProps`).
- Корневые `index.ts`, `ui/index.ts`, `model/index.ts` — реэкспорт.

Стиль: AGENTS.md — стрелочные компоненты через `FC`, типы вынесены в `types.ts`, минимум `useEffect` (только для отзыва `URL.createObjectURL` при размонтировании/смене URL).

## Status
✅ done

