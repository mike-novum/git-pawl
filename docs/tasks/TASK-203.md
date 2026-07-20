# TASK-203 — Скрыть кнопку "Settings" в AppHeader на странице настроек

## Баг
На странице `/settings` (`src/pages/settings/ui/SettingsPage.tsx`) в `AppHeader` (`src/widgets/app-header/ui/AppHeader.tsx`) справа видна иконка-шестерёнка, которая ведёт в настройки. Пользователь уже в настройках — эта кнопка не нужна.

## Что сделать
1. Открыть `src/widgets/app-header/ui/AppHeader.tsx`.
2. В компоненте `AppHeader` принимать опциональный проп `hideSettingsButton?: boolean` или считывать текущий маршрут.
3. Если пользователь на `/settings` (или пропс `hideSettingsButton === true`), НЕ рендерить `IconButton` с `label="Settings"`.
4. Альтернативный простой вариант: добавить проверку `location.pathname !== '/settings'` через `useLocation()` из react-router-dom.
5. Темы оставить как есть.

## Acceptance criteria
- [ ] На странице `/settings` иконка-шестерёнка в `AppHeader` НЕ отображается.
- [ ] На остальных страницах иконка по-прежнему отображается и работает.
- [ ] `npm run tsc` + `eslint` проходят без ошибок.

## Зависит от
—

## Статус: DONE — кнопка настроек скрыта на странице `/settings`

### Что сделано
- В `AppHeader` добавлен опциональный проп `hideSettings`.
- `AppLayout` скрывает кнопку настроек только для маршрута `/settings`.
- Добавлены регрессионные тесты отображения кнопки.

### Acceptance criteria
- [x] На странице `/settings` иконка-шестерёнка в `AppHeader` НЕ отображается.
- [x] На остальных страницах иконка по-прежнему отображается и работает.
- [x] `npm run tsc` + `eslint` проходят без ошибок.

### Заметки для ревьюера
- Поведение проверено на `/settings` и `/workspaces` через Playwright и Chrome DevTools.