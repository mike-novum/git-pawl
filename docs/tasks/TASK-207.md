# TASK-207 — RepositoryPage: исправить шапку (не показывать WorkspaceSelector)

## Баг
На странице `/repos/:id` (`src/pages/repository/ui/RepositoryPage.tsx`) шапка такая же, как у воркспейса — в `AppHeader` (`src/app/layouts/AppLayout.tsx`) рендерится `<WorkspaceSelector>`. Нужно, чтобы на странице репозитория шапка показывала только название репозитория без селектора воркспейсов.

## Что сделать
1. Открыть `src/app/layouts/AppLayout.tsx`.
2. Расширить логику `variant`: добавить вариант `repository` (например, `location.pathname.startsWith('/repos/')`).
3. Для варианта `repository` рендерить `leftSlot` с названием репозитория (нужно достать `repoName` через `useRepository(decodeRepoId(id))` или пробросить из `RepositoryPage`).
4. Простой вариант: в `AppLayout` определить, что мы на `/repos/:id`, и не показывать `<WorkspaceSelector>`, а показать статичный бэйдж с именем репы (можно через `useParams` + быстрый запрос или передать из `RepositoryPage` через children).
5. Бэк-кнопка должна работать (назад на воркспейс).

## Acceptance criteria
- [ ] На странице `/repos/:id` шапка содержит имя репозитория и НЕ содержит WorkspaceSelector.
- [ ] На остальных страницах поведение не изменилось.
- [ ] `npm run tsc` + `eslint` проходят без ошибок.

## Зависит от
—

## Статус
⏳ pending