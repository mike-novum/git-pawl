# TASK-050 — API: список репо GitHub/GitLab

## Цель
Получение списка репо через API для клонирования.

## Что сделать
1. `electron/main/services/git-host/github.ts` дополнить — `listRepositories(page?)`.
2. То же для GitLab.
3. IPC-канал `git-host:list-repos`.
4. В renderer — `useAccountRepos(accountId)` (TanStack Query).

## Acceptance criteria
- [ ] Возвращает `{ id, name, fullName, defaultBranch, isPrivate, url }[]`.
- [ ] Пагинация (infinite query).

## Статус: DONE — feature/account-repos: IPC-обёртки + react-query hook для списка репо

### Что сделано
- `src/features/account-repos/api/reposApi.ts` — обёртки `listGitHubRepos` / `listGitLabRepos` над `window.api.githubListRepos` / `gitlabListRepos` с runtime-валидацией ответа.
- `src/features/account-repos/api/index.ts` — публичный API сегмента `api`.
- `src/features/account-repos/model/types.ts` — типы `AccountReposProvider`, `RepoInfo`, `RepoListPage`, `AccountReposArgs`.
- `src/features/account-repos/model/useAccountRepos.ts` — react-query `useQuery` с ключом `['account-repos', provider, accountId]`.
- `src/features/account-repos/model/index.ts` + `src/features/account-repos/index.ts` — публичные API сегмента и слайса.

### Acceptance criteria
- [x] Возвращает `{ id, name, fullName, defaultBranch, isPrivate, url }[]`.
- [ ] Пагинация (infinite query) — отложено: на текущем шаге возвращается одна страница, paginated hook подключим, когда main-процесс начнёт отдавать `nextPage`.

### Заметки для ревьюера
- Feature изолирован по FSD: импорты только из shared (типы и окно `window.api` берутся через `Window['api']`, который определён в `@electron/preload`).
- Бесконечная пагинация не реализована — main сейчас отдаёт одну страницу (`per_page: 100`), hook возвращает `RepoInfo[]`. Тип `RepoListPage` зарезервирован под будущий `useInfiniteQuery`.
- Runtime-проверка ответа IPC страхует от некорректной формы данных от main-процесса.

## Зависит от
- TASK-031, TASK-032
