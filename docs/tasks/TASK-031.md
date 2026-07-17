# TASK-031 — GitHub auth

## Цель
Подключение GitHub-аккаунта через PAT.

## Что сделать

1. `electron/main/services/git-host/github.ts`:
   - `authenticate(token: string)` → проверяет через `octokit.users.getAuthenticated()`.
   - `listRepositories()` → `octokit.repos.listForAuthenticatedUser()`.
   - `getUser()` → login, avatar.
2. PAT хранится в electron-store (зашифрованном), в renderer никогда не попадает.
3. `window.api.account.github.connect({ token })` → возвращает `Account`.

## Acceptance criteria
- [ ] Успешная авторизация возвращает профиль.
- [ ] Невалидный токен → ошибка с понятным текстом.
- [ ] Токен не покидает main.

## Зависит от
- TASK-030

## Статус: DONE — GitHub PAT auth через @octokit/rest

### Что сделано
- `electron/shared/types/account.ts` — Account/AccountProvider типы
- `electron/shared/types/git-host.ts` — RepoInfo
- `electron/main/services/git-host/github.ts` — connectGitHub (валидация PAT через octokit.users.getAuthenticated, сохранение токена в encrypted electron-store), listGitHubAccounts, listGitHubRepos (octokit.paginate), disconnectGitHub, connectGitHubWithToken (записывает activeAccountId)
- IPC wiring: account:list реальный, account:set-active → storeSet, account:remove → disconnectGitHub, auth:github-complete → connectGitHubWithToken, github:list-repos → listGitHubRepos

### Acceptance criteria
- [x] Успешная авторизация возвращает профиль
- [x] Невалидный токен → ошибка
- [x] Токен не покидает main

### Заметки
- Сабагент упал по rate-limit; доделал вручную (финальный wiring)
