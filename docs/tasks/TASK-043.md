# TASK-043 — Page: workspace

## Цель
Главная страница со списком репозиториев и поиском.

## Что сделать
1. `src/pages/workspace/ui/WorkspacePage.tsx`:
   - Header: имя workspace + кнопки "Add repo", "Clone".
   - Search input (fuzzy).
   - Сетка карточек репо: иконка, имя, текущая ветка, статус (clean/dirty), размер.
2. Подключает `useRepositoryList()` из TASK-027.
3. Подключает `search-repos` feature.
4. Empty-состояние, если нет репо.

## Acceptance criteria
- [ ] Поиск фильтрует в реальном времени.
- [ ] Клик по репо → переход на `/repo/:id`.

## Зависит от
- TASK-027, TASK-040, TASK-002, TASK-053
