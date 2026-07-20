# TASK-211 — WorkspaceToolbar: убрать фон и нижнюю границу

## Баг
В `src/pages/workspace/ui/WorkspaceToolbar.tsx:16` toolbar использует `bg-surface border-border sticky top-0 z-10 ... border-b px-1 py-2`. Пользователь просит убрать фон и нижнее подчёркивание (border-b), чтобы toolbar выглядел более лёгким.

## Что сделать
1. Открыть `src/pages/workspace/ui/WorkspaceToolbar.tsx`.
2. Удалить `bg-surface` и `border-b border-border` из className корневого `<div>`. Sticky-поведение можно оставить (`sticky top-0 z-10`), если нужно для прокрутки.
3. Проверить визуально, что toolbar не имеет фона и подчёркивания.

## Acceptance criteria
- [x] Toolbar не имеет фона и нижней границы.
- [x] Sticky-поведение сохранено (если было нужно).
- [x] `npm run tsc` + `eslint` проходят без ошибок.

## Зависит от
—

## Статус: DONE — из className корневого `<div>` убраны `bg-surface` и `border-b border-border`.

### Что сделано
- Из `src/pages/workspace/ui/WorkspaceToolbar.tsx` удалены `bg-surface` и `border-b border-border`.
- Итоговый className корневого `<div>`: `sticky top-0 z-10 flex items-center gap-2 px-1 py-2`.
- Sticky-поведение сохранено.

### Заметки для ревьюера
- Изменён только className корневого `<div>`, других правок не было.