# TASK-300 — WorkspaceTile: убрать артефакт "—" рядом со счётчиком репозиториев

## Баг
В карточке воркспейса (`src/pages/workspaces/ui/WorkspaceTile.tsx`) рядом со счётчиком репозиториев видно "—" (em-dash):
```
8 repos · —
```
Причина: в `src/pages/workspaces/ui/WorkspacesPage.tsx:104` `lastActivity` всегда захардкожен в `null`, и функция `relativeTime(null)` возвращает `'—'`. В результате тайл всегда показывает "—" после "·".

## Что сделать
1. Открыть `src/pages/workspaces/ui/WorkspacesPage.tsx`.
2. Решить, как обрабатывать `lastActivity === null`. Допустимые варианты:
   - Скрывать блок `· {relativeTime(lastActivity)}` если `lastActivity === null`.
   - Либо сделать `relativeTime(null) = ''` и в JSX условно не рендерить `<span>·</span>` если `lastActivity === null`.
3. Реализовать выбранный вариант.
4. Опционально: завести реальный `lastActivity` через IPC (последняя активность репозиториев) — но это вне scope данной задачи. Достаточно убрать визуальный артефакт.

## Acceptance criteria
- [x] В карточке воркспейса нет символа "—" рядом со счётчиком репозиториев, пока `lastActivity` не реализован.
- [x] `npm run tsc` + `eslint` проходят без ошибок.

## Зависит от
—

## Статус: DONE — блок «· <время>» скрывается при `lastActivity === null`

### Что сделано
- В `WorkspaceTile.tsx` разделитель `·` и `relativeTime(lastActivity)` теперь рендерятся только когда `lastActivity !== null`, обёрнуты в fragment с условием.
- Функция `relativeTime` оставлена без изменений (она ещё пригодится, когда появится реальный `lastActivity`).

### Заметки для ревьюера
- Логика `lastActivity` в `WorkspacesPage.tsx` не трогалась — там всё ещё захардкожен `null`, это вне scope задачи (реальная активность через IPC — отдельная задача).
- Пока `lastActivity` всегда `null`, блок со временем не показывается вообще; карточка выводит только `N repos`.
- `npm run tsc` — без ошибок; `npx eslint src/pages/workspaces --fix --cache` — без ошибок.
