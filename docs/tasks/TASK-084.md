# TASK-084 — Feature: commit-changes

## Цель
Сборка commit из select-files + commit-message-form + bypass.

## Что сделать
1. Хук `useCommit()`:
   - собирает `CommitMessage { header, body?, footer? }`
   - вызывает `git commit` с `--no-verify` если нужно
   - обрабатывает ошибки
2. UI-интеграция — кнопка "Commit" в форме.

## Acceptance criteria
- [ ] Коммит создаётся с заданным message.
- [ ] `--no-verify` корректно передаётся.
- [ ] После успеха — обновляет commit-список.

## Зависит от
- TASK-081, TASK-083, TASK-023, TASK-069
