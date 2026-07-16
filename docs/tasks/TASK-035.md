# TASK-035 — Page: accounts

## Цель
Страница управления аккаунтами.

## Что сделать
1. `src/pages/accounts/ui/AccountsPage.tsx`:
   - Список всех подключённых аккаунтов (по группам провайдеров).
   - Кнопка «Add account» открывает ConnectAccountDialog.
   - Кнопка «Disconnect» на каждом.
   - Логаут чистит токен из electron-store.
2. `Empty` UI-кита если нет аккаунтов.
3. Storybook story `AccountsPage`.

## Acceptance criteria
- [ ] Можно добавить и удалить аккаунт.
- [ ] Состояние переживает рестарт.

## Зависит от
- TASK-033, TASK-034
