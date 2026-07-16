# TASK-053 — Feature: search-repos

## Цель
Поиск по локальным репозиториям в workspace.

## Что сделать
1. Хук `useRepoSearch(query)` — фильтрует список репо по:
   - name
   - remoteUrl
   - path
2. UI — Input в WorkspacePage header, debounced 150 ms.

## Acceptance criteria
- [ ] Поиск case-insensitive.
- [ ] Поддерживает подстроки (не только prefix).
- [ ] Пустой query — показывает все репо.

## Зависит от
- TASK-027, TASK-002
