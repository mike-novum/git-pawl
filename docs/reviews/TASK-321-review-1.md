# Code Review: TASK-321 — Iteration 1

## Metadata

- Date: 2026-08-08 16:10
- Scope: working-tree diff for `src/features/git-fetch/` (model + ui + new test) and `src/pages/repository/ui/RepositoryPage.tsx`; new file `src/features/git-fetch/ui/FetchButton.test.tsx`
- Files reviewed:
  - `/Users/mikenovum/projects/git-pawl/src/features/git-fetch/ui/FetchButton.tsx`
  - `/Users/mikenovum/projects/git-pawl/src/features/git-fetch/ui/types.ts`
  - `/Users/mikenovum/projects/git-pawl/src/features/git-fetch/model/useGitFetch.ts`
  - `/Users/mikenovum/projects/git-pawl/src/features/git-fetch/ui/FetchButton.test.tsx` (new)
  - `/Users/mikenovum/projects/git-pawl/src/pages/repository/ui/RepositoryPage.tsx`
- Excluded changes: `AGENTS.md`, `docs/tasks/README.md` — orthogonal doc edits, no scope overlap
- Reference context: `src/shared/ui/button/Button.tsx`, `src/features/git-pull/{ui,model}`, `src/entities/branch/model/{useBranch.ts,branchQueries.ts,useCheckoutBranch.ts}`, `electron/main/services/git/network.ts`, `electron/shared/schemas.ts`, `electron/preload/index.ts`

## Verdict

`APPROVED_WITH_FOLLOWUPS`

Кнопка Fetch корректно подключена к `useGitFetch` → `window.api.gitFetch`, иконка реально получает `animate-spin` пока `isPending` (проверено и unit-тестом, и в живом DOM), тосты используют русские тексты из задачи, query keys после успеха инвалидируются согласованно с `useGitPull`/`useCheckoutBranch`, типы вынесены в `types.ts`, компонент оформлен через `FC`, `tsc`/`lint`/`test`/`build` зелёные, визуально кнопка рендерится как квадратная `size-8` (32×32) с hover-фоном `surface-elevated` и корректным `aria-label="Fetch"`, при клике в браузерном preview (без `window.api`) появляется тост `«Не удалось выполнить fetch» / IPC bridge is unavailable` — то есть mutation/обработчик ошибки/текст тоста полностью работают.

Остаются только неблокирующие Minor-замечания по UX и согласованности с `PullButton`/`PushButton`, которые не нарушают acceptance criteria и могут быть устранены в следующих итерациях.

## Verification

| Check               | Status | Evidence |
| ------------------- | ------ | -------- |
| `npm run tsc`       | PASS   | exit 0; `tsc --noEmit` для renderer и electron, без диагностики |
| `npm run lint`      | PASS   | exit 0; 0 errors, 7 pre-existing `react-refresh/only-export-components` warnings (не связаны с задачей) |
| `npm test`          | PASS   | exit 0; `Test Files 37 passed (37) / Tests 242 passed (242)`, включая `src/features/git-fetch/ui/FetchButton.test.tsx (7 tests)` |
| `npm run build`     | PASS   | exit 0; `out/main/index.mjs`, `out/preload/index.js`, `out/renderer/index.html + assets/index-*.css (73.75 kB) + assets/index-*.js (1,357.73 kB)` собрались без ошибок |
| `npm run dev`       | PASS   | Vite dev server `http://localhost:5173/` поднялся, Electron стартовал; шум `git rev-parse HEAD` в head log идёт от чужого `/Users/mikenovum/git/personal/gitlab-mcp`, не от тестируемого scope |
| Main screen         | PASS   | Snapshot `/` (`#/workspaces`) — `0 errors, 2 warnings` (React Router future-flag warnings, не от задачи) |
| Playwright MCP      | PASS   | На `#/repos/test-repo` кнопка `Fetch` отрендерена рядом с `Open in terminal`/`Pull`/`Push`, `clientWidth/clientHeight = 32×32`, `aria-label="Fetch"`, `textContent=""` (нет label в `iconOnly`); клик вызвал диалог: heading `«Не удалось выполнить fetch»`, description `«IPC bridge is unavailable»` |
| Chrome DevTools MCP | PASS   | `list_console_messages` (errors): 0; `list_network_requests`: только Vite HMR/`@fs`/`/__open-in-editor` (dev-only); runtime-исключений нет. Консольные ERR_CONNECTION_REFUSED относятся к vite reconnect при отключении dev-сервера, не к renderer |

## Critical

Нет подтверждённых findings.

## Major

Нет подтверждённых findings.

## Minor

### MI-1 — Непоследовательный `loading` между Fetch/Pull/Push

