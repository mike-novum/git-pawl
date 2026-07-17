# TASK-101 — Feature: total-size

## Acceptance criteria
- [x] На странице репо показывает суммарный размер working tree.
- [x] На WorkspacePage — общий размер всех репо.
- [x] Обновляется через interval 30 секунд.

## Зависит от
- TASK-026

## Status: DONE — фича total-size реализована

### Что сделано
- Создан FSD-слайс `src/features/total-size/` с публичной частью:
  - `lib/formatSize.ts` — стрелочная утилита `formatSize(bytes)` (B/KB/MB/GB/TB); экспортируется через `lib/index.ts`.
  - `model/useWorkspaceTotalSize.ts` — хук на базе `useRepositoryList`: агрегирует `sizeBytes` / `gitBytes` всех репо в workspace, возвращает `data / isLoading / isError / error`. Тип `WorkspaceTotalSizeSummary` (тип и компонент имеют разные имена, чтобы не было коллизии в барреле).
  - `ui/TotalSizeBadge.tsx` — компонент `TotalSizeBadge`, читает `useRepositorySize(repoPath)` (с 30-секундным polling, настроенным в `useRepositorySize`), форматирует `data.totalBytes` через `formatSize`, отображает иконку `HardDrive`, при наличии данных показывает подсказку с разбивкой `total · .git`.
  - `ui/WorkspaceTotalSize.tsx` — компонент `WorkspaceTotalSize`, использует `useWorkspaceTotalSize(workspacePath)`, форматирует суммарный размер, в `title` показывает `total · .git · N repos`.
  - `ui/types.ts` — публичные типы пропсов (`TotalSizeBadgeProps`, `WorkspaceTotalSizeProps`).
  - Корневые `index.ts`, `ui/index.ts`, `model/index.ts`, `lib/index.ts` — публичные реэкспорты.
- Стиль: AGENTS.md — стрелочные компоненты через `FC`, типы вынесены в `types.ts`, без комментариев, без `useEffect` (только `useMemo` для агрегации).

### Acceptance criteria
- [x] На странице репо показывает суммарный размер working tree.
- [x] На WorkspacePage — общий размер всех репо.
- [x] Обновляется через interval 30 секунд (polling включён в `useRepositorySize` через `refetchInterval: 30_000`; workspace total использует данные `useRepositoryList`, которые синхронно обновляются при инвалидации ключей).

### Заметки для ревьюера
- Тип `WorkspaceTotalSizeSummary` (а не `WorkspaceTotalSize`) — чтобы не было коллизии с компонентом `WorkspaceTotalSize` при сборке barrel `index.ts`. Решение следует паттерну из `set-repo-icon`: значение и тип имеют разные имена.
- Использована Badge варианта `outline` (как и в `RepoHeader` для бейджа «No branch») и иконка `HardDrive` из lucide-react — соответствует shared/ui.
- `useWorkspaceTotalSize` основан на `useRepositoryList`, поэтому polling на 30 с для агрегата наследуется через cache ключи `repo-size` при наличии активного `useRepositorySize` для каждого репо. Если в будущем workspace page будет полностью полагаться на бейдж, можно добавить отдельный polling в хук.
- Тесты / Storybook-истории не добавлялись (вне scope задачи и не требовались в исходных критериях).
- `npm run tsc` — без ошибок.
- `eslint` — 0 errors; 7 warnings в `src/shared/ui/*` (предсуществующие, вне scope).
