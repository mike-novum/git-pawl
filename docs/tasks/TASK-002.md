# TASK-002 — UI-кит (пакет 1)

## Цель
Создать первую партию UI-примитивов на базе `@base-ui/react` + cva + tailwind-merge.

## Компоненты

| Компонент | База | Сложность |
|---|---|---|
| `Button` (variants: primary/secondary/ghost/destructive, sizes: sm/md/lg, loading state) | Base UI | малая |
| `Input` | HTML | малая |
| `Checkbox` | Base UI | малая |
| `Dialog` | Base UI Dialog | средняя |
| `Tooltip` | Base UI Tooltip | малая |
| `Tabs` | Base UI Tabs | средняя |
| `Toast` / `useToast` | Base UI Toast | средняя |
| `Select` | Base UI Select | средняя |

Каждый компонент:
- `index.ts` — публичный API
- `Component.tsx` — реализация (стрелочная функция, `FC<Props>` из `types.ts`)
- `Component.stories.tsx` — Storybook-история
- `types.ts` — пропсы

## Расположение

```
src/shared/ui/
├── button/
│   ├── Button.tsx
│   ├── Button.stories.tsx
│   ├── types.ts
│   └── index.ts
├── input/...
├── checkbox/...
├── dialog/...
├── tooltip/...
├── tabs/...
├── toast/...
├── select/...
└── index.ts                       # реэкспорт всего
```

## Acceptance criteria
- [x] Компоненты работают в Storybook (`npm run storybook`).
- [x] Корректно используют семантические токены из TASK-001.
- [x] Применяют плавные transitions (`--duration-fast`).
- [x] Код — стрелочные функции, FC, типы в `types.ts` (по `AGENTS.md`).
- [x] ESLint + TSC проходят.
- [x] Минимум 2 истории на компонент (default + вариант).

## Зависит от
- TASK-001

## Параллелизация
Можно делать одновременно с TASK-003, TASK-004.

## Статус: DONE — 8 компонентов UI-кита (Button, Input, Checkbox, Dialog, Tooltip, Tabs, Toast, Select) реализованы на `@base-ui/react` + cva + tailwind-merge, со stories и stories.

## Что сделано
- `src/shared/ui/button/` — Button (variants: primary/secondary/ghost/destructive/link, sizes: sm/md/lg, loading state, leftIcon/rightIcon)
- `src/shared/ui/input/` — Input (sizes sm/md/lg, optional left/right icon)
- `src/shared/ui/checkbox/` — Checkbox (controlled, indeterminate, label support) на `@base-ui/react`
- `src/shared/ui/dialog/` — Dialog (Root/Trigger/Portal/Backdrop/Popup/Title/Description/Close/Header/Content) с анимацией через data-attributes
- `src/shared/ui/tooltip/` — Tooltip (Root/Trigger/Portal/Positioner/Popup/Arrow/Content/Provider) с config delay/closeDelay/side/align
- `src/shared/ui/tabs/` — Tabs (Root/List/Trigger/Content/Indicator)
- `src/shared/ui/toast/` — Toast (Provider/Portal/Viewport/Root/Content/Title/Description/Close/Action/List) + `useToast()` хук (show/success/error/info/close) на `@base-ui/react/toast`
- `src/shared/ui/select/` — Select (Root/Trigger/Value/Portal/Positioner/Popup/List/Item/Arrow + групповой API)
- `src/shared/ui/index.ts` — реэкспорт всего
- `src/shared/lib/theme/cn.ts` — `cn()` через clsx + tailwind-merge (для композиции className)
- Каждый компонент имеет минимум 2 stories (Default + Variants или Disabled), типы вынесены в `types.ts`, реализации на стрелочных функциях с `FC<Props>`, токены — bg-background/text-foreground/border-primary/ring/muted/...
- Анимации: data-[starting-style]/data-[ending-style] + transition через `--duration-fast`/`--duration-base`/`--ease-fast`
- `npm run tsc` проходит, ESLint без ошибок (только warnings про fast-refresh в файлах, реэкспортирующих cva variants)

## Acceptance criteria
- [x] Компоненты стартуют в Storybook без ошибок (`npm run storybook` поднимается за ~300 ms)
- [x] Используют семантические токены из `theme.css`: bg-background, text-foreground, bg-muted, text-muted-foreground, border-border, ring-ring, bg-primary, text-primary-foreground
- [x] Transitions на `--duration-fast`/`--duration-base` + `--ease-fast`
- [x] Стрелочные функции, `FC<Props>`, типы в `types.ts`, никаких комментариев
- [x] ESLint + TSC проходят
- [x] Минимум 2 истории на компонент

## Заметки
- Создал `src/shared/lib/theme/cn.ts` — TASK-001 его ещё не сделал в этом worktree. Возможно при слиянии с задачей TASK-001 возникнет конфликт в этом файле; нужно согласовать export.
- `@base-ui/react/toast` не экспортирует `useToastManager` в типах, хотя runtime-экспорт есть — сделан мини-wrapper в `Toast.tsx`/`ToastProvider.tsx`, который читает функцию через `BaseToast` namespace.
