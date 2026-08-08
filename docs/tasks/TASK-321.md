# TASK-321 — Кнопка Fetch: реальное действие + анимация рефреша

## Контекст

Из фидбэка пользователя (roadmap-9, баг #3): кнопка с иконкой рефреша (стоит рядом с `OpenInTerminal`) не имеет фидбэка при нажатии. Непонятно, что именно она обновляет, и по нажатию ничего не происходит. Нужно:
- реализовать `git fetch` через фичу `git-fetch` (уже есть `FetchButton`).
- во время выполнения иконка RefreshCw должна вращаться.

## Корневая причина

Файл: `src/pages/repository/ui/RepositoryPage.tsx:131-143`.

Кнопка Fetch — inline `<button>` с `aria-label="Fetch"`, `onClick` только показывает toast.info('Coming soon').

Фича `git-fetch` (`src/features/git-fetch/`) уже существует с `FetchButton`. Но:
- `FetchButton` сейчас — `variant="secondary"`, имеет `leftIcon={<GitBranch />}` и `rightIcon={<RefreshCw />}` (не подходит под inline-кнопку в шапке).
- Иконка `RefreshCw` в `FetchButton` статична, нужно анимация `animate-spin` ТОЛЬКО при `isPending`.

## Что сделать

### Шаг 1. Расширить FetchButton

Файл: `src/features/git-fetch/ui/FetchButton.tsx`:
- Добавить prop `iconOnly?: boolean` (default `false`).
- Если `iconOnly` — рендерим только иконку (RefreshCw), она же спиннит при `isPending`.
- В обоих случаях — `<RefreshCw className={isPending ? 'size-4 animate-spin' : 'size-4'} />` (или нужный class).
- Toast на успех: `"Фетч выполнен"`.
- Toast на ошибку: `"Не удалось выполнить fetch"`.

Файл: `src/features/git-fetch/ui/types.ts` — добавить `iconOnly?: boolean`.

### Шаг 2. Инвалидация после fetch

Файл: `src/features/git-fetch/model/useGitFetch.ts` (или где он определён):
- На `onSuccess` — инвалидировать `branch-list`, `branch-mainlines`, `git-log`, `current-branch`.

### Шаг 3. Использовать в RepositoryPage

Файл: `src/pages/repository/ui/RepositoryPage.tsx`:
- удалить inline-кнопку Fetch.
- вставить `<FetchButton repoPath={repoPath} iconOnly />` с тем же className (`size-8` квадратная).

### Шаг 4. Тесты

Файл: `src/features/git-fetch/ui/FetchButton.test.tsx` (новый):
- Тест: `iconOnly={true}` отображает только иконку.
- Тест: при `isPending` иконка имеет класс `animate-spin`.

### Шаг 5. Верификация

- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Dev: клик по кнопке в реальном репо — иконка крутится, потом toast.

## Acceptance criteria

- [ ] Клик по кнопке Fetch реально запускает `git fetch`.
- [ ] Во время выполнения иконка RefreshCw крутится (`animate-spin`).
- [ ] Успех — toast `"Фетч выполнен"`, ошибка — toast `"Не удалось выполнить fetch"`.
- [ ] После успеха обновляются `branch-list`, `git-log`, `branch-mainlines`.
- [ ] `npm run tsc` + `npx eslint` — без ошибок.
- [ ] `npm test` — без новых fallов.

## Зависит от
—

## Заметки

- `lucide-react` `RefreshCw` поддерживает `className="animate-spin"`.
- Не дублировать — фича `git-fetch` уже есть.

## Статус: DONE — кнопка Fetch вызывает реальный git fetch, иконка крутится во время выполнения

### Что сделано
- В `src/features/git-fetch/ui/FetchButton.tsx` добавлен prop `iconOnly`. В режиме `iconOnly` рендерится только иконка `RefreshCw` (`variant="ghost"`, `aria-label="Fetch"`); иконка получает класс `animate-spin` пока `isPending`. В обычном режиме `RefreshCw` крутится так же, выводится как `rightIcon`.
- Тосты переведены на русский: успех — `«Фетч выполнен»`, ошибка — `«Не удалось выполнить fetch»` (с `description = err.message`).
- В `useGitFetch.ts` `onSuccess` инвалидирует ключи `current-branch`, `branch-list`, `git-log`, `branch-mainlines` (заменены `['branches', 'commits']`).
- В `RepositoryPage` inline-кнопка Fetch удалена, на её месте `<FetchButton repoPath={repoPath} iconOnly className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground size-8 p-0" />`.
- Добавлен тест `src/features/git-fetch/ui/FetchButton.test.tsx` (7 кейсов): только иконка, label-ветки, клик + mutate, успешный тост, ошибочный тост, `disabled` при пустом `repoPath`, `animate-spin` при `isPending`.

### Acceptance criteria
- [x] Клик по кнопке Fetch реально запускает `git fetch` (через `useGitFetch` → `window.api.gitFetch`).
- [x] Во время выполнения иконка `RefreshCw` крутится (`animate-spin`) в обоих режимах.
- [x] Успех — toast `«Фетч выполнен»`, ошибка — toast `«Не удалось выполнить fetch»`.
- [x] После успеха обновляются `branch-list`, `git-log`, `branch-mainlines`, `current-branch`.
- [x] `npm run tsc` — без ошибок.
- [x] `npx eslint src/features/git-fetch src/pages/repository` — без ошибок.
- [x] `npm test` — 242/242 passed, новых падений нет.

### Заметки для ревьюера
- В `iconOnly` режиме `Button` использует `variant="ghost"` и `className` отвечает за внешний вид квадратной `size-8` кнопки. `loading` на `Button` не передаётся, чтобы иконка `RefreshCw` оставалась видимой и крутилась через свой `animate-spin`.
- `aria-label="Fetch"` сохранён в режиме `iconOnly` — screen reader видит ту же семантику, что и у старой inline-кнопки.
- `useGitFetch.ts` теперь опирается на ключи, совпадающие с ключами `useGitPull.ts` — это поведенческий инвариант для следующих ревьюеров fetch/pull.

