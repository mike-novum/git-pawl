# TASK-069 — Feature: bypass-hooks

## Acceptance criteria
- [x] Чекбокс «Bypass pre-commit hooks» в commit-форме.
- [x] Передаёт `--no-verify` в `git commit`.

## Зависит от
- TASK-023

## Что сделано

Создан срез `src/features/bypass-hooks/`:
- `ui/BypassHooksToggle.tsx` — контролируемый чекбокс на базе `@/shared/ui` `Checkbox`, вызывает `onChange(checked)`.
- `ui/types.ts` — `BypassHooksToggleProps`.
- `ui/index.ts`, `model/index.ts`, корневой `index.ts` — публичные API.
- `model/useBypassHooks.ts` — хук `{ value, setValue, isActive }` с персистом состояния в `localStorage` ключ `git-pawl:bypass-hooks`.

Передача `--no-verify` в `git commit` будет реализована в слое commit (TASK-084), использующем хук этой фичи.
