# TASK-028 — Entity: commit, branch, tag, stash, file-change

## Цель
Доменные сущности для остальных git-объектов.

## Файлы
```
src/entities/commit/
├── model/{useCommit,types,index}.ts
├── ui/{CommitRow,CommitHash,index}.tsx
└── index.ts

src/entities/branch/
├── model/{useBranch,types,index}.ts
├── ui/{BranchBadge,BranchSwitcher,index}.tsx
└── index.ts

src/entities/tag/
├── model/{useTag,types,index}.ts
├── ui/{TagBadge,index}.tsx
└── index.ts

src/entities/stash/
├── model/{useStash,types,index}.ts
├── ui/{StashRow,index}.tsx
└── index.ts

src/entities/file-change/
├── model/{useFileChanges,types,index}.ts
├── ui/{FileChangeRow,index}.tsx
└── index.ts
```

## Acceptance criteria
- [ ] Все сущности типизированы.
- [ ] Hooks используют React Query.
- [ ] UI-компоненты переиспользуют UI-кит (Badge, Avatar).
- [ ] TSC + ESLint чисто.

## Зависит от
- TASK-021
