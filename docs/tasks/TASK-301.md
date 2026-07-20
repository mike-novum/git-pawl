# TASK-301 — WorkspaceHero: persist-store + shimmer-skeleton для счётчиков

## Баг / доработка
В карточке воркспейса (`src/pages/workspace/ui/WorkspaceHero.tsx`) видно "прыгание" данных: сначала отображается `0 repos`, потом спустя время — `8 repos`. Аналогично для `modifiedCount` и `sizeBytes`. Причина — `useRepositoryList` и `useWorkspaceSize` стартуют с пустого состояния и подгружаются асинхронно, UI сразу же рендерит нули.

Нужно:
1. Сохранять последние успешно загруженные значения счётчиков (`repoCount`, `modifiedCount`, `sizeBytes`) по ключу воркспейса в zustand persist-store (`useAppStore`).
2. При первой загрузке (до прихода данных) показывать shimmer-скелетон (`Skeleton` из `src/shared/ui/skeleton`), а не нули.
3. Карточка должна подхватывать сохранённые значения из persist-store, чтобы не было "0 → 8".

## Что сделать

### Шаг 1. Расширить `useAppStore`
1. Открыть `src/app/store/types.ts` и `src/app/store/useAppStore.ts`.
2. Добавить тип `WorkspaceCounters { repoCount: number; modifiedCount: number; sizeBytes: number | null; updatedAt: number }`.
3. В state добавить поле `workspaceCounters: Record<string, WorkspaceCounters>` (ключ — `workspaceId` или `workspace.path`).
4. Добавить метод `setWorkspaceCounters(id: string, counters: WorkspaceCounters)`.
5. Persist через `createPersistedStore` уже есть — данные сохранятся автоматически.

### Шаг 2. Запись в store при загрузке данных
1. В `src/pages/workspace/ui/WorkspacePage.tsx` (или вынести в кастомный хук `src/features/workspace-counters/useWorkspaceCounters.ts`):
   - Когда `repos`, `modifiedCount`, `workspaceSizeBytes` становятся известны — вызывать `setWorkspaceCounters(workspaceId, { ... })`.
2. Не писать, если `workspaceId === null`.

### Шаг 3. Чтение из store
1. В `WorkspaceHero.tsx` (или в новом хуке) сначала брать значения из `workspaceCounters[workspaceId] ?? null`, а react-query использовать как "источник истины" поверх.
2. Логика отображения:
   - Если `isLoading === true` И нет сохранённых значений → показать `<Skeleton />` под размер заголовка/path/counters.
   - Если есть сохранённое значение → отображать его пока не придут свежие данные.
   - Если пришли свежие данные → отображать их.

### Шаг 4. Shimmer
1. Использовать `Skeleton` из `src/shared/ui/skeleton`.
2. Заменить блок с `repoCount · modifiedCount · sizeBytes` на условный рендер: либо Skeleton (3 коротких полоски), либо текст с реальными значениями.

## Acceptance criteria
- [x] При первой загрузке страницы воркспейса счётчики не показывают "0" — отображается shimmer-скелетон.
- [x] После загрузки значения записываются в persist-store и при следующем открытии страницы сразу видны реальные числа (без скачка 0 → 8).
- [x] При появлении свежих данных UI плавно обновляется.
- [x] Shimmer исчезает, когда данные готовы.
- [x] `npm run tsc` + `eslint` проходят без ошибок.

## Зависит от
—

## Статус: DONE — persist-store + shimmer для счётчиков воркспейса

### Что сделано
- `useAppStore` расширен: тип `WorkspaceCounters`, поле `workspaceCounters: Record<string, WorkspaceCounters>` и метод `setWorkspaceCounters(id, counters)`. Persist уже включён через `createPersistedStore`, поэтому значения сохраняются автоматически.
- Добавлен фиче-слайс `src/features/workspace-counters/` (FSD: `index.ts` + `model/`). Хук `useWorkspaceCounters(workspaceId, fresh)` читает сохранённые счётчики из стора, при готовности свежих данных пишет их в стор и возвращает `{ counters, isReady }`.
- `WorkspacePage` вычисляет `modifiedCount` до раннего `return`, вызывает `useWorkspaceCounters` и передаёт `counters` + `isReady` в `WorkspaceHero`.
- `WorkspaceHero` показывает три `Skeleton`-полоски пока `isReady === false`, иначе — реальные значения.

### Заметки для ревьюера
- Сигнатура хука — `useWorkspaceCounters(workspaceId, fresh)` (второй аргумент — свежие данные react-query + `isLoading`), а не одно-аргументная. Это нужно, чтобы `isReady` учитывал именно react-query-загрузку (`isReady = !isLoading || естьСохранённые`), а не только наличие сохранённых значений. `counters` синхронно доступен из стора.
- `sizeBytes` грузится отдельным запросом медленнее репозиториев: при `fresh.sizeBytes === null` берётся сохранённое значение (`fresh.sizeBytes ?? stored?.sizeBytes ?? null`), чтобы размер не «пропадал» и в стор не писался null поверх валидного значения.
- Запись в стор вынесена в `useEffect` внутри хука — это оправданный сайд-эффект персиста при изменении данных.
- `WorkspaceHeroProps` изменены: вместо `repoCount/modifiedCount/sizeBytes` теперь `counters: WorkspaceCounters | null` и `isReady: boolean`.
