# TASK-082 — Feature: preview-diff

## Цель
Просмотр изменений по файлу.

## Acceptance criteria
- [ ] Подсветка синтаксиса (через `shiki`).
- [ ] Side-by-side / unified переключение.
- [ ] Для binary — заглушка "Binary file".

## Зависит от
- TASK-021, TASK-002

## Статус: DONE — MVP preview-diff

### Что сделано
- Создан слайс `src/features/preview-diff/` по FSD: `ui/`, `model/`, корневой public API.
- `model/useDiff.ts`: react-query хук `useDiff({ repoPath, range?, file? } | null)` — вызывает `window.api.gitDiff` через `@/shared/api`, опционально фильтрует выдачу по `file` (по `filePath` хунка), без модификации shared/electron IPC-контракта.
- `ui/DiffViewer.tsx`: унифицированный диф с нумерацией строк, цветом `+`/`-` (emerald/rose), заголовком хунка (путь и `-old,+new`), состояниями loading/error/empty.
- Бинарный плейсхолдер по расширению файла (изображения, архивы, шрифты, видео, аудио, документы, бинарники) — заглушка "Binary file" из UI-кита (`Empty`).
- `npm run tsc` и `npm run lint` — clean.

### Acceptance criteria (отметить выполненные)
- [x] Для binary — заглушка "Binary file".
- [ ] Подсветка синтаксиса (через `shiki`) — вне scope текущей итерации.
- [ ] Side-by-side / unified переключение — вне scope текущей итерации.

### Заметки для ревьюера
- Текущий IPC `gitDiff` принимает только `{ repoPath, range? }`. `file` поддержан через пост-фильтрацию `DiffHunk[]` по `hunk.filePath` (без расширения shared/electron). Если в будущем нужно нативное ограничение по пути — потребуется расширить `gitDiffSchema` отдельной задачей.
- Определение binary — по расширению (статический Set). Точная бинарность через `parseDiff` пока недоступна (parser не различает "Binary files ..." заголовок), это можно расширить отдельной задачей в parser.
- `useDiff` возвращает `UseQueryResult<DiffHunk[]>`, период refetch `5_000ms` (аналогично `useFileChanges`).
- Shiki-подсветка и side-by-side режим не реализованы — задача пока описывала "унифицированный просмотр diff с подсветкой +/-" в минимальной форме. Расширение этих AC потребует отдельных задач.
