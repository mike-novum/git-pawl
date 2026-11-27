# План UX-улучшений интерфейса (ветка `feat/ux-improovments`)

## Контекст и цель

Перевести интерфейс `git-pawl` из модели разрозненных веб-страниц в удобный десктопный Git-клиент для macOS, сохранив и усилив работу с воркспейсами.

---

## Статус по направлениям

### Направление 1: Десктопная компоновка (Persistent Sidebar & Resizable Layout)
- [x] Обёртка `ResizablePanel` обновлена под `react-resizable-panels` v4 (`src/shared/ui/resizable-panel/ResizablePanel.tsx`)
- [x] `RepoTree` адаптирован под гибкую ширину (`w-full`, `className`)
- [x] **Задача A1**: Интегрировать `ResizablePanel.PanelGroup` и `PanelResizeHandle` на странице репозитория (`src/pages/repository/ui/RepositoryPage.tsx`) для `RepoTree`, `RepoGraph` и `RepoDetailPanel`, убрать жёсткую ширину `w-96 md:w-[440px] lg:w-[480px]` у `RepoDetailPanel` при размещении в панели
- [x] **Задача B1**: Создать сворачиваемый левый сайдбар (`src/widgets/app-sidebar/`) со списком воркспейсов и их репозиториев (переключение в 1 клик, подсветка активного воркспейса/репозитория, быстрый переход ко всем воркспейсам `/workspaces` и настройкам `/settings`)
- [x] **Задача B2**: Добавить состояние `sidebarOpen` в `useAppStore` + горячую клавишу `Cmd+B` / `Ctrl+B` и кнопку переключения в шапке
- [x] **Задача D1**: Подключить `AppSidebar` в `src/app/layouts/AppLayout.tsx` с сохранением полноценной работы экрана воркспейсов

### Направление 2: Полноценный рабочий сценарий просмотра изменений и коммита
- [x] Встроен `DiffViewer` в `RepoDetailPanel` (`UncommittedView` и `CommitView`) — клик по файлу открывает синтаксический diff
- [x] Добавлена индикация Staged / Unstaged, чекбоксы файлов и кнопки `Stage all` / `Unstage all` в `FileChangesPanel`
- [x] Добавлен шорткат `Cmd+Enter` в `CommitMessageForm`
- [x] Кнопки-заглушки (`Create patch`, `Cherry-pick`, `Revert commit`, `Reset to here`) перенесены в выпадающее меню `Actions (···)`

### Направление 3: Визуальная иерархия, информативность и macOS-полировка
- [x] Переработаны карточки репозиториев (`RepoCard.tsx`) — текущая ветка, статус изменений / Clean, `↑ahead / ↓behind`, размер, быстрые действия (Finder / Terminal)
- [x] Добавлен компактный списочный вид (`RepoRow.tsx`) и переключатель `Grid / List` в `WorkspaceToolbar.tsx`
- [x] Добавлены счётчик отфильтрованных репо, очистка поиска и сводная панель статуса на `WorkspacePage.tsx`
- [x] Улучшена карточка воркспейса (`WorkspaceTile.tsx`) — путь, быстрая кнопка Finder
- [x] Добавлена фильтрация веток в `RepoTree.tsx`
- [x] **Задача A2**: Исправить ошибку TypeScript в `src/features/git-push/ui/PushButton.tsx` (`variant="outline"` несовместим с `Button`) и унифицировать отображение счётчиков `↑ahead` / `↓behind`
- [x] **Задача A3**: Настроить правильные визуальные акценты кнопок `Fetch` / `Pull` / `Push` в `RepositoryPage.tsx` (передавать `count={behind}` / `count={ahead}`, не подсвечивать одновременно `Pull` и `Push` оранжевым `primary` цветом)
- [x] **Задача C1**: Реализовать глобальную палитру команд `CommandPalette` (`src/widgets/command-palette/`) на базе `cmdk` (`Cmd+K` / `Ctrl+K`) для мгновенного поиска и перехода по воркспейсам, репозиториям, веткам и основным действиям
- [x] **Задача D2**: Добавить кликабельные хлебные крошки «Workspaces / Воркспейс / Репозиторий» и кнопку вызова палитры команд (`⌘K`) + кнопку сайдбара в `AppLayout.tsx` / `AppHeader.tsx`

---

## Проверка и приёмка (Verification)
- [x] `npm run tsc` проходит без ошибок
- [x] `npx eslint --fix` по изменённым и новым файлам `src/` без ошибок
- [x] `npm test` (все Vitest-тесты, включая новые тесты для Sidebar, CommandPalette и RepositoryPage) зелёный
- [x] Запуск приложения (`npm run dev`) и проверка основных экранов и сценариев через Playwright / Chrome DevTools MCP (скриншоты в `screenshots/`)