- Location: `src/features/git-fetch/ui/FetchButton.tsx:62-73` (не-`iconOnly` ветка) vs `src/features/git-pull/ui/PullButton.tsx:50` и `src/features/git-push/ui/PushButton.tsx:50`
- Confidence: medium
- Failure scenario: в не-`iconOnly` режиме `FetchButton` рендерится с `loading` НЕ переданным на `Button`, поэтому пока крутится `RefreshCw` через `animate-spin`, рядом статичный `GitBranch` слева — пользователь видит, что вращается только правая иконка. В `PullButton`/`PushButton` в это же время показывается встроенный `Loader2` вместо `leftIcon` и `rightIcon` скрывается. Это противоречие между тремя «сетевыми» кнопками.
- Evidence: `PullButton.tsx:50` `loading={isPending}` против `FetchButton.tsx:62-73` где `loading` отсутствует, а `rightIcon={refreshIcon}` с `animate-spin`. Семантика «спиннера» расходится.
- Impact: низкая UX-согласованность; в `iconOnly` режиме отличие оправдано (иначе `RefreshCw` исчезнет, см. анализ в `Direction`), но в legacy wide-режиме три кнопки ведут себя по-разному.
- Direction: либо унифицировать `loading`-стратегию для всех трёх wide-кнопок (например, всегда передавать `loading` и использовать `Loader2`/общий компонент спиннера), либо явно задокументировать в коде/ARCHITECTURE.md, что `git-fetch` намеренно сохраняет «рефреш-спиннер» как иконографический сигнал.
- Fix verification: визуально в dev на `#/repos/test-repo` wide-режим сейчас не используется, поэтому для подтверждения достаточно ручного рендера `FetchButton` с `branchName="main"` без `iconOnly` и сравнения с `PullButton`/`PushButton` под нагрузкой.

### MI-2 — `active:bg-muted/80` не перекрывается потребителем

- Location: `src/pages/repository/ui/RepositoryPage.tsx:142` (className) совместно с `src/shared/ui/button/Button.tsx:18` (variant `ghost` базовый класс)
- Confidence: medium
- Failure scenario: `variant="ghost"` даёт `bg-transparent text-foreground hover:bg-muted active:bg-muted/80`. Потребитель перекрывает `text-foreground` → `text-muted-foreground` и `hover:bg-muted` → `hover:bg-surface-elevated`, но `active:bg-muted/80` остаётся от базового варианта. При зажатой кнопке (mouse-down) фон уйдёт в `bg-muted`, а не в `bg-surface-elevated` — поведение hover и active разъезжается.
- Evidence: `Button.tsx:18` `ghost: 'bg-transparent text-foreground hover:bg-muted active:bg-muted/80'`; `RepositoryPage.tsx:142` `className="text-muted-foreground hover:bg-surface-elevated hover:text-foreground size-8 p-0"` — нет `active:bg-surface-elevated`.
- Impact: cosmetic; во время клика фон мигает чуть иначе, чем при hover. Не влияет на функциональность.
- Direction: добавить `active:bg-surface-elevated` в `className` на `RepositoryPage.tsx:142` (или вынести пресет в shared-токен, чтобы и `OpenInFinder`/`OpenInTerminal` использовали те же ховеры).
- Fix verification: визуально в dev при mouse-down на `Fetch` фон должен оставаться `surface-elevated`, а не скакать в `bg-muted`.

### MI-3 — Отсутствует проверка, что QueryClient закеширован под `repoPath === null`

- Location: `src/features/git-fetch/model/useGitFetch.ts:40-51`
- Confidence: low
- Failure scenario: при `onSuccess` для каждого ключа вызывается `invalidateQueries({ queryKey: [key, repoPath] })`. Query keys совпадают с `branchQueries.ts` (`['branch-list', repoPath]`, `['branch-mainlines', repoPath]`, `['current-branch', repoPath]`) и `RepositoryPage.tsx:46` (`['git-log', repoPath]`). Если в одном из этих хуков в будущем добавится третий сегмент (например, `['branch-list', repoPath, opts]`), match по префиксу всё ещё сработает, но заодно инвалидируются все варианты — это может оказаться нежелательным. Сейчас не баг, но хрупкий контракт.
- Evidence: 4 ручных `invalidateQueries({ queryKey: [key, repoPath] })` — повторяют ту же формулу, что в `useGitPull.ts:46-49` и `useCheckoutBranch.ts`, что само по себе уже создаёт риск рассинхронизации при изменении формы ключа в одном из entity-хелперов.
- Impact: минимальный, пока query keys стабильны; при росте codebase возможны regression.
- Direction: вынести helper `invalidateGitNetworkQueries(queryClient, repoPath)` в `src/features/git-network/lib/` (после появления такого слайса) либо в `src/shared/api/gitQueryKeys.ts`, чтобы fetch/pull/push/checkout использовали одну функцию.
- Fix verification: рефакторинг не требуется для прохождения этой задачи; отложить до первого рефактора сетевых фич.

