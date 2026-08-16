# Задачи git-pawl

## Прогресс по фазам

| Фаза | Задач | Готово | Осталось |
|---|---|---|---|
| 0 — инициализация | 1 | 1 | 0 |
| 1 — UI-фундамент | 6 | 6 | 0 |
| 2 — App shell | 3 | 3 | 0 |
| 3 — Доменные сущности (ipc/git/fs/entity:repository) | 11 | 11 | 0 |
| 4 — Auth | 6 | 6 | 0 |
| 5 — Workspaces | 4 | 4 | 0 |
| 6 — Clone & listing | 5 | 5 | 0 |
| 7 — UI для git-операций | 11 | 11 | 0 |
| 8 — Changes & commit | 5 | 5 | 0 |
| 9 — Commit graph | 3 | 3 | 0 |
| 10 — Полировка | 5 | 4 | 1 (TASK-102 skip) |
| 11 — Code review (TASK-200) | 1 | 1 | 0 ✅ |
| 12 — Баги roadmap-5 | 12 | 10 | 2 (TASK-208 код сделан, но статус не подтверждён; TASK-213 отсутствует) |
| 13 — Доработки roadmap-6 | 5 | 5 | 0 ✅ |
| 15 — Баги графа (fix/graph-edges) | 8 | 8 | 0 ✅ |
| 16 — Доработки roadmap-9 | 8 | 0 | 8 |
| **Итого** | **92** | **74** | **18** |

## 16 — Доработки roadmap-9

| ID | Тема | Статус |
|---|---|---|
| TASK-319 | RepoTree: переключение ветки по клику | ✅ done |
| TASK-320 | Кнопки Pull/Push: индикация загрузки и тосты | 🔧 in_progress |
| TASK-321 | Кнопка Fetch: реальное действие + анимация рефреша | ✅ done |
| TASK-322 | Граф: hover-скейл только на наведённом коммите | ✅ done |
| TASK-323 | RepoTree: модалка создания новой ветки | ✅ done |
| TASK-324 | RepoDetailPanel: список изменённых файлов + форма коммита | ✅ done |
| TASK-325 | Граф: отображение Uncommited changes | ✅ done |
| TASK-326 | Кнопка глобальных настроек: оставить только на главной | ✅ done |

## 15 — Баги графа (на ветке fix/graph-edges)

| ID | Тема | Статус |
|---|---|---|
| TASK-308 | Граф: убрать stray edges внизу и скруглить углы lane-переходов | ✅ done |
| TASK-309 | Граф: заменить разорванный curve на SourceTree-style S-curve | ✅ done |
| TASK-310 | Граф: непрерывные линии между строками (incoming + outgoing в каждой row) | ✅ done |
| TASK-311 | Граф: переписать на правильный DAG-алгоритм с одним SVG на колонку | ✅ done |
| TASK-312 | Граф: hover-анимация точки-коммита (transform-box: fill-box) | ✅ done |
| TASK-313 | Граф: исправить порядок коммитов через git log --topo-order | ✅ done |
| TASK-314 | Граф: распределить коммиты по lanes их веток (branch-aware DAG) | ✅ done |
| TASK-315 | Граф: расширить commit.branches[] до всей истории ветки (не только tips) | ⏳ pending (TASK-316 перепишет) |
| TASK-316 | Граф: правильно определить коммиты на каждой ветке через git rev-list | ⏳ pending (TASK-317 перепишет) |
| TASK-317 | Граф: переписать на first-parent mainline алгоритм (SourceTree-style) | ✅ done |
| TASK-318 | Граф: показывать чипы веток только у TIP-коммитов | ✅ done |

## 14 — Доработки roadmap-7

| ID | Тема | Статус |
|---|---|---|
| TASK-305 | WorkspaceSettingsDrawer: корректное сохранение и отображение иконки воркспейса | ✅ done |
| TASK-306 | Граф коммитов: визуальный редизайн под уровень SourceTree / GitKraken | ✅ done |
| TASK-307 | Граф коммитов: фикс связей, phantom-коммит, SourceTree-style рендер, table columns | ✅ done |

## 13 — Доработки roadmap-6

| ID | Тема | Статус |
|---|---|---|
| TASK-300 | WorkspaceTile: убрать артефакт "—" рядом со счётчиком репозиториев | ✅ done |
| TASK-301 | WorkspaceHero: persist-store + shimmer-skeleton для счётчиков | ✅ done (хук сохранён, не подключён после рефакторинга) |
| TASK-302 | Перенести path + счётчики воркспейса в шапку (рядом с селектором) | ✅ done |
| TASK-303 | Drawer: убрать белый бордер у боковой панели настроек воркспейса | ✅ done |
| TASK-304 | Переделать граф коммитов на нормальное дерево (ветки/теги/сообщения) | ✅ done (follow-up: memo CommitRow, cap chips, bounded SVG) |

## 12 — Баги roadmap-5

| ID | Тема | Статус |
|---|---|---|
| TASK-202 | RepoCard: отступ между размером и иконкой папки | ✅ done |
| TASK-203 | AppLayout: скрыть кнопку настроек на `/settings` | ✅ done |
| TASK-204 | RepoCard: выровнять размер по левому краю | ✅ done |
| TASK-205 | CreateWorkspace: не инвалидировать кэш при отмене | ✅ done |
| TASK-206 | WorkspaceSettings: добавить выбор иконки | ✅ done |
| TASK-207 | RepositoryHeader: скрыть селектор воркспейсов на странице репо | ✅ done |
| TASK-208 | RepositoryPage: передавать `repo.path` вместо `repo.id` | ⏳ pending (код сделан в `WorkspacePage.handleRepoClick`, требуется проверка AC) |
| TASK-209 | Workspace: IPC `fsWorkspaceRemove` + useRemoveWorkspace | ✅ done |
| TASK-210 | Drawer: тёмный backdrop в тёмной теме | ✅ done |
| TASK-211 | WorkspaceToolbar: убрать фон и нижнюю границу | ✅ done |
| TASK-212 | WorkspaceHero: компактный info-блок | ✅ done |
