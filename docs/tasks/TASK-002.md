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
- [ ] Компоненты работают в Storybook (`npm run storybook`).
- [ ] Корректно используют семантические токены из TASK-001.
- [ ] Применяют плавные transitions (`--duration-fast`).
- [ ] Код — стрелочные функции, FC, типы в `types.ts` (по `AGENTS.md`).
- [ ] ESLint + TSC проходят.
- [ ] Минимум 2 истории на компонент (default + вариант).

## Зависит от
- TASK-001

## Параллелизация
Можно делать одновременно с TASK-003, TASK-004.
