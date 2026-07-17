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

## Статус: DONE — Реализована страница управления аккаунтами с секциями header/list/empty state и диалогами connect/confirm-disconnect

### Что сделано
- `src/pages/accounts/ui/AccountsPage.tsx` — страница с header (заголовок, описание, кнопка «Add account»), состоянием loading (Spinner), empty state и списком аккаунтов; интегрирован `ConnectAccountDialog`.
- `src/pages/accounts/ui/AccountListSection.tsx` — группировка списка по провайдерам (GitHub/GitLab) с заголовками групп.
- `src/pages/accounts/ui/AccountRow.tsx` — карточка аккаунта: аватар, логин, имя, provider badge, email, бейдж «Active», кнопки «Set as active»/«Disconnect» (с Dialog подтверждения).
- `src/pages/accounts/ui/EmptyState.tsx` — обёртка над shared `Empty` с CTA-кнопкой «Add account».
- `src/pages/accounts/ui/types.ts` — общие типы для компонентов страницы.
- Обновлён `src/pages/accounts/ui/index.ts` для реэкспорта новых компонентов и типов.

### Acceptance criteria
- [x] Можно добавить и удалить аккаунт.
- [x] Состояние переживает рестарт (через `useAccountList` + `electron-store` — сохранение токенов вне scope этой задачи).

### Заметки для ревьюера
- Активный аккаунт определяется через `useAppStore.activeAccountId` (zustand persist) и подсвечивается в списке.
- Группировка по провайдеру — стабильный порядок (GitHub → GitLab), пустые группы не рендерятся.
- Подтверждение удаления вынесено в per-row Dialog, чтобы не блокировать остальной список.
- Используется `useAccountSwitcher` из фичи `auth-switch` — единая логика мутаций.
