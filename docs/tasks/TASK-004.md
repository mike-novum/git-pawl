# TASK-004 — UI-кит (пакет 3)

## Цель
Третья партия UI-примитивов: data-display и overlays.

## Компоненты

| Компонент | База | Сложность |
|---|---|---|
| `Table` (стили) | HTML | малая |
| `Popover` | `@base-ui/react` | средняя |
| `Command` (command palette) | `@base-ui/react` + cmdk | большая |
| `Progress` | HTML/SVG | малая |
| `Switch` | `@base-ui/react` | малая |
| `Slider` | `@base-ui/react` | малая |
| `Accordion` | `@base-ui/react` | средняя |
| `Empty` (заглушка пустого состояния) | HTML | малая |
| `Spinner` / `Loader` | SVG | малая |
| `ResizablePanel` | react-resizable-panels | средняя |

Структура файлов — стандартная (TASK-002).

## Acceptance criteria
- [ ] Все компоненты рендерятся в Storybook.
- [ ] `Command` работает (поиск, ⬆⬇ + Enter).
- [ ] TSC + ESLint чисто.

## Зависит от
- TASK-001

## Параллелизация
Параллельно с TASK-002, TASK-003.

## Заметки
- `Command` лучше сделать на `cmdk` — проверенная библиотека.
- `Empty` — базовый блок для всех пустых состояний (нет репо, нет коммитов, нет аккаунтов).

## Статус: DONE — UI-кит (пакет 3) собран, Storybook собирается со всеми историями

### Что сделано
- Установлены `cmdk@^1.1.1` и `react-resizable-panels@^4.12.2` (добавлены в `package.json`).
- Добавлен `cn()` хелпер в `src/shared/lib/theme/cn.ts` (clsx + tailwind-merge) и его public API.
- Реализованы 10 UI-компонентов в `src/shared/ui/<name>/` (`.tsx`, `.types.ts`, `.stories.tsx`, `index.ts`):
  - `Table` (Table/Header/Body/Row/Head/Cell) — HTML
  - `Popover` (Root/Trigger/Portal/Positioner/Content/Arrow/Title/Description/Close) — `@base-ui/react`
  - `Command` (Root/Dialog/Input/List/Empty/Loading/Group/Item/Separator) — `cmdk`
  - `Progress` (Root/Track/Indicator/Value/Label) — `@base-ui/react`
  - `Switch` (Root/Thumb) — `@base-ui/react`
  - `Slider` (Root/Control/Track/Indicator/Thumb/Value/Label) — `@base-ui/react`, поддержка single + range
  - `Accordion` (Root/Item/Header/Trigger/Panel) — `@base-ui/react`
  - `Empty` (icon + title + description + опциональный action) — HTML + lucide-react
  - `Spinner` (sizes: sm/md/lg) — SVG
  - `ResizablePanel` (Root/PanelGroup/Panel/PanelResizeHandle) — `react-resizable-panels`
- Каждый компонент имеет 2+ stories, использует `cn()` и семантические токены (`background`, `foreground`, `primary`, `primary-foreground`, `muted`, `muted-foreground`, `border`, `ring`).
- Создан `src/shared/ui/index.ts` — единая точка реэкспорта для всех UI-пакетов 1–3.
- `npm run tsc` — чисто (включая `electron/tsconfig.json`).
- `npm run lint` — чисто.
- `npx storybook build` собирается успешно со всеми 10 историями.

### Acceptance criteria (отметить выполненные)
- [x] Все компоненты рендерятся в Storybook.
- [x] `Command` работает (поиск, ⬆⬇ + Enter — встроено в cmdk).
- [x] TSC + ESLint чисто.

### Заметки для ревьюера
- Использованы только те семантические токены, что определены в `globals.css` (`--color-background`, `--color-foreground`, `--color-primary`, `--color-primary-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-border`, `--color-ring`). Никаких `card`/`popover`/`destructive` токенов — их нет в TASK-001.
- В `Popover.tsx` `Portal` отделён от `Positioner`/`Content` — это даёт пользователю полный контроль над рендерингом и переиспользование.
- В `Accordion.tsx` `Root` сделан через дженерик `TValue`, чтобы TS правильно выводил тип значения (single vs multiple).
- В `Empty.tsx` иконка по умолчанию — `FolderOpen` (lucide-react); можно переопределить через `icon` prop.
- `Spinner` использует `animate-spin` из Tailwind v4 — это встроенная утилита, не требует `tailwindcss-animate`.
- В `cn.ts` добавлен минимально-необходимый хелпер (т.к. TASK-001 ещё не закрыт в момент работы этой задачи). При merge возможен конфликт с реализацией TASK-001 — функция идентична по семантике.
- Компоненты ничего не импортируют из TASK-002/003 (`button`, `dialog`, `card` и т.п.) — каждый самодостаточен.
