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

## Статус: DONE — Создано 5 entity-слайсов с типами, react-query хуками и UI-компонентами.

### Что сделано
- **commit**: `Commit` тип (ре-экспорт из `@electron/shared/types/git`), `useCommitList(repoPath, { maxCount })` react-query хук, `CommitRow` (avatar + hash + subject + author + relative date), `CommitHash` (short hash с monospace кодом).
- **branch**: `Branch` тип с `current`/`upstream`; `useBranches(repoPath)` загружает список через `git:branch list` + мержит текущую ветку из `git:status`; `useCurrentBranch(repoPath)` через `git:status`; `BranchBadge` и интерактивный `BranchSwitcher` (listbox с клавиатурной навигацией).
- **tag**: `Tag` тип (re-export из shared), `useTags(repoPath)` через `git:tag list`, `TagBadge` с разными variant для annotated vs lightweight.
- **stash**: `StashEntry` тип; `useStashList(repoPath)` как placeholder (`listStash` пока возвращает `[]`) — `git:stash` IPC не поддерживает list action (push/pop/apply/drop only), задокументировано в `PLACEHOLDER_NOTE`. `StashRow` готов показывать данные, как только backend добавит list.
- **file-change**: `FileChange` тип (status `M`/`A`/`D`/`??`/`R`/`!!` + staged/unstaged) вычисляется из `git:status` через маппер `toFileChange`; `useFileChanges(repoPath)` react-query с `refetchInterval: 5_000`; `FileChangeRow` показывает basename+directory+иконку по статусу+бейджи staged/unstaged.
- Все entity-слайсы экспортируются через public API `index.ts`; ни один не импортирует из соседних entity-слайсов; импорты только из `shared`.

### Acceptance criteria (отметить)
- [x] Все сущности типизированы.
- [x] Hooks используют React Query.
- [x] UI-компоненты переиспользуют UI-кит (Badge, Avatar).
- [x] TSC + ESLint чисто.

### Заметки для ревьюера
- stash.list остаётся placeholder до добавления `list` действия в `git:stash` IPC; см. `PLACEHOLDER_NOTE` в `src/entities/stash/api/stashApi.ts`. UI и хук уже готовы.
- `useCurrentBranch` получает данные из уже-доступного `git:status` (а не из `git:current-branch`, который пока не выставлен в preload), чтобы не трогать `electron/`.
- В ветках разделитель upstream в сыром выводе парсится по-простому (только ref); ahead/behind всегда 0 — когда понадобится точный подсчёт, добавим отдельный запрос или расширим парсер.
- Конструкция `upstream: undefined` в `buildBranches` нужна для TypeScript с `satisfies Branch` (тип опциональный, но без явного `undefined` требовался).

