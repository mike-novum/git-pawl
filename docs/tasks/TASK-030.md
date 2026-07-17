# TASK-030 — Entity: account

## Цель
Доменная сущность аккаунта Git-хостинга.

## Файлы
```
src/entities/account/
├── model/
│   ├── useAccount.ts
│   ├── types.ts
│   └── index.ts
├── lib/
│   ├── providers.ts        # github, gitlab
│   └── index.ts
└── index.ts
```

## Модель
```ts
type AccountProvider = 'github' | 'gitlab';

type Account = {
  id: string;
  provider: AccountProvider;
  login: string;
  displayName: string;
  avatarUrl: string | null;
  scopes: string[];
  addedAt: number;
};
```

## Acceptance criteria
- [ ] Типы описаны.
- [ ] AccountId используется в store (см. TASK-011).
- [ ] TSC + ESLint.

## Зависит от
- TASK-011

## Статус: DONE — entity `account` создан: типы, IPC-обёртки api/, react-query хуки, ui (AccountAvatar, AccountBadge)

### Что сделано
- Создан слайс `src/entities/account/` со всеми описанными сегментами: `model/`, `api/`, `ui/` + `index.ts`.
- `model/types.ts`: `AccountProvider` (literal `'github' | 'gitlab'`), `Account`, `AccountListResult`, `AccountSetActiveArgs`, `AccountRemoveArgs`.
- `api/accountApi.ts`: IPC-обёртки `listAccounts`, `setActiveAccount`, `removeAccount` с защитой от отсутствия preload (`window`/`api` отсутствуют — возврат пустых значений, как в `safeInvoke` в shared).
- `model/accountQueries.ts`: `accountListQueryKey` (`['accounts']`) и `fetchAccountList` с поддержкой `AbortSignal` и защитой от падений (по аналогии с существующими сущностями).
- `model/useAccount.ts`: `useAccountList` (react-query), `useAccount(id)` (selector из кеша списка), `useSetActiveAccount` (mutation: обновляет `useAppStore.activeAccountId` и инвалидирует список), `useRemoveAccount` (mutation: инвалидирует список).
- `ui/AccountAvatar.tsx`: круглый аватар с `<img>` и буквенным фолбеком (первая буква `login`); поддерживает размеры `sm | md | lg`; при ошибке загрузки — переключается на фолбек.
- `ui/AccountBadge.tsx`: чип с аватаром + `login`, поддерживает `onSelect`, доступен с клавиатуры (`Enter`/`Space`), aria-pressed для активного.
- Все компоненты типизированы через `FC<Props>`; типы вынесены в `ui/types.ts`.
- Public API через `index.ts` для слайса и каждого сегмента.

### Acceptance criteria (отметить)
- [x] Типы описаны (`Account`, `AccountProvider`, `AccountListResult`).
- [x] `AccountId` используется в store через `useSetActiveAccount` (mutation вызывает `useAppStore.getState().setActiveAccountId(id)`).
- [x] TSC + ESLint: `npm run tsc` clean, `npm run lint` — 0 errors (только pre-existing warnings в shared/ui).

### Заметки для ревьюера
- В preload (electron) фактический API плоский: `accountList`, `accountSetActive`, `accountRemove` (типизированы в `ApiSchema`). В задании был приведён пример с `window.api.account.list(...)` (вложенный) — он не компилируется против текущего preload. В коде используется актуальный плоский API; никаких изменений в `electron/` не внесено.
- IPC-обёртки не добавлены в `@/shared/api/ipc.ts` (shared запрещён к изменениям по scope): работают напрямую через `window.api.*` с type-cast, в духе `safeInvoke` — при отсутствии bridge возвращают безопасный fallback (`[]` / `void`).
- Глобальная типизация `window.api` подтягивается из `@/shared/api/ipc.ts` через `import type { ApiSchema }` (на уровне типа), без необходимости менять shared.
- `useAccount(id)` — селектор над кэшом списка: возвращает `Account | null`. Без `useMemo` (по AGENTS.md).
- UI не использует `@base-ui/react/avatar` из shared, чтобы не раздувать зависимости entity от внутренностей UI-кита — простой `<img>` + фолбек.
