# git-pawl — документация для разработки

Это рабочая документация для сабагентов и разработчиков. Вся правда о структуре системы и задачах — здесь.

## Содержание

- [`architecture/architecture.md`](architecture/architecture.md) — **архитектура**: FSD-слои, IPC-контракты, дизайн-токены, стек.
- [`plans/plan.md`](plans/plan.md) — общий план разработки по фазам.
- [`tasks/`](tasks/) — индивидуальные задачи `TASK-NNN-*.md` + `README.md` со статусом.
- [`skills/git-pawl-workflow`](../.claude/skills/git-pawl-workflow/SKILL.md) — workflow для сабагента-разработчика.
- [`skills/git-pawl-review`](../.claude/skills/git-pawl-review/SKILL.md) — workflow для сабагента-ревьюера.

## Быстрый старт для сабагента

1. Открой `tasks/README.md` — найди ⏳ задачу без открытых зависимостей.
2. Прочитай её файл `TASK-NNN-*.md`.
3. Прочитай `architecture/architecture.md` и `AGENTS.md`.
4. Следуй `git-pawl-workflow` скиллу.
5. По окончании — обнови статус в `tasks/README.md` и конце `TASK-NNN*.md`.

## Корневые правила (кратко)

- FSD: слои `app → pages → widgets → features → entities → shared`. Импорт только нижестоящих.
- React: стрелочные функции, `FC<Props>`, типы в `types.ts`.
- TypeScript: literal types вместо enum, никаких `any` без обоснования.
- Комментарии в коде только по запросу.
- ESLint 9 flat config + Prettier.
- Все IPC через zod-валидацию, токены не попадают в renderer.
- Тёмная тема по умолчанию, оранжевый primary.
