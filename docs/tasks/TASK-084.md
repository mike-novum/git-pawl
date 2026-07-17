# TASK-084 — Feature: commit-changes

## Цель
Сборка commit из select-files + commit-message-form + bypass.

## Что сделать
1. Хук `useCommit()`:
   - собирает `CommitMessage { header, body?, footer? }`
   - вызывает `git commit` с `--no-verify` если нужно
   - обрабатывает ошибки
2. UI-интеграция — кнопка "Commit" в форме.

## Acceptance criteria
- [x] Коммит создаётся с заданным message.
- [x] `--no-verify` корректно передаётся.
- [x] После успеха — обновляет commit-список.

## Что сделано

Создан слайс `src/features/commit-changes/`:

- `model/types.ts` — `CommitMessage { header, body?, footer? }`, `CommitInput`, `CommitResult`.
- `model/useCommit.ts` — react-query мутация. Принимает `repoPath`, читает выбранные файлы через `useSelectedFiles(repoPath)`, форматирует `CommitMessage` в строку (header + `\n\n` + body + `\n\n` + footer), вызывает `window.api.gitCommit({ repoPath, message, files?, noVerify? })`. `noVerify: true` передаётся, если `input.bypassHooks === true`. Инвалидирует `['commits', repoPath]` и `['git-status', repoPath]`. Toasts success/error через `useToast`.
- `model/index.ts` — реэкспорт.
- `ui/CommitButton.tsx` — кнопка-интеграция (FC + displayName). Принимает `repoPath`, `message`, `bypassHooks`, `disabled`. Дизейблится при пустом header / pending. Триггерит мутацию.
- `ui/types.ts` — `CommitButtonProps`.
- `ui/index.ts` — реэкспорт.
- `index.ts` — корневой реэкспорт.

`tsc` + `lint` чисто.

## Зависит от
- TASK-081, TASK-083, TASK-023, TASK-069
