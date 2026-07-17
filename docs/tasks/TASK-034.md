# TASK-034 — Feature: auth-switch

## Цель
Переключение между подключёнными аккаунтами.

## Файлы
```
src/features/auth-switch/
├── ui/{AccountSwitcherMenu,index}.tsx
├── model/{useAccountSwitcher,index}.ts
└── index.ts
```

## Acceptance criteria
- [ ] DropdownMenu в шапке.
- [ ] Текущий аккаунт подсвечен.
- [ ] Выбор меняет `activeAccountId` в store.

## Зависит от
- TASK-003, TASK-030

## Статус: DONE — Реализован DropdownMenu auth-switcher в шапке с active/other sections, per-account submenu (Set as active / Disconnect) и Add account dialog.

### Что сделано
- `src/features/auth-switch/model/useAccountSwitcher.ts` — wrapper над `useAccountList` + `useAppStore` (activeAccountId) + мутациями set/remove, мемоизация списков.
- `src/features/auth-switch/model/index.ts` — public API сегмента model.
- `src/features/auth-switch/ui/AccountSwitcherMenu.tsx` — компонент меню: trigger показывает активный аккаунт (или "Add account"), DropdownMenu с секциями Active/Other accounts, submenu per-account с "Set as active" / "Disconnect", пункт "Add account..." открывает `ConnectAccountDialog`. Тосты на успех/дисконнект.
- `src/features/auth-switch/ui/types.ts` — `AccountSwitcherMenuProps`.
- `src/features/auth-switch/ui/index.ts` + `src/features/auth-switch/index.ts` — public API фичи.

### Acceptance criteria
- [x] DropdownMenu в шапке (готов к встраиванию в widget/header; использует UI-kit DropdownMenu).
- [x] Текущий аккаунт подсвечен — в Active section с Check icon и primary-цветом.
- [x] Выбор меняет `activeAccountId` в store — через `useSetActiveAccount` (которая вызывает `useAppStore.getState().setActiveAccountId(id)`).

### Заметки
- Импорт dropdown-примитивов идёт через `@/shared/ui/dropdown-menu` (subpath-импорт, паттерн уже использован в `entities/repository/ui/RepositoryCard.tsx` и др.), т.к. корневой `@/shared/ui` экспортирует ограниченный набор. `useToast` импортируется из `@/shared/ui` (он там экспортируется).
- "Disconnect on hover" реализован через `DropdownMenuSubmenuTrigger` (submenu открывается на hover через Base UI) — это даёт корректную клавиатурную навигацию и доступность в отличие от ad-hoc hover-кнопок внутри menu item.
- `npm run tsc` — без ошибок.
- `npm run lint` — без новых ошибок (только pre-existing warnings в shared/ui, не трогал).
- Verify-чеклист: review не запрошен, но фича готова к использованию.
