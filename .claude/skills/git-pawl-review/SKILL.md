---
name: git-pawl-review
description: Code review workflow for git-pawl. Use when main-agent asks to review a TASK-NNN — covers AGENTS.md style, FSD compliance, types, edge cases.
---

# git-pawl Code Review

Сабагент-ревьюер читает завершённую задачу и ищет проблемы.

## 1. Контекст

Прочитай:
- Задачу: `docs/tasks/TASK-NNN-*.md`
- Архитектуру: `docs/architecture/architecture.md`
- `AGENTS.md`
- `.claude/skills/fsd-core/SKILL.md`
- `.claude/skills/fsd-segments/SKILL.md`

## 2. Что проверять

### A. Соответствие стилю (AGENTS.md)
- [ ] Стрелочные функции, нет `function`.
- [ ] `FC<Props>` для React-компонентов.
- [ ] Типы вынесены в `types.ts`.
- [ ] Нет лишних комментариев.
- [ ] Нет enum-ов (literal types).
- [ ] Названия не слишком длинные (≤ 5 слов).

### B. FSD
- [ ] Код в правильном слое/слайсе.
- [ ] Импорты только из нижестоящих слоёв.
- [ ] Public API через `index.ts`, не прямые импорты.
- [ ] Нет циклов.

### C. Типы
- [ ] Все публичные функции типизированы.
- [ ] Нет `any` (или есть обоснование).
- [ ] Опасные операции помечены (--no-verify, force-push, hard-reset).

### D. Корректность
- [ ] Edge cases: пустые данные, ошибки сети, отмена.
- [ ] Async-ошибки обрабатываются.
- [ ] IPC-payload валидируется через zod.

### E. Качество
- [ ] Нет дублирования.
- [ ] Файлы < 250 строк (если больше — возможно стоит разбить).
- [ ] Компоненты выполняют одну задачу.

### F. Тесты
- [ ] Юнит-тесты для утилит.
- [ ] Storybook-история для UI.

## 3. Проверка командой

```bash
npm run tsc
npm run lint
npm test --run
```

## 4. Формат ответа

Список findings по убыванию серьёзности:

```
## CRITICAL (блокер)
- file:line — описание

## MAJOR (нужно исправить)
- file:line — описание

## MINOR (стиль / улучшение)
- file:line — описание

## VERIFIED OK
- ...
```

Если findings нет:
```
VERDICT: PASS — задача соответствует требованиям, можно мержить.
```

## 5. Не делай

- ❌ Не правь код сам — только находи проблемы.
- ❌ Не спорь о вкусах (отступы, длина строк) — это minor или игнор.
- ❌ Не предлагай внешние библиотеки, если задача не требует.

## 6. После ревью

Сообщи main-агенту:
- TASK-NNN готово/не готово.
- Список конкретных правок.
