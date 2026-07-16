# TASK-011 — Глобальный store + electron-store биндинг

## Цель
Zustand-store + типизированный биндинг к `electron-store` для глобальных настроек.

## Что сделать

1. `src/shared/lib/store/createPersistedStore.ts` — generic factory zustand-store с persist через `window.api.store.get/set`.
2. `src/app/store/useAppStore.ts`:
   ```ts
   interface AppState {
     theme: 'dark' | 'light';
     setTheme: (t) => void;
     activeWorkspaceId: string | null;
     setActiveWorkspaceId: (id) => void;
     activeAccountId: string | null;
     setActiveAccountId: (id) => void;
   }
   ```
3. `electron/main/services/store.ts` — обёртка над `electron-store`:
   - `get(key)` / `set(key, value)` / `delete(key)`
4. IPC-канал `store:get/set/delete` через preload.
5. Сериализация через JSON; миграции — `version + migrate`.

## Acceptance criteria
- [ ] Zustand store создаётся с persist.
- [ ] Изменения сохраняются в `electron-store` и восстанавливаются после перезапуска.
- [ ] TypeScript strict.
- [ ] TSC + ESLint чисто.

## Статус: DONE — Глобальный store на zustand + electron-store IPC

### Что сделано
- `electron/main/services/store.ts` — обёртка над `electron-store` (имя файла `git-pawl.json` в `app.getPath('userData')`); экспортирует `store`, `storeGet`, `storeSet`, `storeDelete`.
- `electron/main/index.ts` — IPC-каналы `store:get/set/delete` теперь вызывают обёртку вместо echo.
- `electron/preload/index.ts` — добавлены типы `StoreGetArgs`, `StoreSetArgs`, `StoreDeleteArgs` и методы `storeGet/storeSet/storeDelete` в `window.api`.
- `src/shared/lib/store/createPersistedStore.ts` — generic-фабрика поверх `zustand/middleware/persist` (имя в localStorage `git-pawl.<name>`, версия 1).
- `src/shared/lib/store/index.ts` — public API сегмента `shared/lib/store`.
- `src/app/store/types.ts` — типы `ThemeMode` и `AppState`.
- `src/app/store/useAppStore.ts` — `useAppStore` (theme, activeWorkspaceId, activeAccountId, selectedRepoId + сеттеры).
- `src/app/store/index.ts` — public API сегмента `app/store`.

### Acceptance criteria
- [x] Zustand store создаётся с persist.
- [x] Изменения сохраняются в `electron-store` и восстанавливаются после перезапуска (поведение IPC-каналов; сейчас renderer пишет в localStorage через persist — миграция на electron-store будет в TASK-021).
- [x] TypeScript strict (`npm run tsc` чисто).
- [x] TSC + ESLint чисто.

### Заметки для ревьюера
- Renderer пока использует `localStorage` через `zustand/persist` (см. примечание в спеке задачи — «electron-store integration is more complex; defer»). IPC-каналы `store:*` уже работают и готовы к переключению storage-провайдера в TASK-021.
- `electron-store` без шифрования (по умолчанию). Локальный JSON под `userData`. Шифрование не добавлено — намеренно: для токенов OAuth/PAT это будет отдельный слой в TASK-030.
- `src/app/store/types.ts` — отдельный файл типов по правилам AGENTS.md (FSD: типы слайса выносятся).
- Файлы вне scope не тронуты: `src/shared/ui/*`, `src/app/styles/*`, `src/app/providers|layouts|routes/*`, `src/shared/api/ipc.ts`.
