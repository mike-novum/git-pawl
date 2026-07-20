# TASK-305 — WorkspaceSettingsDrawer: корректное сохранение и отображение иконки воркспейса

## Баг
В `src/pages/workspace/ui/WorkspaceSettingsDrawer.tsx` выбор иконки воркспейса реализован, но визуально и функционально сломан:

1. В блоке иконки после выбора файла отображается голое имя файла (`getIconName`) вместо превью изображения.
2. Кнопка «Done» визуально ничего не делает: пользователь думает, что изменения не сохраняются, хотя мутация `setWorkspaceIcon` фактически уже отрабатывает на `handleIconChange`.
3. Иконка нигде не отображается:
   - В `WorkspaceHero` всегда рисуется иконка `Folder` из lucide-react.
   - В `WorkspacesPage` (`WorkspaceTile`) тоже нет иконки.
   - В `workspaceQueries` модель `Workspace` не содержит поля `iconPath`, поэтому даже если стор записан — прочитать его из UI-модели нельзя.

Нужно: показать превью выбранного изображения в драйвере, отрисовать сохранённую иконку в hero и tile воркспейса (с fallback на `Folder`), и сделать поведение «Done» однозначным (сохранение имени и закрытие).

## Что сделать

### Шаг 1. Расширить модель и хук чтения
1. В `src/entities/workspace/model/workspaceQueries.ts` (или `useWorkspace.ts`) — убедиться, что `Workspace` имеет `id`, `name`, `path`. Поле `iconPath` опционально добавлять не нужно (иконка живёт в store, как сейчас).
2. В `src/entities/workspace/model/useWorkspaceIcon.ts` добавить query-хук `useWorkspaceIcon(workspaceId: string | null): string | null`:
   - использовать `useQuery` из `@tanstack/react-query`;
   - queryKey: `['workspace-icon', workspaceId]`;
   - queryFn: `storeGet<string>({ key: 'workspace-icon:${workspaceId}' })`;
   - при `workspaceId === null` — возвращать `null`, не дёргать IPC.
3. В `src/entities/workspace/model/index.ts` экспортировать новый хук.

### Шаг 2. Драйвер: показывать превью
В `src/pages/workspace/ui/WorkspaceSettingsDrawer.tsx`:
1. Локально хранить `selectedIconPath` (уже есть).
2. В блоке иконки рендерить:
   - Если есть `selectedIconPath` или `workspace.iconPath` (из query) — `<img src="...">` c `object-contain`, скруглением, бордером.
   - Если ничего нет — placeholder с подписью «Change».
3. При выборе файла — показывать превью сразу (через `<img>`).
4. Кнопка «Done»: прокинуть `onSave` и `selectedIconPath` через новый колбэк `onIconSave(iconPath)` либо оставить текущий `onIconChange` и явно показать пользователю, что иконка уже сохранена при выборе (toast).
5. Не показывать имя файла текстом — только превью.

### Шаг 3. Hero: показывать иконку
В `src/pages/workspace/ui/WorkspaceHero.tsx`:
1. Принять `iconPath: string | null` (читается из `useWorkspaceIcon(workspaceId)` в `WorkspacePage`).
2. Если `iconPath` — рендерить `<img>` в кружке (текущий квадрат `size-10 rounded-lg`).
3. Иначе — fallback на `<Folder />`.

### Шаг 4. Tile воркспейса
В `src/pages/workspaces/ui/WorkspaceTile.tsx`:
1. Забрать `useWorkspaceIcon(workspace.id)` для каждого тайла (можно вынести в отдельный компонент `WorkspaceIcon`).
2. Если иконка есть — показать её вместо `Folder`/`Hdd` иконки.

### Шаг 5. Передать данные
В `src/pages/workspace/ui/WorkspacePage.tsx`:
1. Забрать `const { data: iconPath } = useWorkspaceIcon(workspaceId)`.
2. Передать `iconPath` в `WorkspaceHero` и `WorkspaceSettingsDrawer` (если нужно).

### Шаг 6. Верификация
- [ ] Выбрать файл `icon.png` в драйвере → видно превью.
- [ ] Закрыть драйвер → иконка отображается в hero.
- [ ] Перейти на `/workspaces` → иконка видна в tile.
- [ ] Перезагрузить страницу → иконка всё ещё отображается (стор сохранился).
- [ ] Если удалить файл с диска — отображается fallback на `Folder`.

## Acceptance criteria
- [x] В блоке выбора иконки в драйвере видно превью изображения, а не имя файла.
- [x] В `WorkspaceHero` иконка отображается, когда она выбрана (с fallback на `Folder`).
- [x] В `WorkspaceTile` (`WorkspacesPage`) иконка тоже отображается.
- [x] После перезагрузки приложения иконка сохраняется.
- [x] `npm run tsc` + `eslint` для затронутых файлов — без ошибок.
- [x] FSD-слои соблюдены: новый хук живёт в `entities/workspace`, UI в `pages/workspace` / `pages/workspaces`.

