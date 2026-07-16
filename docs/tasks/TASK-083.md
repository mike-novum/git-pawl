# TASK-083 — Widget: commit-message-form

## Цель
Редактор commit message с раздельными полями.

## Что сделать
1. Поля:
   - Header (subject) — одна строка, ≤ 72 символов, с подсветкой лимита.
   - Body — multiline textarea.
   - Footer — multiline textarea (для breaking change, etc.).
2. Preview собранного сообщения.
3. Кнопка «Commit» вызывает commit-changes (TASK-084).
4. Чекбокс «Bypass hooks» (TASK-069).
5. Кнопка «Amend» (TASK-066).

## Acceptance criteria
- [ ] Валидация: header не пустой, ≤ 72 символов (визуально подсветить).
- [ ] Структура message соответствует Conventional Commits (опционально, если не указано).

## Зависит от
- TASK-002
