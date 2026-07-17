# Tasks Index

Все задачи для разработки `git-pawl`. Каждая задача — отдельный файл, который читает сабагент.

| Файл | Фаза | Название | Зависит от | Статус |
|---|---|---|---|---|
| [TASK-000.md](TASK-000.md) | 0 | Инициализация проекта | — | ✅ |
| [TASK-001.md](TASK-001.md) | 1 | Дизайн-токены и темы | TASK-000 | ✅ |
| [TASK-002.md](TASK-002.md) | 1 | UI-кит (пакет 1) | TASK-001 | ✅ |
| [TASK-003.md](TASK-003.md) | 1 | UI-кит (пакет 2) | TASK-001 | ✅ |
| [TASK-004.md](TASK-004.md) | 1 | UI-кит (пакет 3) | TASK-001 | ✅ |
| [TASK-005.md](TASK-005.md) | 1 | Иконка приложения (cat paw) | TASK-000 | ✅ |
| [TASK-006.md](TASK-006.md) | 1 | Storybook сборка | TASK-002..004 | ⏳ |
| [TASK-010.md](TASK-010.md) | 2 | App-shell, роутинг, IPC bridge | TASK-000 | ✅ |
| [TASK-011.md](TASK-011.md) | 2 | Store + electron-store | TASK-010 | ✅ |
| [TASK-012.md](TASK-012.md) | 2 | Переключение тем | TASK-001, TASK-011 | ✅ |
| [TASK-020.md](TASK-020.md) | 3 | IPC-мост с валидацией | TASK-010 | ✅ |
| [TASK-021.md](TASK-021.md) | 3 | git: status, log, diff, rev-parse | TASK-020 | ✅ |
| [TASK-022.md](TASK-022.md) | 3 | git: clone, fetch, pull, push | TASK-020 | ✅ |
| [TASK-023.md](TASK-023.md) | 3 | git: commit, stash, merge, rebase | TASK-020 | ✅ |
| [TASK-024.md](TASK-024.md) | 3 | git: reset, revert, amend, checkout, branch | TASK-020 | ✅ |
| [TASK-025.md](TASK-025.md) | 3 | git: tags, patch, config, hooks | TASK-020 | ✅ |
| [TASK-026.md](TASK-026.md) | 3 | fs: размер, иконка, workspace | TASK-020 | ✅ |
| [TASK-027.md](TASK-027.md) | 3 | Entity: repository | TASK-021, TASK-026 | ✅ |
| [TASK-028.md](TASK-028.md) | 3 | Entity: commit, branch, tag, stash, file-change | TASK-021 | ✅ |
| [TASK-030.md](TASK-030.md) | 4 | Entity: account | TASK-011 | ✅ |
| [TASK-031.md](TASK-031.md) | 4 | GitHub auth | TASK-030 | ✅ |
| [TASK-032.md](TASK-032.md) | 4 | GitLab auth | TASK-030 | ✅ |
| [TASK-033.md](TASK-033.md) | 4 | Feature: auth-login | TASK-031, TASK-032 | ✅ |
| [TASK-034.md](TASK-034.md) | 4 | Feature: auth-switch | TASK-030 | ✅ |
| [TASK-035.md](TASK-035.md) | 4 | Page: accounts | TASK-033, TASK-034 | ✅ |
| [TASK-040.md](TASK-040.md) | 5 | Entity: workspace | TASK-011, TASK-026 | ✅ |
| [TASK-041.md](TASK-041.md) | 5 | Feature: workspace-create | TASK-040 | ✅ |
| [TASK-042.md](TASK-042.md) | 5 | Widget: workspace-switcher | TASK-040 | ✅ |
| [TASK-043.md](TASK-043.md) | 5 | Page: workspace | TASK-027, TASK-040 | ✅ |
| [TASK-050.md](TASK-050.md) | 6 | API: список репо GitHub/GitLab | TASK-031, TASK-032 | ✅ |
| [TASK-051.md](TASK-051.md) | 6 | Feature: clone-repo (URL) | TASK-002, TASK-022 | ✅ |
| [TASK-052.md](TASK-052.md) | 6 | Feature: clone-repo (аккаунт) | TASK-050, TASK-051 | ✅ |
| [TASK-053.md](TASK-053.md) | 6 | Feature: search-repos | TASK-027 | ✅ |
| [TASK-054.md](TASK-054.md) | 6 | Widget: repository-tree | TASK-027 | ✅ |
| [TASK-060.md](TASK-060.md) | 7 | Widget: terminal-output | TASK-002 | ✅ |
| [TASK-061.md](TASK-061.md) | 7 | Feature: git-pull | TASK-022 | ✅ |
| [TASK-062.md](TASK-062.md) | 7 | Feature: git-push | TASK-022 | ✅ |
| [TASK-063.md](TASK-063.md) | 7 | Feature: git-fetch | TASK-022 | ✅ |
| [TASK-064.md](TASK-064.md) | 7 | Feature: git-stash | TASK-023, TASK-028 | ✅ |
| [TASK-065.md](TASK-065.md) | 7 | Feature: git-merge / rebase | TASK-023 | ✅ |
| [TASK-066.md](TASK-066.md) | 7 | Feature: git-reset / revert / amend | TASK-024 | ✅ |
| [TASK-067.md](TASK-067.md) | 7 | Feature: manage-tags | TASK-025, TASK-028 | ✅ |
| [TASK-068.md](TASK-068.md) | 7 | Feature: create-patch | TASK-025 | ✅ |
| [TASK-069.md](TASK-069.md) | 7 | Feature: bypass-hooks | TASK-023 | ✅ |
| [TASK-070.md](TASK-070.md) | 7 | Repo config | TASK-025 | ✅ |
| [TASK-080.md](TASK-080.md) | 8 | Widget: file-changes-panel | TASK-028 | ✅ |
| [TASK-081.md](TASK-081.md) | 8 | Feature: select-files | TASK-080 | ✅ |
| [TASK-082.md](TASK-082.md) | 8 | Feature: preview-diff | TASK-021 | ⏳ |
| [TASK-083.md](TASK-083.md) | 8 | Widget: commit-message-form | TASK-002 | ⏳ |
| [TASK-084.md](TASK-084.md) | 8 | Feature: commit-changes | TASK-081, TASK-083, TASK-023, TASK-069 | ⏳ |
| [TASK-090.md](TASK-090.md) | 9 | Entity: commit-relations | TASK-028 | ⏳ |
| [TASK-091.md](TASK-091.md) | 9 | Widget: commit-graph | TASK-090 | ⏳ |
| [TASK-092.md](TASK-092.md) | 9 | Page: repository (сборка) | TASK-080, TASK-083, TASK-091 | ⏳ |
| [TASK-100.md](TASK-100.md) | 10 | Feature: set-repo-icon | TASK-026 | ⏳ |
| [TASK-101.md](TASK-101.md) | 10 | Feature: total-size | TASK-026 | ⏳ |
| [TASK-102.md](TASK-102.md) | 10 | Анимации | TASK-002, TASK-012 | ⏳ |
| [TASK-103.md](TASK-103.md) | 10 | Глобальные настройки | TASK-103 | ⏳ |
| [TASK-104.md](TASK-104.md) | 10 | Финальная сборка | Все выше | ⏳ |
| [TASK-200.md](TASK-200.md) | 11 | Code review | — | ⏳ |

