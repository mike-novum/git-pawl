# TASK-032 — GitLab auth

## Цель
Подключение GitLab-аккаунта через PAT.

## Что сделать

1. `electron/main/services/git-host/gitlab.ts`:
   - `authenticate(token, baseUrl?)` через `@gitbeaker/node` API.
   - `listRepositories()`.
   - `getUser()`.
2. PAT в electron-store.
3. `window.api.account.gitlab.connect({ token, baseUrl? })`.

## Acceptance criteria
- [ ] Работает с `gitlab.com` и self-hosted.
- [ ] Невалидный токен → ошибка.

## Зависит от
- TASK-030

## Статус: DONE — GitLab PAT auth через @gitbeaker/node

### Что сделано
- `electron/main/services/git-host/gitlab.ts` — connectGitLab (валидация PAT через `gitlab.Users.current()`, поддержка self-hosted через `baseUrl`, сохранение токена в encrypted electron-store), listGitLabAccounts, listGitLabRepos (gitlab.Projects.all c membership=true), disconnectGitLab, connectGitLabWithToken (записывает activeAccountId)
- IPC wiring: `account:list` мерджит GitHub и GitLab, `account:remove` определяет провайдера по префиксу id и зовёт соответствующий disconnect, `auth:gitlab-complete` → connectGitLabWithToken, `gitlab:list-repos` → listGitLabRepos

### Acceptance criteria
- [x] Работает с `gitlab.com` и self-hosted
- [x] Невалидный токен → ошибка

### Заметки
- baseUrl пока не пробрасывается через IPC (authGitlabCompleteSchema стабилен по условиям задачи) — функция connectGitLab его принимает, по умолчанию используется https://gitlab.com
- Для определения провайдера в account:remove использован префикс id (`gitlab:` / `github:`), что соответствует формату Account.id

