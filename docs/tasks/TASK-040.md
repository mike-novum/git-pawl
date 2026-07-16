# TASK-040 — Entity: workspace

## Цель
Доменная сущность рабочего пространства.

## Файлы
```
src/entities/workspace/
├── model/{useWorkspace,types,index}.ts
├── api/{workspaceApi,index}.ts
├── lib/{detectRepos,index}.ts   # сканирует директорию на .git
└── index.ts
```

## Модель
```ts
type Workspace = {
  id: string;
  name: string;
  path: string;
  createdAt: number;
};
```

## Поведение
- `useWorkspaceList()` — список workspace.
- `createWorkspace({ name, path })` — сохраняет в store.
- `detectRepos(path)` — рекурсивно ищет директории с `.git` (с лимитом глубины).

## Acceptance criteria
- [ ] Список workspace персистится.
- [ ] detectRepos находит существующие репо.

## Зависит от
- TASK-011, TASK-026
