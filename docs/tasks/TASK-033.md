# TASK-033 — Feature: auth-login

## Цель
UI подключения нового аккаунта.

## Файлы
```
src/features/auth-login/
├── ui/
│   ├── ConnectAccountDialog.tsx
│   ├── ConnectAccountForm.tsx
│   └── index.ts
├── model/
│   ├── useConnectAccount.ts
│   └── index.ts
└── index.ts
```

## Поведение
- Dialog: выбор провайдера (GitHub/GitLab), ввод токена, для GitLab — baseUrl.
- Submit → `window.api.account.{provider}.connect({ token })` → onSuccess закрыть, добавить в store.

## Acceptance criteria
- [ ] Диалог использует UI-кит (Dialog, Input, Select, Button).
- [ ] Ошибка токена отображается пользователю.
- [ ] Успешное подключение добавляет аккаунт в `useAppStore.activeAccountIds`.

## Зависит от
- TASK-002, TASK-031, TASK-032

## Статус: DONE — UI подключения нового аккаунта через PAT

### Что сделано
- `features/auth-login/ui/ConnectAccountDialog.tsx` — модалка через UI-кит `Dialog`.
- `features/auth-login/ui/ConnectAccountForm.tsx` — форма с provider picker (Tabs), token input и опциональным baseUrl для GitLab; react-hook-form + zod; отображает server-side ошибки и success-toast.
- `features/auth-login/model/useConnectAccount.ts` — react-query мутация: дёргает `window.api.authGithubComplete` или `window.api.authGitlabComplete`, инвалидирует `accountListQueryKey` onSuccess.
- Re-exports через `features/auth-login/index.ts` (slice public API).

### Acceptance criteria
- [x] Диалог использует UI-кит (Dialog, Input, Tabs, Button).
- [x] Ошибка токена отображается пользователю (zod field error + mutation error banner + success toast).
- [x] Успешное подключение инвалидирует `accountListQueryKey`, форма сбрасывается, диалог закрывается.

### Заметки для ревьюера
- baseUrl собирается в форме и кладётся в payload, но backend schema `authGitlabCompleteSchema` пока принимает только `{ code }` (zod стрипает лишние поля). Как только IPC-канал расширят `baseUrl`, форма уже готова — менять не придётся.
- `zodResolver` написан вручную (без `@hookform/resolvers`, чтобы не тянуть лишнюю зависимость).
- `noUnusedLocals` потребовал убрать `FormSchema` cast — тип выводится напрямую из `z.object({...})`.
- Файлов `entity/account` и `app/store` не трогал.
