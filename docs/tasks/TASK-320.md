# TASK-320 — Кнопки Pull/Push: индикация загрузки и тосты

## Контекст

Из фидбэка пользователя (roadmap-9, баг #2): на странице репо при нажатии на Pull/Push ничего не происходит. Должны запускаться соответствующие команды, во время выполнения — спиннер в кнопке с отступом 8px от текста, по окончанию — toast.

## Корневая причина

Файл: `src/pages/repository/ui/RepositoryPage.tsx:130-163`.

Кнопки Pull/Push сейчас — обычные `<button>` с inline-обработчиком, который только показывает toast.info('Coming soon'). Реальные фичи `git-pull` (`@/features/git-pull`) и `git-push` (`@/features/git-push`) уже существуют, но не используются.

В `PullButton.tsx` / `PushButton.tsx` уже есть `loading={isPending}` и `useToast`, но они `variant="secondary"` и используют другие иконки. Нужно либо переиспользовать их, либо сделать новую inline-кнопку, повторяющую стиль текущей.

## Что сделать

### Шаг 1. Стиль и иконка

Файл: `src/features/git-pull/ui/PullButton.tsx` — посмотреть текущий стиль. (на момент задачи — `variant="secondary"`, иконка `Download`).

Файл: `src/features/git-push/ui/PushButton.tsx` — то же.

Оба используют `Button` из `@/shared/ui`. Поддерживают prop `loading`.

Требования roadmap-9:
- Размер шрифта/отступы/иконки как у текущих inline-кнопок в `RepositoryPage.tsx`:
  - `h-8 px-3 text-xs`
  - `bg-primary text-primary-foreground`
  - `GitPullRequestArrow` без `scale-y-100` для Pull, с `-scale-y-100` для Push
- Спиннер — внутри кнопки с `gap-2` (отступ 8px от текста).

### Шаг 2. Варианты реализации

**Вариант A (рекомендуется):** переиспользовать `PullButton` / `PushButton`, но:
- добавить prop `variant: 'primary' | 'secondary'` и `iconOnly?: boolean` (или прокинуть `className`).
- в `RepositoryPage` — `<PullButton repoPath={repoPath} branchName={branchQuery.data?.name} variant="primary" />`.

**Вариант B:** сделать inline-кнопки в `RepositoryPage.tsx`, вызвать `useGitPull` / `useGitPush` напрямую.

Выбираем A — проще и переиспользует код.

### Шаг 3. Изменения в PullButton / PushButton

Файл: `src/features/git-pull/ui/PullButton.tsx`:
- принимать prop `variant?: 'primary' | 'secondary'` (default `'secondary'`).
- Иконка Pull: `GitPullRequestArrow` (без scale).
- Иконка Loading: `Spinner` (вместо `Download`/`GitBranch`) при `isPending`.

Файл: `src/features/git-push/ui/PushButton.tsx`:
- то же.
- Иконка Push: `GitPullRequestArrow` с `-scale-y-100`.

Файл: `src/shared/ui/Button` — проверить, что `loading` уже ставит спиннер с нужным отступом (`gap-2` = 8px).

### Шаг 4. Toast на успех/ошибку

`PullButton` сейчас использует описательные сообщения. По roadmap-9 — нужен формат:
- Успех: `"Пулл ветки X выполнен"` / `"Пуш ветки X выполнен"`.
- Ошибка: `"Не удалось выполнить pull ветки X"` / `"Не удалось выполнить push ветки X"`.

В `PullButton`/`PushButton` использовать `branchName` (уже есть prop) в сообщениях.

### Шаг 5. Инвалидация кэша

После успешного pull/push — обновить `currentBranch`, `branch-list`, `git-log`, `branch-mainlines` (вызвать `queryClient.invalidateQueries`).

Файл: `src/features/git-pull/model/useGitPull.ts` — добавить `onSuccess` инвалидацию.
Файл: `src/features/git-push/model/useGitPush.ts` — то же.

### Шаг 6. Использовать в RepositoryPage

Файл: `src/pages/repository/ui/RepositoryPage.tsx`:
- удалить inline-кнопки Pull/Push.
- вставить `<PullButton repoPath={repoPath} branchName={branchQuery.data?.name} variant="primary" className="..." />` и `<PushButton ... />`.

### Шаг 7. Тесты

Файл: `src/features/git-pull/ui/PullButton.test.tsx` (новый):
- Тест: рендер с `loading=true` — спиннер виден, основная иконка скрыта.
- Тест: при ошибке — toast `error` с правильным сообщением.

Файл: `src/features/git-push/ui/PushButton.test.tsx` — аналогично.

### Шаг 8. Верификация

- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Storybook / Dev: в реальном репо проверить клик.

## Acceptance criteria

- [ ] Клик на Pull запускает `git pull`, кнопка показывает спиннер с отступом 8px.
- [ ] По завершению — toast `"Пулл ветки X выполнен"` или `"Не удалось выполнить pull ветки X"`.
- [ ] Аналогично для Push.
- [ ] После успеха обновляются данные в графе.
- [ ] `npm run tsc` + `npx eslint` — без ошибок.
- [ ] `npm test` — без новых fallов.

## Зависит от
—

## Заметки

- Иконка `Spinner` уже есть в `@/shared/ui` (используется в `RepositoryPage`).
- Не дублировать логику — `git-pull` и `git-push` фичи уже существуют.

## Статус
🔧 in_progress → готов к ревью

## Статус: DONE

### Что сделано
- `src/features/git-pull/ui/PullButton.tsx` — добавлен prop `variant?: 'primary' | 'secondary'`, при `isPending` показывается спиннер совместо с иконкой.
- `src/features/git-push/ui/PushButton.tsx` — то же.
- `src/features/git-pull/ui/types.ts` / `src/features/git-push/ui/types.ts` — добавлен prop `variant`.
- `src/features/git-pull/model/useGitPull.ts` — инвалидация `current-branch`, `branch-list`, `git-log`, `branch-mainlines` в `onSuccess`.
- `src/features/git-push/model/useGitPush.ts` — то же.
- Toast: успех `Пулл ветки {name} выполнен`, ошибка `Не удалось выполнить pull ветки {name}` (аналогично для Push).
- `src/pages/repository/ui/RepositoryPage.tsx` — inline-кнопки Pull/Push заменены на `<PullButton variant="primary" />` / `<PushButton variant="primary" />`.
- Тесты `src/features/git-pull/ui/PullButton.test.tsx` и `src/features/git-push/ui/PushButton.test.tsx` — 7 тестов в каждом (рендер, variant, mutate, success toast, error toast, disabled, loading spinner).

### Acceptance criteria
- [x] Клик на Pull запускает `git pull`, кнопка показывает спиннер с отступом 8px.
- [x] По завершению — toast `"Пулл ветки X выполнен"` или `"Не удалось выполнить pull ветки X"`.
- [x] Аналогично для Push.
- [x] После успеха обновляются данные в графе (инвалидация ключей).
- [x] `npm run tsc` — exit code 0.
- [x] `npx eslint <файлы>` — exit code 0.
- [x] `npm test` — 235/235 passed.

### Заметки для ревьюера
- Mock Button в тестах расширен `disabled` prop — у PullButton/PushButton кнопка disabled при `!repoPath` или `isPending`.
- Сохранена обратная совместимость: для существующих потребителей `variant` дефолтит в `secondary`.
- Передача `branchName` в PullButton/PushButton влияет на текст toast.
