# TASK-200 — Code review pass

## Цель
Прогон ревью на каждой завершённой фиче/UI-кит-блоке через сабагента `code-reviewer`.

## Как запускается
Main-агент после `DONE` любой задачи вызывает сабагента:
```
type: claude-code-guide / general-purpose / claude
prompt: "Проведи code review для изменений в docs/tasks/TASK-NNN-"
```

## Что проверяет ревьюер
- Соответствие AGENTS.md (стрелочные функции, FC, типы в types.ts, no comments unless requested).
- Соответствие FSD (`fsd-core`, `fsd-segments` skills) — imports только нижестоящих слоёв.
- ESLint и TSC проходят (запустить `npm run lint`, `npm run tsc`).
- Edge cases (отмена операции, ошибки сети, пустые данные).
- Дублирование кода.
- Сложность компонентов (размер, ответственности).

## Output ревьюера
Список findings (file:line, severity, suggestion). Main-агент выдаёт правки разработчику.

## Зависит от
По мере закрытия задач.
