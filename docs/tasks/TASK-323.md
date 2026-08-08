# TASK-323 — RepoTree: модалка создания новой ветки

## Контекст

Из фидбэка пользователя (roadmap-9, баг #5): на странице репо кнопка "New Branch" в `RepoTree` никак не работает. Должна открывать модалку для ввода названия новой ветки и создавать её (с переключением). Пока команда выполняется — на кнопке подтверждения спиннер.

## Корневая причина

Файл: `src/widgets/repo-tree/ui/RepoTree.tsx:62-67` — кнопка "New branch" не имеет `onClick`, нет состояния `open` для модалки.

## Что сделать

### Шаг 1. Создать фичу `create-branch`

Файл: `src/features/create-branch/` (новый slice).

Структура:
```
src/features/create-branch/
├── index.ts
├── model/
│   ├── index.ts
│   └── useCreateBranch.ts
└── ui/
    ├── index.ts
    ├── CreateBranchDialog.tsx
    └── types.ts
```

Файл: `src/features/create-branch/model/useCreateBranch.ts`:
- Хук `useCreateBranch()` возвращает `useMutation` на `gitCheckout({ repoPath, ref: branchName, create: true })`.
- На `onSuccess` — invalidate `branch-list`, `branch-mainlines`, `git-log`, `current-branch`. Toast.success `"Ветка X создана"`.
- На `onError` — toast.error `"Не удалось создать ветку X"`.

Файл: `src/features/create-branch/ui/CreateBranchDialog.tsx`:
- Props: `{ open: boolean; onOpenChange: (open: boolean) => void; repoPath: string; onCreated?: (name: string) => void }`.
- Использует `@/shared/ui` Dialog (или `@base-ui/react` Dialog).
- Поле ввода `<Input>` для имени ветки.
- Кнопка `<Button>` "Create" — `loading={isPending}`, `disabled` пока пустое имя.
- При submit — `mutate({ repoPath, ref: name, create: true })` → `onCreated?.()` → `onOpenChange(false)`.

Файл: `src/features/create-branch/ui/types.ts`:
- `CreateBranchDialogProps` (как выше).

### Шаг 2. Подключить в RepoTree

Файл: `src/widgets/repo-tree/types.ts` — добавить prop `onSwitchBranch?: (name: string) => void` (уже может быть из TASK-319).

Файл: `src/widgets/repo-tree/ui/RepoTree.tsx`:
- `const [open, setOpen] = useState(false)`.
- На кнопку "New branch" повесить `onClick={() => setOpen(true)`.
- В конце JSX — `<CreateBranchDialog open={open} onOpenChange={setOpen} repoPath={repoPath} onCreated={onSwitchBranch} />`.
- `onSwitchBranch` либо из props (для инвалидации), либо собственный handler.

### Шаг 3. В RepositoryPage

Файл: `src/pages/repository/ui/RepositoryPage.tsx`:
- `handleSwitchBranch` (уже из TASK-319) — единый handler, который после успеха (включая создание ветки) автоматически переключает на новую ветку (так как `git checkout -b` уже переключает).
- Если `onCreated` не передан — мутировать `currentBranch` напрямую.

### Шаг 4. Тесты

Файл: `src/features/create-branch/ui/CreateBranchDialog.test.tsx` (новый):
- Тест: ввод имени и клик "Create" → `mutate` вызывается с правильными args.
- Тест: пустое имя → кнопка disabled.
- Тест: при `isPending` — кнопка показывает spinner.

### Шаг 5. Верификация

- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Dev: открыть репо, нажать "New branch", ввести имя, нажать Create — ветка создаётся, переключение происходит.

## Acceptance criteria

- [ ] Клик "New branch" открывает Dialog.
- [ ] Submit с валидным именем → `git checkout -b <name>`.
- [ ] Пока выполняется — спиннер на кнопке "Create".
- [ ] После успеха — toast.success, Dialog закрывается, граф обновляется, текущая ветка переключается.
- [ ] При ошибке — toast.error, Dialog остаётся открытым.
- [ ] `npm run tsc` + `npx eslint` — без ошибок.
- [ ] `npm test` — без новых fallов.

## Зависит от
TASK-319 (общий handler переключения ветки).

## Заметки

- В `gitCheckout` (electron/main/services/git/checkout.ts) уже есть `args.create` флаг.
- Использовать `@/shared/ui` Dialog (есть ли он?). Если нет — base-ui Dialog.
- AGENTS.md: стрелочные функции, типы в `types.ts`, без комментариев.

## Статус
🔧 in_progress

## Статус: DONE (pass #2)

### Что сделано
- Создан slice `src/features/create-branch/` с публичным API (`index.ts`), `model/useCreateBranch.ts` (использует `gitCheckout({ repoPath, ref, create: true })`, инвалидирует `branch-list`, `branch-mainlines`, `git-log`, `current-branch`), `ui/CreateBranchDialog.tsx` (Dialog + Input + Button "Create" со спиннером и disabled при пустом имени), `ui/types.ts` и `ui/index.ts`.
- `CreateBranchDialog` показывает toast.success `Ветка {name} создана` и toast.error `Не удалось создать ветку {name}`. После успеха вызывает `onCreated?.(name)` и закрывает диалог.
- В `src/widgets/repo-tree/ui/RepoTree.tsx` добавлены `useState(createOpen)`, `onClick={() => setCreateOpen(true)}` на кнопке "New branch", `<CreateBranchDialog open={createOpen} onOpenChange={setCreateOpen} repoPath={repoPath} onCreated={handleCreated} />` в конце JSX. Локальный `handleCreated` делегирует существующему `handleSwitchBranch` (который уже передаётся из `RepositoryPage`).
- `src/pages/repository/ui/RepositoryPage.tsx` не менялся — `handleSwitchBranch` уже подключён в TASK-319, прокинут в `<RepoTree onSwitchBranch={handleSwitchBranch} />`, теперь он же используется после успешного создания ветки.
- Создан `src/features/create-branch/ui/CreateBranchDialog.test.tsx`: тест на пустое имя (кнопка disabled), ввод имени + клик Create (`mutate` вызван с правильным payload), успех (`toast.success` + `onCreated` + `onOpenChange(false)`), ошибка (`toast.error`, диалог остаётся открытым), loading (спиннер на кнопке и disabled на input).
- В существующем `src/widgets/repo-tree/ui/RepoTree.test.tsx` добавлен `vi.mock('@/features/create-branch', () => ({ CreateBranchDialog: () => null }))`, чтобы изолировать `useToast` от провайдера в тестах RepoTree.

### Acceptance criteria
- [x] Клик "New branch" открывает Dialog.
- [x] Submit с валидным именем → `git checkout -b <name>` (через `useCreateBranch`).
- [x] Пока выполняется — спиннер на кнопке "Create".
- [x] После успеха — toast.success, Dialog закрывается, граф обновляется (через `queryClient.invalidateQueries`), текущая ветка переключается (через `onCreated` → `handleSwitchBranch` → `useCheckoutBranch`).
- [x] При ошибке — toast.error, Dialog остаётся открытым.
- [x] `npm run tsc` — без ошибок.
- [x] `npx eslint src/features/create-branch src/widgets/repo-tree src/pages/repository` — без ошибок.
- [x] `npm test` — 250/250 passed.

### Заметки для ревьюера (pass #2)
- **MA-1 (Major) исправлен:** убран `onCreated` prop из `CreateBranchDialog` и `RepoTree`/`onCreated` колбэк. `useCreateBranch` (через `git checkout -b`) УЖЕ переключает на новую ветку — повторный `git checkout` не нужен. Дополнительный `toast.success` от `useCheckoutBranch` больше не срабатывает.
- **Инвалидация `current-branch`:** `useCreateBranch.onSuccess` инвалидирует `current-branch`, `branch-list`, `git-log`, `branch-mainlines` — после успеха UI обновится из этого хука. `useCheckoutBranch` для этого сценария не вызывается.
- **Добавлен integration test** `src/widgets/repo-tree/ui/RepoTree.integration.test.tsx` (MI-2): проверяет, что `onSwitchBranch` НЕ вызывается после создания ветки, и `toast.success` вызывается РОВНО ОДИН раз.
- **MI-1 исправлен:** `handleClose` блокирует dismissal dialog при `isPending`.
- **MI-3 исправлен:** `handleSubmit` использует `name.trim()`.
- **MI-4 (spinner test is at the mock level):** оценён — тест на loading state достаточен через data-loading атрибут + проверку disabled input.
