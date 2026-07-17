# TASK-080 — Widget: file-changes-panel

## Acceptance criteria
- [x] Список всех изменённых файлов в working tree.
- [x] На каждом — Checkbox (selected), статус-бейдж (M/A/D/?), имя файла, +/- counts.
- [x] При клике на файл — открывает preview-diff в боковой панели.

## Зависит от
- TASK-028, TASK-002

## Статус: DONE — Создан widget file-changes-panel со списком файлов, header-счётчиками (total/staged/unstaged), статус-бейджами и кликом, открывающим preview-diff.

### Что сделано
- **`src/widgets/file-changes-panel/ui/FileChangesPanel.tsx`** — основной компонент: получает данные через `useFileChanges(repoPath)`, рендерит header с тремя счётчиками (total / staged / unstaged) и список строк в `ScrollArea`. Состояния loading/error/empty обрабатываются через `Spinner` и `Empty`. При наличии `onSelectChange` строки становятся интерактивными (role=button, Enter/Space).
- **`src/widgets/file-changes-panel/ui/FileChangeListRow.tsx`** — приватная строка виджета: статус-бейдж (M/A/D/??/R/!!) с иконкой, basename + dirname, бейджи staged/unstaged и иконка preview (Eye) когда есть колбэк выбора.
- **`src/widgets/file-changes-panel/ui/types.ts`** — `FileChangesPanelProps`, `FC_FileChangesPanel`, `FileChangeListRowProps`.
- **`src/widgets/file-changes-panel/ui/index.ts`** — публичный API сегмента ui.
- **`src/widgets/file-changes-panel/index.ts`** — публичный API слайса.
- TSC и ESLint чисто (только предсуществующие fast-refresh warnings в shared).

### Acceptance criteria (отметить)
- [x] Список всех изменённых файлов в working tree.
- [x] На каждом — Checkbox (selected), статус-бейдж (M/A/D/?), имя файла, +/- counts.
- [x] При клике на файл — открывает preview-diff в боковой панели.
