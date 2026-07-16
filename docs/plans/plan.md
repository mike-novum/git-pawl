# План разработки git-pawl

> Общий порядок реализации. Каждая фаза — набор независимых задач, которые можно параллелить между сабагентами. Полный список задач — в `docs/tasks/`.

## Фаза 0. Подготовка (одна задача — нельзя параллелить)

| ID | Задача | Зависит от |
|---|---|---|
| TASK-000 | Инициализация проекта (Electron+Vite+React+TS+ESLint+Storybook) | — |

После завершения TASK-000 доступны ветки ниже.

---

## Фаза 1. Фундамент UI (после TASK-000, можно параллелить)

| ID | Задача | Зависит от |
|---|---|---|
| TASK-001 | Дизайн-токены и темная тема по умолчанию | TASK-000 |
| TASK-002 | UI-кит: Button, Input, Dialog, Tooltip, Tabs, Toast, Checkbox, Select | TASK-001 |
| TASK-003 | UI-кит: Card, Badge, Avatar, Separator, ScrollArea, DropdownMenu | TASK-001 |
| TASK-004 | UI-кит: Table, Command, Popover, Progress, Skeleton | TASK-001 |
| TASK-005 | Иконка приложения (cat paw) + сборка build/icon.* | TASK-000 |
| TASK-006 | Storybook-сборка под UI-кит | TASK-002..004 |

TASK-002, TASK-003, TASK-004 можно делать параллельно (одинаковые зависимости).

---

## Фаза 2. Каркас приложения (после TASK-001, можно частично параллелить)

| ID | Задача | Зависит от |
|---|---|---|
| TASK-010 | App-shell: layout, роутинг, Electron-preload bridge | TASK-000 |
| TASK-011 | Глобальный store (zustand) + electron-store биндинг | TASK-010 |
| TASK-012 | Тема: переключение dark/light, persist | TASK-001, TASK-011 |

---

## Фаза 3. Доменные сущности — git CLI слой

| ID | Задача | Зависит от |
|---|---|---|
| TASK-020 | IPC: безопасный мост (zod-валидация) | TASK-010 |
| TASK-021 | git-сервис в main: status, log, diff, rev-parse | TASK-020 |
| TASK-022 | git-сервис: clone, fetch, pull, push | TASK-020 |
| TASK-023 | git-сервис: commit, stash, merge, rebase | TASK-020 |
| TASK-024 | git-сервис: reset, revert, amend, checkout, branch | TASK-020 |
| TASK-025 | git-сервис: tags, patch, config (global/local), hooks bypass | TASK-020 |
| TASK-026 | fs-сервис: размер директории, иконка репо | TASK-020 |
| TASK-027 | Entity: repository (модель + hooks) | TASK-021 |
| TASK-028 | Entity: commit, branch, tag, stash, file-change | TASK-021 |

TASK-022..025 можно параллелить.

---

## Фаза 4. Аутентификация

| ID | Задача | Зависит от |
|---|---|---|
| TASK-030 | Entity: account (модель) | TASK-011 |
| TASK-031 | GitHub auth (PAT, потом OAuth device flow) | TASK-030 |
| TASK-032 | GitLab auth (PAT) | TASK-030 |
| TASK-033 | Feature: auth-login (UI подключения аккаунта) | TASK-031, TASK-032, TASK-002 |
| TASK-034 | Feature: auth-switch (UI переключения) | TASK-030, TASK-002 |
| TASK-035 | Page: accounts (список и управление) | TASK-033, TASK-034 |

---

## Фаза 5. Workspaces

| ID | Задача | Зависит от |
|---|---|---|
| TASK-040 | Entity: workspace (модель + persist) | TASK-011, TASK-026 |
| TASK-041 | Feature: workspace-create (выбор директории) | TASK-040, TASK-002 |
| TASK-042 | Widget: workspace-switcher | TASK-040, TASK-002 |
| TASK-043 | Page: workspace (список репозиториев, поиск) | TASK-027, TASK-040, TASK-002 |

---

## Фаза 6. Clone & listing

