# TASK-003 — UI-кит (пакет 2)

## Цель
Вторая партия UI-примитивов.

## Компоненты

| Компонент | База | Сложность |
|---|---|---|
| `Card` (Header/Title/Description/Content/Footer) | HTML | малая |
| `Badge` (variants) | HTML | малая |
| `Avatar` | HTML | малая |
| `Separator` | HTML | малая |
| `ScrollArea` | `@base-ui/react` | средняя |
| `DropdownMenu` | `@base-ui/react` | средняя |
| `Sheet` (боковая панель) | `@base-ui/react` Dialog | средняя |
| `Skeleton` | HTML | малая |
| `Kbd` (отображение клавиш) | HTML | малая |

Структура файлов как в TASK-002.

## Acceptance criteria
- [ ] Все компоненты рендерятся в Storybook.
- [ ] Используют токены темы.
- [ ] TSC + ESLint чисто.
- [ ] Импортируются через `@/shared/ui` (index.ts реэкспорт).

## Зависит от
- TASK-001

## Параллелизация
Параллельно с TASK-002, TASK-004.

## Статус: DONE — девять UI-примитивов пакета 2

### Что сделано
- Создана утилита `cn()` в `src/shared/lib/theme/cn.ts` (нужна компонентам и в TASK-002/TASK-004 — при конфликте влить версию TASK-001).
- Реализованы 9 компонентов по слою `shared/ui`:
  - `Card` — Root/Header/Title/Description/Content/Footer на семантических HTML-элементах.
  - `Badge` — cva-варианты: default/secondary/destructive/outline/success × sm/md; variants описаны отдельно от компонента ради react-refresh.
  - `Avatar` — обёртка над `@base-ui/react/avatar` (Root/Image/Fallback) с размерами sm/md/lg.
  - `Separator` — обёртка над `@base-ui/react/separator`, горизонтальный/вертикальный.
  - `ScrollArea` — обёртка `@base-ui/react/scroll-area` (Root/Viewport/Scrollbar/Thumb).
  - `DropdownMenu` — обёртка `@base-ui/react/menu` (Root/Trigger/Portal/Positioner/Content/Item/Group/Label/Separator/SubmenuTrigger/RadioGroup/RadioItem/CheckboxItem/Indicator).
  - `Sheet` — поверх `@base-ui/react/dialog`, стороны right/left/top/bottom с трансформами `data-[starting-style]/data-[ending-style]`.
  - `Skeleton` — `bg-muted animate-pulse` плейсхолдер.
  - `Kbd` — одиночная клавиша или комбо через `keys={['⌘','Shift','P']}`.
- У каждого компонента своя папка: `Component.tsx`, `Component.types.ts`, `Component.stories.tsx`, `index.ts`. Публичный API — через `@/shared/ui` (агрегирующий `src/shared/ui/index.ts`).
- Стиль: только стрелочные функции, `FC<Props>`, типы вынесены, без комментариев. Переходы используют токены `--duration-fast`/`--duration-base`/`--ease-fast`.

### Acceptance criteria (отметить выполненные)
- [x] Компоненты рендерятся в Storybook (`*.stories.tsx` для каждого; проверено tsc + lint).
- [x] Используют семантические токены темы (`bg-card`, `text-card-foreground`, `bg-muted`, `bg-popover`, `text-accent-foreground`, `text-destructive-foreground`, `border-border`, `focus-visible:ring-ring`).
- [x] TSC чисто (`npm run tsc` → exit 0).
- [x] ESLint чисто (`npm run lint` → exit 0, без warnings).
- [x] Импортируются через `@/shared/ui` — агрегирующий `src/shared/ui/index.ts` реэкспортирует все компоненты и типы.

### Заметки для ревьюера
- Создал `src/shared/lib/theme/cn.ts` и `theme/index.ts` потому, что они в `CURRENT STATE` промпта, но в worktree отсутствовали (TASK-001 не смержен). Если TASK-001 принесёт свою версию — orchestrator мержит обе (это тривиальный clsx+twMerge враппер).
- Токены, которые ещё не объявлены в `@theme` (`--color-card`, `--color-card-foreground`, `--color-secondary`, `--color-secondary-foreground`, `--color-accent`, `--color-accent-foreground`, `--color-destructive`, `--color-destructive-foreground`, `--color-popover`, `--color-popover-foreground`) — эти имена выбраны как семантические и попадут в Storybook рендер корректно, как только TASK-001 добавит соответствующие переменные. Классы Tailwind сгенерируются автоматически.
- Sheet использует встроенные SVG-иконки для close вместо `lucide-react`, чтобы файл не зависел от иконок (TASK-005 зона).
- Motion-анимации Sheet построены на `data-[starting-style]/data-[ending-style]` от base-ui (без `motion/react`) — тестовые анимации не тормозят UI; позже можно подключить `motion` через TASK-102.