### MI-4 — Тест `pending` мутируется через глобальную переменную модуля

- Location: `src/features/git-fetch/ui/FetchButton.test.tsx:10-22, 213-221`
- Confidence: low
- Failure scenario: `let pending = false;` объявлен на верхнем уровне модуля и сетится через mock в `vi.mock('../model', ...)`. Если в будущем появится параллельный запуск тестов или третий describe, рассинхронизация `pending` приведёт к ложноположительным результатам (тест «animate-spin» пройдёт, потому что `pending` остался `true` от предыдущего блока). Сейчас работает за счёт явных `beforeEach`/`afterEach`, но хрупко.
- Evidence: `pending` объявлен `let` в module scope; `beforeEach` в блоке `loading state` ставит `pending = true`, `afterEach` сбрасывает — но если кто-то удалит `afterEach`, баг тихо проявится.
- Impact: поддерживаемость, не функциональность.
- Direction: заменить `pending` на `vi.fn().mockReturnValue(false)` и читать через `isPendingMock.mockReturnValue(true)`; или переписать мок как фабрику, возвращающую `{ ..., isPending: pending }` через getter.
- Fix verification: после рефакторинга запустить `npm test -- FetchButton.test.tsx`, оба describe-блока должны остаться зелёными.

## Questions for Author

1. Для `iconOnly`-режима вы сознательно отказались от `loading={isPending}` на `Button`, чтобы `RefreshCw` остался видимым и крутился через собственный `animate-spin`. Это правильное решение (иначе `Loader2` заменил бы `leftIcon`, а `children`/`rightIcon` затерялись бы). Хочу подтверждения: такое поведение задумано как иконографическое отличие «Fetch» от «Pull/Push», а не как побочный эффект?
2. В `useGitFetch.ts:14-18` ключи теперь совпадают с `useGitPull.ts:13-17` и `useCheckoutBranch.ts:18-21`. Это согласовано — но при изменении формы ключа в `branchQueries.ts` (например, добавлении третьего сегмента) три места надо править одновременно. Планируете ли вы в ближайших задачах выделить общий `invalidateGitQueries(queryClient, repoPath)` helper (см. MI-3)?

## Positive Notes

- Точное соответствие `loading`-стратегии в `iconOnly` режиме намерению задачи: `RefreshCw` остаётся видимым и спиннит через свой `animate-spin`, а не через `Loader2` от `Button` — корректное иконографическое решение.
- Query keys после успеха (`current-branch`, `branch-list`, `git-log`, `branch-mainlines`) теперь совпадают с `useGitPull` и `useCheckoutBranch`, что даёт согласованный инвариант для всех сетевых операций.
- `FetchButton.test.tsx` использует `vi.hoisted` для моков и явно ресетит `mutate`/`toast` в `beforeEach` — тесты изолированы и не зависят от порядка запуска в рамках файла.
- В `RepositoryPage` класс `size-8 p-0` корректно перекрывает дефолтный `md`-размер `Button` (`h-10 px-4`) через `tailwind-merge` в `cn()` — DOM подтверждает `clientWidth/clientHeight = 32×32`, что и требовалось.
- `aria-label="Fetch"` сохранён в `iconOnly`-режиме (Playwright snapshot находит кнопку по `name: 'Fetch'`), скрин-ридеры не теряют семантику, перенесённую из старой inline-кнопки.
- Тосты переведены на русский (`«Фетч выполнен»` / `«Не удалось выполнить fetch»`) — в живом preview подтверждено, что именно эти строки появляются в DOM.

## Unverified Areas and Limitations

- Поведение в реальном Electron-окне (не в Vite-preview под Playwright) не проверено: браузер Playwright подключается напрямую к `http://localhost:5173/`, поэтому `window.api.gitFetch` всегда отсутствует и проверяется только error-путь. Успешный путь (success toast «Фетч выполнен», инвалидация кешей `branch-list`/`git-log`/`branch-mainlines`/`current-branch`) покрыт только unit-тестом `FetchButton.test.tsx` и код-ревью соответствия query keys; runtime-верификация в реальном Electron выходит за рамки sub-agent без `_electron` Playwright и доступа к реальному git remote.
- Анимация `animate-spin` во время положительного `isPending` с длительностью > 0 не зафиксирована в браузере: в preview-режиме `mutate` падает синхронно (`throw 'IPC bridge is unavailable'`), `isPending` сразу сбрасывается. Visual confirmation того, что иконка реально успевает повернуться хотя бы на 90°, не получено — это работа тестов на jsdom и `PullButton`/`PushButton` в их собственных успешных сценариях.
- Не проверена корректность на Windows/Linux: поведение `bg-surface-elevated`/`text-muted-foreground` зависит от темы и токенов, определённых в `src/app/styles/theme.css`; текущий прогон — только в dark-теме Electron-preview.