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
