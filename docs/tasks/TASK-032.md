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
