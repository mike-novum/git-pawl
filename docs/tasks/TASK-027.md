# TASK-027 — Entity: repository

## Цель
Доменная сущность репозитория.

## Файлы
```
src/entities/repository/
├── model/
│   ├── useRepository.ts        # hooks
│   ├── types.ts
│   └── index.ts
├── api/
│   ├── repositoryApi.ts        # IPC-обёртки
│   └── index.ts
├── ui/
│   ├── RepositoryIcon.tsx      # показ иконки из repo
│   ├── RepositoryBadge.tsx
│   └── index.ts
└── index.ts
```

## Модель
```ts
type Repository = {
  id: string;            // path-based
  path: string;
  name: string;
  remoteUrl: string | null;
  currentBranch: string | null;
  hasUncommittedChanges: boolean;
  iconPath: string | null;
  sizeBytes: number | null;
  hooks: { 'pre-commit': boolean; 'commit-msg': boolean; ... };
};
```

## Hooks
- `useRepositoryList()` — список репо в активном workspace.
- `useRepository(id)` — один репо.
- `useRepositorySize(id)` — обновляемый размер.
- `useRepositoryHooks(id)` — список хуков.

## Acceptance criteria
- [ ] TanStack Query для кеша.
- [ ] Все операции проходят через IPC.
- [ ] TSC + ESLint чисто.

## Зависит от
- TASK-021, TASK-026
