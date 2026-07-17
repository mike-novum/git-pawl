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

## Статус: DONE — entity:workspace (api + react-query hooks + scanRepos)

### Что сделано
- `src/entities/workspace/api/workspaceApi.ts` — IPC-обёртки над `window.api.fsWorkspaceList`, `fsWorkspaceCreate`, `fsSelectDirectory` с безопасным доступом к bridge.
- `src/entities/workspace/model/types.ts` — типы `Workspace`, `WorkspaceListResult`, `WorkspaceCreateArgs`.
- `src/entities/workspace/model/workspaceQueries.ts` — react-query ключ `WORKSPACE_LIST_QUERY_KEY` + fetchers (`fetchWorkspaceList`, `fetchCreateWorkspace`).
- `src/entities/workspace/model/useWorkspace.ts` — хуки `useWorkspaceList`, `useWorkspace`, `useActiveWorkspace` (читает `useAppStore.activeWorkspaceId`), `useCreateWorkspace` (открывает picker, создаёт workspace, проставляет active, инвалидирует список).
- `src/entities/workspace/lib/scanRepos.ts` — независимая реализация рекурсивного сканера `.git` с лимитом глубины и AbortSignal (FSD: entity не импортирует другой entity).
- Public API в `index.ts` каждого сегмента + корневой.

### Acceptance criteria
- [x] Список workspace персистится (через `electron-store` на main + react-query cache в renderer).
- [x] detectRepos/scanRepos находит существующие репо.
