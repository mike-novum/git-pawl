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