## Сводка по фазам

| Фаза | Задач | Готово | Осталось |
|---|---|---|---|
| 0 — инициализация | 1 | 1 | 0 |
| 1 — UI-фундамент | 6 | 5 | 1 (TASK-006 Storybook) |
| 2 — App shell | 3 | 3 | 0 |
| 3 — Доменные сущности (ipc/git/fs/entity:repository) | 11 | 8 | 3 (TASK-027 entity:repository, TASK-028 entities) |
| 4 — Auth | 6 | 1 | 5 |
| 5 — Workspaces | 4 | 0 | 4 |
| 6 — Clone & listing | 5 | 0 | 5 |
| 7 — UI для git-операций | 11 | 1 | 10 |
| 8 — Changes & commit | 5 | 0 | 5 |
| 9 — Commit graph | 3 | 0 | 3 |
| 10 — Полировка | 5 | 0 | 5 |
| 11 — Code review | 1 | 0 | 1 |
| **Итого** | **61** | **18** | **43** |

## Порядок работы

1. Сначала доделать Фазу 3 (TASK-027, TASK-028 — обе на чистых файлах в `src/entities/`, без конфликтов с shared).
2. Затем Фаза 4 (auth).
3. Дальше по фазам.

**Правило:**
- Каждую фазу делаем последовательно (один сабагент → мердж → проверка → следующая).
- Параллелить можно, только если сабагенты НЕ трогают общие файлы (никаких shared/*, никаких preload/main/index.ts между ними).
- Если есть риск конфликта — последовательно.

## Статусы

- ⏳ pending
- 🔧 in_progress
- ✅ done
- ⚠️ blocked

Когда сабагент заканчивает задачу, он ОБЯЗАН:
1. Дописать блок «Что сделано» + «Acceptance criteria (отметить)» в свой файл `TASK-NNN.md`.
2. Обновить ОДНУ строку в `docs/tasks/README.md` (не плодить дубли).
3. Сообщить main-агенту.
