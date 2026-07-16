# TASK-051 — Feature: clone-repo (по URL)

## Цель
Клонирование репозитория по URL.

## Что сделать
1. `src/features/clone-repo/ui/CloneByUrlForm.tsx`:
   - Input URL + Input dest (директория в активном workspace).
   - Submit → `window.api.git.clone({ url, dest, onProgress })`.
2. Прогресс отображается через Progress или inline в форме.
3. По завершении — закрыть диалог, обновить `useRepositoryList`.

## Acceptance criteria
- [ ] Клонирует реальный репо.
- [ ] Прогресс отображается в UI.
- [ ] При ошибке (invalid URL) — понятное сообщение.

## Зависит от
- TASK-002, TASK-022
