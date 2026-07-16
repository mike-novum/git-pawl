# TASK-020 — IPC-мост с валидацией

## Цель
Безопасный мост между renderer и main: каналы, zod-схемы, типизация.

## Что сделать

1. `electron/shared/ipc-channels.ts` — единый enum строк каналов.
2. `electron/shared/schemas.ts` — zod-схемы для payloads:
   - `gitStatusArgsSchema`, `gitCloneArgsSchema`, и т.д.
3. `electron/main/ipc/register.ts` — регистрация всех `ipcMain.handle`, валидация входящих данных через `safeParse`.
4. `electron/preload/index.ts` — типизированный `window.api`:
   ```ts
   window.api.git.status(args: GitStatusArgs): Promise<GitStatusResult>
   window.api.git.clone(args: GitCloneArgs): Promise<void>
   ...
   ```
5. `src/shared/api/ipc.ts` — обёртки `gitStatus(args)`, обработка ошибок.
6. Юнит-тест на схемы (`*.test.ts` рядом).

## Acceptance criteria
- [ ] Каждый IPC-канал имеет zod-схему.
- [ ] Renderer получает типизированные ответы.
- [ ] Невалидный payload → ошибка с понятным сообщением, не crash.
- [ ] Юнит-тесты для схем проходят.

## Зависит от
- TASK-010

## Безопасность
- contextIsolation + sandbox включены.
- Без `ipcRenderer` в renderer.
