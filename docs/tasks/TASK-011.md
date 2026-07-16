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

## Зависит от
- TASK-010
