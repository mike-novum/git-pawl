# TASK-210 — Drawer: затемнить backdrop в темной теме

## Баг
В `src/shared/ui/drawer/Drawer.tsx:41` backdrop использует `bg-foreground/40`. В темной теме это слишком светло и плохо контрастирует с панелью. Нужно сделать более тёмный/насыщенный backdrop для dark mode.

## Что сделать
1. Открыть `src/shared/ui/drawer/Drawer.tsx`.
2. Заменить `bg-foreground/40` на токен, который имеет разные значения для light/dark.
3. Вариант 1: использовать существующий токен (`bg-overlay` / `bg-scrim` если есть), либо создать новый семантический токен `--color-overlay` в `src/app/styles/theme.css` + `light.css` с разной opacity для dark/light.
4. Применить backdrop-blur (`backdrop-blur-sm`) для более современного вида.

## Acceptance criteria
- [ ] Backdrop drawer'а в темной теме заметно темнее и лучше контрастирует.
- [ ] В светлой теме backdrop остаётся читаемым.
- [ ] `npm run tsc` + `eslint` проходят без ошибок.

## Зависит от
—

## Статус
⏳ pending