| ID | Задача | Зависит от |
|---|---|---|
| TASK-050 | API: список репо GitHub/GitLab (TanStack Query) | TASK-031, TASK-032 |
| TASK-051 | Feature: clone-repo (из URL) | TASK-022, TASK-002 |
| TASK-052 | Feature: clone-repo (из списка аккаунта) | TASK-050, TASK-051 |
| TASK-053 | Feature: search-repos | TASK-027, TASK-002 |
| TASK-054 | Widget: repository-tree | TASK-027, TASK-002 |

---

## Фаза 7. Базовые git-операции в UI

| ID | Задача | Зависит от |
|---|---|---|
| TASK-060 | Widget: terminal-output (отображение stdout/stderr) | TASK-002 |
| TASK-061 | Feature: git-pull | TASK-022, TASK-060 |
| TASK-062 | Feature: git-push | TASK-022, TASK-060 |
| TASK-063 | Feature: git-fetch | TASK-022, TASK-060 |
| TASK-064 | Feature: git-stash (push/pop/apply/drop) | TASK-023, TASK-060 |
| TASK-065 | Feature: git-merge / rebase | TASK-023, TASK-060 |
| TASK-066 | Feature: git-reset / revert / amend | TASK-024, TASK-060 |
| TASK-067 | Feature: manage-tags (create/delete) | TASK-025, TASK-060 |
| TASK-068 | Feature: create-patch (диапазон коммитов → .patch) | TASK-025 |
| TASK-069 | Feature: bypass-hooks (флаг --no-verify) | TASK-023 |
| TASK-070 | Repo config (локальный user.name/email + глобальный override) | TASK-025 |

---

## Фаза 8. Changes & commit

| ID | Задача | Зависит от |
|---|---|---|
| TASK-080 | Widget: file-changes-panel (чексбоксы по файлам) | TASK-028, TASK-002 |
| TASK-081 | Feature: select-files (стейт выбранных файлов) | TASK-080 |
| TASK-082 | Feature: preview-diff (просмотр изменений файла) | TASK-021, TASK-002 |
| TASK-083 | Widget: commit-message-form (header/body/footer + bypass) | TASK-002 |
| TASK-084 | Feature: commit-changes (связывает select-files + form + git commit) | TASK-081, TASK-083, TASK-023, TASK-069 |

---

## Фаза 9. Commit graph

| ID | Задача | Зависит от |
|---|---|---|
| TASK-090 | Entity: commit-relations (граф родитель → дети) | TASK-028 |
| TASK-091 | Виджет commit-graph: виртуализация, лейаут в виде слоев (можно начать с SVG) | TASK-090, TASK-002 |
| TASK-092 | Страница репозитория: сборка всех виджетов | TASK-080, TASK-083, TASK-091, TASK-061..067 |

---

## Фаза 10. Полировка

| ID | Задача | Зависит от |
|---|---|---|
| TASK-100 | Feature: set-repo-icon (выбор изображения → icon.png) | TASK-026, TASK-002 |
| TASK-101 | Feature: total-size (агрегат размера .git/working tree) | TASK-026 |
| TASK-102 | Анимации и микровзаимодействия | TASK-002, TASK-012 |
| TASK-103 | Глобальные настройки (тема, fetch auto-pull, default editor) | TASK-012 |
| TASK-104 | Финальная сборка .dmg, README, скриншоты | TASK-105 |

---

## Фаза 11. Ревью

| ID | Задача | Зависит от |
|---|---|---|
| TASK-200 | Code review каждой фазы через subagent `code-reviewer` | Все выше |

---

## Поток работы сабагента

1. Получить задачу `docs/tasks/TASK-NNN-*.md`.
2. Прочитать `docs/architecture/architecture.md` (раздел про свой слой).
3. Следовать правилам из `AGENTS.md` + `fsd-core` + `fsd-segments`.
4. Реализовать.
5. Запустить `npm run lint:fix` (только по своим файлам) и `npm run tsc`.
6. Обновить статус задачи — записать в конце файла `**Статус:** DONE — <короткая сводка>`.
7. Сообщить main-агенту, какой код-ревьюер нужен.
