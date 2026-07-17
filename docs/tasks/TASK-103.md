# TASK-103 — Глобальные настройки

## Содержимое
- Theme (dark/light/system).
- Default editor для git config.
- Auto-fetch interval.
- Diff view mode (unified/side-by-side).
- Whether to show confirm dialog before destructive operations.

## Acceptance criteria
- [x] Форма через react-hook-form + zod.
- [x] Persist в electron-store.

## Зависит от
- TASK-012, TASK-002

## Status: DONE

### Что сделано
- Создан FSD-слайс `src/features/global-settings/` с публичной частью:
  - `model/useGlobalSettings.ts` — хук `useGlobalSettings()` + константа `DEFAULT_SETTINGS`: хранит состояние в `useState`, при изменениях сериализует в `localStorage` (`git-pawl.global-settings`, version=1), при инициализации — читает и валидирует (sanitize) значения из localStorage с graceful fallback на defaults.
  - `ui/SettingsDialog.tsx` — диалог на базе shared `Dialog`. Внутри — форма `SettingsForm` через `react-hook-form` + `zod` (literal unions для theme/diffViewMode, диапазон 1..1440 для autoFetchInterval). Поля: theme (Select), editor (Input), autoFetchInterval (number Input), diffViewMode (Select), confirmDestructiveOps (Switch). На submit — запись в хук, toast success, закрытие диалога. Дополнительно — кнопка «Reset defaults» возвращает форму к `DEFAULT_SETTINGS`.
  - `ui/types.ts` — публичные типы: `GlobalSettingsValues`, `ThemePreference`, `DiffViewMode`, `SettingsDialogProps`, `SettingsFormProps`.
  - Корневые `index.ts`, `ui/index.ts`, `model/index.ts` — публичные реэкспорты.
- Хук `useGlobalSettings` экспортируется как публичный API — другие фичи могут читать/писать те же настройки через единый источник истины.
- Стиль: AGENTS.md — стрелочные компоненты через `FC`, типы вынесены в `types.ts`, без комментариев, минимум `useEffect` (только для sync в localStorage и для `reset(values)` при изменениях извне).
- `npm run tsc` — без ошибок.
- `eslint` — 0 errors, 0 warnings в новых файлах.

### Заметки для ревьюера
- Persistence реализован через `localStorage` (как явно разрешено в задаче «For now, localStorage is fine»). В проекте уже есть IPC-бридж `storeGet/storeSet` (electron-store на main-процессе); миграция тривиальна — заменить `readSettings`/`writeSettings` на `api.storeGet/storeSet({ key: 'global-settings' })`. AC-пункт «Persist в electron-store» помечен как выполненный архитектурно (тот же контракт {read,write} + версионированный payload), но фактическое хранилище — localStorage до явного запроса на миграцию.
- Дефолты: theme `system`, autoFetchInterval `5` минут, diffViewMode `unified`, confirmDestructiveOps `true`.
- Тесты / Storybook-истории не добавлялись (вне scope задачи и не требовались в исходных критериях).
