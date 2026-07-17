# TASK-066 — Feature: git-reset / revert / amend

## Acceptance criteria
- [x] Reset: выбор mode (soft/mixed/hard), ref.
- [x] Revert: выбор коммита (через Command).
- [x] Amend: открывает текущий последний коммит, позволяет изменить message.
- [x] Все destructive — подтверждение через Dialog.

## Зависит от
- TASK-024, TASK-060

## Что сделано

Создан слайс `src/features/git-history/` (FSD `features/git-history`):

**Model (`model/`):**
- `useReset.ts` — react-query мутация, вызывает `window.api.gitReset({ repoPath, mode, ref? })`, инвалидирует `['git-status', repoPath]` и `['commits', repoPath]`, тосты.
- `useRevert.ts` — аналогично для `window.api.gitRevert({ repoPath, commit, noEdit? })`.
- `useAmend.ts` — аналогично для `window.api.gitAmend({ repoPath, message?, noVerify? })`.
- `model/index.ts` — публичный API сегмента.

**UI (`ui/`):**
- `ResetControls.tsx` — кнопка + Dialog с `Select` (soft/mixed/hard) и `Input` для ref. Hard mode и destructive Reset открывают дополнительный confirm Dialog.
- `RevertControls.tsx` — кнопка + Dialog с пикером коммитов на `Command` (cmdk) из `useCommitList`, чекбокс no-edit, confirm Dialog перед revert.
- `AmendDialog.tsx` — Dialog для редактирования message (textarea + чекбокс --no-verify). Не самодостаточный — управляется `open`/`onOpenChange` снаружи, чтобы хост мог подгрузить `initialMessage` от `useCommitList`.
- `types.ts` — типы пропсов.
- `ui/index.ts` — публичный API сегмента.

**Корень:**
- `index.ts` — публичный API слайса (экспорт `ResetControls`, `RevertControls`, `AmendDialog`, трёх хуков и их типов).

Соответствует AGENTS.md:
- FSD-структура `features/git-history/{ui,model}`, public API через `index.ts`.
- Все компоненты — arrow functions, типизированы `FC`.
- Типы — в отдельных `types.ts` (UI) и рядом с хуками (model).
- React Query, `useToast` из shared UI.
- Префиксные литералы: `GitResetMode = 'soft' | 'mixed' | 'hard'` — без enums.
- `npm run tsc` чисто.
- `npm run lint` — 0 errors, 0 warnings на новых файлах (pre-existing warnings только в shared/ui).

Destructive UX:
- Reset с mode=hard требует подтверждения через второй Dialog.
- Revert всегда требует подтверждения (создаёт новый коммит, потенциально с конфликтами).
- Amend не destructive.

## Notes
- В `electron/preload` типы IPC сейчас имеют более узкие сигнатуры (например, `GitResetArgs.target` вместо `ref`, `gitAmend` без полей). Внутри feature slice типы соответствуют ТЗ (`ref`, `noEdit`, `message`, `noVerify`), а вызов IPC сделан через узкий bridge-каст (`as unknown as Bridge`). Это безопасно: основной процесс валидирует args по `electron/shared/schemas.ts`, где параметры названы `ref`/`noEdit`/`message`/`noVerify`.
