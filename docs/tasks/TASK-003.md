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
| `ScrollArea` | Base UI | средняя |
| `DropdownMenu` | Base UI | средняя |
| `Sheet` (боковая панель) | Base UI Dialog | средняя |
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
