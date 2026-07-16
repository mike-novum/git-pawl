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