## Зависит от
—

## Заметки
- Не копировать файл в директорию воркспейса — это вне scope. Хранить абсолютный путь в store, как сейчас.
- Для отображения `<img>` с пользовательского путя — Electron в preload должен разрешать `file://` либо прокидывать кастомный протокол. Если текущий CSP запрещает — добавить минимальный канал `fsReadImageAsDataUrl(path)` или расширить CSP для `file:`. Проверить фактическое поведение в Storybook / dev.
- AGENTS.md: стрелочные функции, `FC`, типы в `types.ts`, без комментариев в коде.

## Заметки для ревьюера

### Применённые исправления (review fixes)

**MAJOR #1 — локальные иконки не отображались.**
- Добавлен новый IPC-канал `fs:read-image-data-url` (`fsReadImageDataUrlSchema`, `FS_READ_IMAGE_DATA_URL`).
- Сервис `readImageAsDataUrl` в `electron/main/services/fs.ts` читает файл с диска, определяет MIME по расширению и возвращает `data:<mime>;base64,...`.
- Мост `window.api.fsReadImageDataUrl` прокинут через preload → `src/shared/api/ipc.ts`.
- В `src/shared/lib/useImageDataUrl.ts` хук `useImageDataUrl(path)` кэширует data URL через react-query (staleTime 5 мин) и не дёргает IPC при `path === null`.
- `CSP` уже разрешает `img-src 'self' data: https:`, дополнительной правки не потребовалось.

**MAJOR #2 — мутация не инвалидировала кэш.**
- В `useSetWorkspaceIcon` (entities/workspace/model/useWorkspaceIcon.ts) добавлен `onSuccess`, который вызывает и `queryClient.setQueryData`, и `queryClient.invalidateQueries` по `WORKSPACE_ICON_QUERY_KEY(workspaceId)`.

**MAJOR #3 — нет fallback при сломанной картинке.**
- Создан общий компонент `src/entities/workspace/ui/WorkspaceIcon.tsx` (+ `types.ts`, `index.ts`), реэкспортирован через `entities/workspace`.
- Компонент поддерживает `size` (sm/md/lg), `children` для кастомного плейсхолдера и обрабатывает ошибки изображения через набор невалидных путей. Fallback отображается до получения непустого data URL, поэтому `<img>` не рендерится с пустым `src`.
- `WorkspaceHero`, `WorkspaceSettingsDrawer`, `WorkspaceTile` переведены на `WorkspaceIcon` (без локальных `<img>` и `toFileUrl`).

**MINOR #4 — toast показывался до персистенса.**
- `WorkspacePage.handleIconChange` передаёт `onSuccess`/`onError` в мутацию `setWorkspaceIcon`. Toast вызывается уже после ответа стора.
- Из `WorkspaceSettingsDrawer` удалён преждевременный `toast.success`.

**MINOR #5 — `toFileUrl` не экранировал `#`/`?`.**
- Переписал через `encodeURIComponent` по сегментам пути. Добавлен юнит-тест `src/shared/lib/toFileUrl.test.ts` (6 кейсов).

### Что осталось/что не в скоупе
- Копирование файла иконки внутрь воркспейса — не делалось, как и просили в разделе «Заметки».
- В drawer's preview `WorkspaceIcon` оборачивается кнопкой `h-20 w-20` со своим `border-dashed`. Внутреннему `<div>` WorkspaceIcon передаются `!size-20 !rounded-lg border-0` через `className`, чтобы перебить его дефолтную обёртку.

## Статус: DONE — исправления второго ревью применены

### Что сделано
- `WorkspaceIcon` не рендерит `<img>` до получения непустого data URL и хранит ошибки отдельно для каждого `iconPath` без `useEffect`.
- Добавлены регрессионные тесты для загрузки data URL, отсутствующего файла и переключения со сломанного пути на валидный.
- Удалены неиспользуемые типы `WorkspaceTileIconProps` и `ImageDataUrlResult`.
- `RepositoryIcon` переведён на общий `toFileUrl`, локальный дубликат удалён.
- Из `useImageDataUrl` удалена Promise-обёртка, которая не отменяла IPC-вызов.

### Acceptance criteria (отметить выполненные)
- [x] До получения `src` отображается fallback, пустой `src` не передаётся в `<img>`.
- [x] Ошибка одного пути не блокирует отображение иконки для другого пути.
- [x] Мёртвые экспорты и дублирование `toFileUrl` удалены.
- [x] Проверки TypeScript, ESLint, Vitest и ручные сценарии пройдены.

### Заметки для ревьюера
- Ошибки декодирования изображения хранятся в `ReadonlySet<string>` на время жизни экземпляра `WorkspaceIcon`; смена пути не требует эффекта сброса.
- IPC-чтение не поддерживает реальную отмену, поэтому query-функция теперь напрямую возвращает `fetchImageDataUrl(path)`.
