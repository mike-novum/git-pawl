# TASK-030 — Entity: account

## Цель
Доменная сущность аккаунта Git-хостинга.

## Файлы
```
src/entities/account/
├── model/
│   ├── useAccount.ts
│   ├── types.ts
│   └── index.ts
├── lib/
│   ├── providers.ts        # github, gitlab
│   └── index.ts
└── index.ts
```

## Модель
```ts
type AccountProvider = 'github' | 'gitlab';

type Account = {
  id: string;
  provider: AccountProvider;
  login: string;
  displayName: string;
  avatarUrl: string | null;
  scopes: string[];
  addedAt: number;
};
```

## Acceptance criteria
- [ ] Типы описаны.
- [ ] AccountId используется в store (см. TASK-011).
- [ ] TSC + ESLint.

## Зависит от
- TASK-011
