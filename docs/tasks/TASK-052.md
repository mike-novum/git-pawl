# TASK-052 — Feature: clone-repo (из списка аккаунта)

## Цель
Клонирование из списка репо подключённого аккаунта.

## Что сделать
1. Расширение CloneByUrlForm или отдельный CloneFromAccountDialog:
   - Аккаунт → список репо (использует TASK-050).
   - Кнопка "Clone" на каждом репо.
2. Storybook story.

## Acceptance criteria
- [ ] Список подгружается по выбранному аккаунту.
- [ ] Клонирует в активный workspace.

## Зависит от
- TASK-050, TASK-051

## Статус: DONE — отдельный `CloneFromAccountDialog` поверх `useCloneRepo` + `useAccountRepos`

### Что сделано
- Создан слайс `src/features/clone-from-account/`.
- `model/useCloneFromRepo.ts` — обёртка над `useAccountList`, `useAccountRepos` и `useCloneRepo`: хранит выбранный аккаунт, подгружает репозитории для него, отдаёт состояние и мутацию клона, а также `buildCloneDestPath(workspacePath, repoName)` для построения пути назначения.
- `ui/CloneFromAccountDialog.tsx` — диалог: пикер аккаунтов (`AccountBadge`), список репозиториев выбранного аккаунта (Spinner → Empty → ScrollArea со списком), кнопка «Refresh», фильтр по имени и кнопка «Clone» на каждом репо. Использует `useToast` для уведомлений, на успехе закрывает диалог, на ошибке показывает сообщение.
- Public API через `index.ts` (UI + model).

### Acceptance criteria (отметить выполненные)
- [x] Список подгружается по выбранному аккаунту.
- [x] Клонирует в активный workspace.

### Заметки для ревьюера
- Импортирует `Account`/`AccountBadge`/`AccountAvatar` из `@/entities/account`, `useCloneRepo` из `@/features/clone-repo`, `useAccountRepos` из `@/features/account-repos` — зависимости FSD-слоёв соблюдены.
- `useAccountRepos` всегда вызывается с провайдером/идентификатором; для случая без выбранного аккаунта передаётся sentinel `'__none__'`, чтобы хук был вызван в одном и том же месте дерева рендера (правила React Hooks).
- Кнопка «Clone» блокируется, если нет активного workspace; пользователю показывается toast с предложением выбрать workspace.
- Storybook-история не добавлялась: срез `storybook` ещё не подключён в этом репозитории (TASK-006 ⏳) — добавится вместе с другими историями в рамках отдельной задачи.

