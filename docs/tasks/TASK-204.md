# TASK-204 — RepoCard: выровнять размер по левому краю карточки

## Баг
В `src/pages/workspace/ui/RepoCard.tsx` блок с размером репозитория использует `flex items-center justify-end`, из-за чего размер прижимается к правому краю. В карточках, где нет branch-бэйджа, размер «прыгает» по горизонтали относительно карточек с веткой. Нужно прибить размер к левому краю.

## Что сделать
1. Открыть `src/pages/workspace/ui/RepoCard.tsx`.
2. В блоке `<div className="text-muted-foreground flex items-center justify-end text-xs">` заменить `justify-end` на `justify-start`.
3. При необходимости добавить `gap-1` если иконки нет.
4. Проверить визуально, что текст размера во всех карточках выровнен одинаково слева.

## Acceptance criteria
- [ ] Размер репозитория во всех карточках прибит к левому краю.
- [ ] `npm run tsc` + `eslint` проходят без ошибок.

## Зависит от
—

## Статус
⏳ pending