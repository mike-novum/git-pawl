# TASK-211 — WorkspaceToolbar: убрать фон и нижнюю границу

## Баг
В `src/pages/workspace/ui/WorkspaceToolbar.tsx:16` toolbar использует `bg-surface border-border sticky top-0 z-10 ... border-b px-1 py-2`. Пользователь просит убрать фон и нижнее подчёркивание (border-b), чтобы toolbar выглядел более лёгким.

## Что сделать
1. Открыть `src/pages/workspace/ui/WorkspaceToolbar.tsx`.
2. Удалить `bg-surface` и `border-b border-border` из className корневого `<div>`. Sticky-поведение можно оставить (`sticky top-0 z-10`), если нужно для прокрутки.
3. Проверить визуально, что toolbar не имеет фона и подчёркивания.

## Acceptance criteria
- [ ] Toolbar не имеет фона и нижней границы.
- [ ] Sticky-поведение сохранено (если было нужно).
- [ ] `npm run tsc` + `eslint` проходят без ошибок.

## Зависит от
—

## Статус
⏳ pending