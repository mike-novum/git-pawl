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
