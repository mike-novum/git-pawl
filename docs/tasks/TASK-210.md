# TASK-210 — Drawer: затемнить backdrop в темной теме

## Баг
В `src/shared/ui/drawer/Drawer.tsx:41` backdrop использует `bg-foreground/40`. В темной теме это слишком светло и плохо контрастирует с панелью. Нужно сделать более тёмный/насыщенный backdrop для dark mode.

## Что сделать
1. Открыть `src/shared/ui/drawer/Drawer.tsx`.
2. Заменить `bg-foreground/40` на токен, который имеет разные значения для light/dark.
3. Вариант 1: использовать существующий токен (`bg-overlay` / `bg-scrim` если есть), либо создать новый семантический токен `--color-overlay` в `src/app/styles/theme.css` + `light.css` с разной opacity для dark/light.
4. Применить backdrop-blur (`backdrop-blur-sm`) для более современного вида.

## Acceptance criteria
- [x] Backdrop drawer'а в темной теме заметно темнее и лучше контрастирует.
- [x] В светлой теме backdrop остаётся читаемым.
- [x] `npm run tsc` + `eslint` проходят без ошибок.

## Зависит от
—

## Статус: DONE — добавлен семантический токен `--color-overlay` с разной alpha для dark/light, применён `backdrop-blur-sm`

### Что сделано
- В `src/app/styles/theme.css` добавлен `--color-overlay: oklch(0 0 0 / 0.6)` (dark default).
- В `src/app/styles/light.css` добавлен override `--color-overlay: oklch(0.20 0.015 250 / 0.4)`.
- В `src/shared/ui/drawer/Drawer.tsx` `bg-foreground/40` заменён на `bg-overlay backdrop-blur-sm`.

### Заметки для ревьюера
- Tailwind v4 автоматически генерирует утилиту `bg-overlay` из переменной `--color-overlay` в блоке `@theme`.
- Существующие компоненты Dialog/Sheet используют `bg-black/60 backdrop-blur-sm` напрямую — их можно мигрировать на `bg-overlay` отдельным PR, чтобы сохранить единый токен.