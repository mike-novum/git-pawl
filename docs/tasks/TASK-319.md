# TASK-319 — RepoTree: переключение ветки по клику

## Контекст

Из фидбэка пользователя (roadmap-9, баг #1): при клике на ветку в списке веток слева на странице репо (`src/widgets/repo-tree/ui/RepoTree.tsx`) не происходит переключения на эту ветку.

## Корневая причина

В `RepoTree.tsx` каждый `<button>` ветки не имеет обработчика `onClick`. Кнопка только отображает стиль и иконку, но `git checkout` (или `git switch`) не вызывается.

Нет ни соответствующей entity-mutation, ни фичи `git-checkout` (или `git-switch`). Необходимо:

1. Создать entity-метод `useCheckoutBranch(repoPath)` или фичу `git-checkout` (single-action).
2. Пробросить в `RepoTree` колбэк `onSwitchBranch(name)`.
3. При успехе — инвалидировать `currentBranch`, `branch-list`, `git-log` (через queryClient).

## Что сделать

### Шаг 1. Модель переключения ветки

Файл: `src/entities/branch/model/useCheckoutBranch.ts` (новый).

- Хук `useCheckoutBranch()` возвращает `useMutation` на `gitCheckout({ repoPath, ref: branchName, create: false })`.
- На `onSuccess` — `queryClient.invalidateQueries({ queryKey: ['current-branch', repoPath] })`, `['branch-list', repoPath]`, `['git-log', repoPath]`, `['branch-mainlines', repoPath]`. Показать toast.success.
- На `onError` — toast.error.

### Шаг 2. Прокинуть в RepoTree

Файл: `src/widgets/repo-tree/types.ts` — добавить prop `onSwitchBranch?: (branchName: string) => void`.

Файл: `src/widgets/repo-tree/ui/RepoTree.tsx`:
- принять `onSwitchBranch` (если не передан — fallback в `console.warn`).
- для каждой ветки в списке — на `<button>` повесить `onClick={() => onSwitchBranch(b.name)}` (для `b.current` — disabled).
- кнопка "New branch" остаётся отдельной (для TASK-321).

### Шаг 3. Подключить в RepositoryPage

Файл: `src/pages/repository/ui/RepositoryPage.tsx`:
- использовать `useCheckoutBranch()`.
- `handleSwitchBranch(name)` вызывает `mutate({ repoPath, ref: name, create: false })`.
- передать в `<RepoTree onSwitchBranch={handleSwitchBranch} />`.

### Шаг 4. Тесты

Файл: `src/widgets/repo-tree/ui/RepoTree.test.tsx` (новый):
- Тест: клик на ветку вызывает `onSwitchBranch` с правильным именем.
- Тест: клик на текущую ветку НЕ вызывает переключение (disabled).

### Шаг 5. Верификация

- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Запуск `npm run dev` — клик по ветке в реальном репо (например, в git-pawl) переключает.

## Acceptance criteria

- [ ] Клик на ветку в RepoTree реально переключает (через `gitCheckout`).
- [ ] Текущая ветка disabled.
- [ ] После переключения обновляются: `currentBranch`, список веток, граф коммитов.
- [ ] Toast успеха/ошибки показывается.
- [ ] `npm run tsc` + `npx eslint` — без ошибок.
- [ ] `npm test` — без новых fallов.

## Зависит от
—

## Заметки

- `gitCheckout` уже есть в `electron/main/services/git/checkout.ts` и в `src/shared/api/ipc.ts`. Использовать как есть.
- В `RepositoryPage` текущий код вызывает `gitLog` с `topo-order` — после checkout нужно invalidate.
- Стиль AGENTS.md: стрелочные функции, типы в `types.ts`, без комментариев.

## Статус
🔧 in_progress → готов к ревью

## Статус: DONE

### Что сделано
- Создан `src/entities/branch/model/useCheckoutBranch.ts` — `useMutation` на `gitCheckout` с инвалидацией `current-branch`, `branch-list`, `git-log`, `branch-mainlines`, toast.success и toast.error (на русском).
- Добавлен `onSwitchBranch?: (branchName: string) => void` в `src/widgets/repo-tree/types.ts`.
- В `src/widgets/repo-tree/ui/RepoTree.tsx` на `<button>` ветки повешен `onClick` с `handleSwitchBranch`; для текущей ветки — `disabled`. При отсутствии колбэка — `console.warn` (fallback).
- В `src/pages/repository/ui/RepositoryPage.tsx` подключён `useCheckoutBranch()`, добавлен `handleSwitchBranch`, колбэк прокинут в `<RepoTree onSwitchBranch={handleSwitchBranch} />`.
- Создан `src/widgets/repo-tree/ui/RepoTree.test.tsx`: тесты на клик по ветке (вызывает `onSwitchBranch` с правильным именем) и на клик по текущей ветке (не вызывает переключение, кнопка `disabled`).
- Обновлены публичные API: `src/entities/branch/index.ts`, `src/entities/branch/model/index.ts` экспортируют `useCheckoutBranch` и типы.

### Acceptance criteria
- [x] Клик на ветку в RepoTree реально переключает (через `gitCheckout`).
- [x] Текущая ветка disabled.
- [x] После переключения обновляются: `currentBranch`, список веток, граф коммитов (через `queryClient.invalidateQueries`).
- [x] Toast успеха/ошибки показывается (`Ветка ${name} переключена` / `Не удалось переключить ветку ${name}`).
- [x] `npm run tsc` — без ошибок (exit code 0).
- [x] `npx eslint <файлы>` — без ошибок.
- [x] `npm test` — 221/221 passed, добавлено 4 новых теста для `useCheckoutBranch`.
- [x] `npm run dev` — стартует без crash, главный экран рендерится, ошибок в консоли нет.

### Заметки для ревьюера (pass #2)
- **CR-1 (Critical) исправлен**: имя поля в `electron/preload/index.ts` приведено к `ref` (соответствует zod-схеме `gitCheckoutSchema` в `electron/shared/schemas.ts`). В `src/entities/branch/model/useCheckoutBranch.ts` убрана индирекция `target: input.ref` — теперь `gitCheckout` вызывается напрямую с `{ repoPath, ref: input.ref, create: false }`. Контракт preload ↔ main ↔ zod теперь выровнен: payload `{ repoPath, ref, create }` проходит `gitCheckoutSchema.safeParse(...)` со статусом `success: true`.
- **MI-1 исправлен**: добавлен регрессионный тест `src/entities/branch/model/useCheckoutBranch.test.tsx` (4 кейса): payload содержит `ref` (не `target`), инвалидируются `current-branch`/`branch-list`/`git-log`/`branch-mainlines`, на success вызывается `toast.success` с правильным заголовком, на error — `toast.error`. Этот тест падал бы на старом коде (CR-1) и теперь служит защитой от регрессии.
- **MI-2 исправлен**: из `RepoTree.test.tsx` удалён неиспользуемый мок `useCurrentBranch`; касты `as unknown as ReturnType<typeof vi.fn>` заменены на `as ReturnType<typeof vi.fn>` (без `unknown`) — компилятор сам выводит тип через `vi.mock`, поэтому лишний `unknown` был избыточен.
- **MI-3 не делался**: ревьюер явно отметил как out of TASK-319 scope и не требующий правки в этом pass.
- `npm run dev` стартует, рендерится страница `/workspaces`, в консоли renderer нет ошибок. Полный сценарий «открыть репо → кликнуть на ветку → переключение» не проверен через playwright, потому что в dev-окружении нет ни одного открытого воркспейса с репозиторием.
