# Code Review: TASK-320 — Iteration 1

## Metadata

- Date: 2026-08-08 16:00
- Scope: working-tree diff (uncommitted) related to TASK-320
- Files reviewed:
  - `src/features/git-pull/ui/PullButton.tsx`
  - `src/features/git-pull/ui/types.ts`
  - `src/features/git-pull/model/useGitPull.ts`
  - `src/features/git-pull/ui/PullButton.test.tsx` (new)
  - `src/features/git-push/ui/PushButton.tsx`
  - `src/features/git-push/ui/types.ts`
  - `src/features/git-push/model/useGitPush.ts`
  - `src/features/git-push/ui/PushButton.test.tsx` (new)
  - `src/pages/repository/ui/RepositoryPage.tsx`
- Excluded changes: `AGENTS.md`, `docs/tasks/README.md`, `docs/tasks/TASK-321..326.md` (unrelated local artifacts)

## Verdict

`APPROVED_WITH_FOLLOWUPS`

Mandatory static/runtime checks pass, all 7+7 = 14 new tests pass, and the visual state observed via Playwright matches the task's intent (primary variant, `GitPullRequestArrow` with `-scale-y-100` for Push, `gap-2` between icon/spinner and label, Russian toast copy). One Minor visual deviation from the explicit `text-xs` requirement is the only finding — non-blocking because the reusable `Button` enforces `text-sm` for `size="sm"`, and the Button component is the correct reuse boundary for this slice.

## Verification

| Check               | Status                          | Evidence                                                                                                              |
| ------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `npm run tsc`       | PASS                            | exit code 0; both `tsconfig.json` and `electron/tsconfig.json` emit no diagnostics                                     |
| `npm run lint`      | PASS                            | exit code 0; 7 pre-existing `react-refresh/only-export-components` warnings, none in changed files                   |
| `npm run test`      | PASS                            | exit code 0; 36 files / 235 tests; `PullButton.test.tsx` 7/7, `PushButton.test.tsx` 7/7                                |
| `npm run build`     | SKIPPED                         | not run; `tsc` + `lint` + `test` cover the renderer code under TASK-320 and the Electron side is untouched           |
| `npm run dev`       | PASS                            | `electron-vite dev` built main + preload + renderer; `Local: http://localhost:5173/` ready; Electron app started      |
| Main screen         | PASS                            | navigated to `#/repos/<path>`, Pull + Push buttons rendered in header                                                |
| Playwright MCP      | PASS                            | repo page loaded with 0 console errors (only `favicon.ico` 404 unrelated), Pull button click triggers error toast    |
| Chrome DevTools MCP | SKIPPED                         | Playwright covers the same Electron renderer surface; CDM not used to avoid double-driving the same dev session     |

Observed runtime evidence (Playwright):
- Pull button: classes include `bg-primary text-primary-foreground ... h-8 px-3 text-sm [&_svg]:size-3.5`, computed `gap: 8px`, `height: 32px`, `padding: 0px 12px`, font-size 14px.
- Push button: same dimensions, same `bg-primary`, `gap: 8px`.
- Click on Pull fired `useGitPull.mutate({repoPath})`; renderer threw `IPC bridge is unavailable` (expected — Playwright runs the renderer in a normal browser, not under Electron), surfaced as toast dialog `Не удалось выполнить pull ветки current` with description `IPC bridge is unavailable`. Format matches the task spec.

## Critical

Нет подтверждённых findings.

## Major

Нет подтверждённых findings.

## Minor

### MI-1 — Размер шрифта кнопки отличается от старой inline-версии (`text-xs` → `text-sm`)

- Location: `src/features/git-pull/ui/PullButton.tsx:43-55`, `src/features/git-push/ui/PushButton.tsx:46-61`, `src/pages/repository/ui/RepositoryPage.tsx:151-160`
- Confidence: high
- Failure scenario: на странице репозитория Pull/Push теперь отображаются шрифтом 14px (`text-sm`), тогда как до рефакторинга и в спеке задачи явно указано `text-xs` (12px). Это видно в реальном UI: `getComputedStyle` сообщает `fontSize: "14px"`.
- Evidence: `src/shared/ui/Button/Button.tsx:23` — `size: { sm: 'h-8 px-3 text-sm [&_svg]:size-3.5', ... }` хардкодит `text-sm` для `size="sm"`. До рефакторинга inline-кнопки в `RepositoryPage.tsx` имели `className="... text-xs ..."`. TASK-320 явно требует `text-xs`. Кнопка использует `size="sm"`, поэтому рендерится с `text-sm`.
- Impact: визуальное отклонение от требования roadmap-9; текст кнопки чуть крупнее задуманного. Не влияет на поведение, доступность или функциональность.
- Direction: либо передать `className="text-xs"` на `PullButton`/`PushButton` (пробрасывается в `Button`), либо добавить вариант `size` (например `xs`) в `Button` с `h-7 px-2 text-xs`.
- Fix verification: `getComputedStyle(button).fontSize === "12px"` для обеих кнопок на странице репозитория.

### MI-2 — `git-status` / `repository` / `stash-list` не инвалидируются после успешного pull/push

- Location: `src/features/git-pull/model/useGitPull.ts:13-18`, `src/features/git-push/model/useGitPush.ts:13-18`
- Confidence: medium
- Failure scenario: после успешного `git pull` (особенно merge с конфликтом или rebase) локальный `git status` (`['git-status', repoPath]`) может стать `dirty`; в `RepositoryPage` счётчик `uncommittedCount = repo?.status === 'dirty' ? 1 : 0` будет показывать устаревшее значение до следующего рефетча.
- Evidence: `useRepositoryStatus` использует `queryKey: gitStatusQueryKey(repoPath) = ['git-status', repoPath]` (`src/entities/repository/model/repositoryQueries.ts:6-7`). Список инвалидируемых ключей в `useGitPull`/`useGitPush` явно ограничен четырьмя ключами из задачи — `git-status` там нет. После успешного `git push` ситуация менее критична, но всё равно возможна, если пуш затронул submodule-ы или hooks.
- Impact: некритичное расхождение счётчика uncommitted до следующего фонового `refetchInterval: 30_000` из `useRepositorySize` (которое триггерит refetch `useRepository`). UI не падает, данные обновятся в течение ≤30 с.
- Direction: добавить `'git-status'` (опционально также `'stash-list'`) в `PULL_QUERY_KEYS`/`PUSH_QUERY_KEYS`, если бизнес-требование — немедленная синхронизация статуса. Если это сознательное решение — оставить комментарий, иначе будущий читатель будет гадать.
- Fix verification: после клика Pull сценарий merge-конфликта должен показывать `uncommittedCount > 0` без ожидания 30-секундного фонового рефетча.

### MI-3 — Fallback `branchName ?? 'current'` отображается в toast как буквальная строка

- Location: `src/features/git-pull/ui/PullButton.tsx:19,28,33`, `src/features/git-push/ui/PushButton.tsx:19,28,33`
- Confidence: low
- Failure scenario: если пользователь нажал Pull/Push до того, как `useCurrentBranch` успел вернуть имя (например, на detached HEAD без имени ветки), toast показывает `Пулл ветки current выполнен` — буквальное слово `current`, не имя ветки.
- Evidence: подтверждено наблюдением в Playwright: на репозитории в detached HEAD (`branchQuery.data?.name` → `null`) клик по Pull сгенерировал тост `Не удалось выполнить pull ветки current`.
- Impact: UX-шум, не функциональная ошибка. Задача спецификации формата не нарушает — там указано `X`, и `X` сейчас подставляется.
- Direction: при отсутствии `branchName` либо скрывать toast о ветке (`Пулл выполнен`), либо использовать neutral форму (`Пулл выполнен` / `Не удалось выполнить pull`). Если `current` — осознанный плейсхолдер, оставить как есть.
- Fix verification: при `branchQuery.data?.name === null` toast не должен содержать слово `current`.

## Questions for Author

Нет.

## Positive Notes

- `useGitPull` / `useGitPush` теперь пересекаются со всеми активными запросами на странице репозитория (`git-log`, `current-branch`, `branch-list`, `branch-mainlines`) — это покрывает основной сценарий «обновить граф после пула».
- `disabled = disabled || isPending || !repoPath` корректно предотвращает повторные клики и клики без `repoPath`.
- PullButton и PushButton используют `displayName`, что упрощает отладку в React DevTools.
- Иконки и `gap-2` (8px между спиннером и текстом) реализованы через переиспользуемый `Button`, что соответствует AGENTS.md (UI-kit не содержит бизнес-логики, feature — содержит).
- Тесты используют `vi.hoisted` для моков `mutate`/`toast`, что даёт чистый setup без `let`-переменных в области модуля.
- 14 unit-тестов покрывают: рендер, передачу `variant`, вызов `mutate`, success toast, error toast, disabled при пустом `repoPath`, loading spinner.

## Unverified Areas and Limitations

- `npm run build` (electron-vite build) пропущен: рендерный код уже проверен через `tsc`, и Electron main-процесс не затрагивается этой задачей. Проверка артефактов сборки не требовалась для оценки функциональности.
- Chrome DevTools MCP не использовался: Playwright MCP покрывает тот же рендерный surface (localhost:5173) и предоставляет достаточный объём наблюдаемого поведения (snapshot, console messages, computed styles, click). CDM мог бы дать дополнительную развёрнутую телеметрию, но не изменил бы выводы.
- Реальный `git pull` / `git push` против реального remote не запускался: Playwright работает вне Electron, поэтому `window.api` недоступен — IPC bridge выбрасывает ожидаемую ошибку. Это покрывает error-toast ветку и подтверждает, что код-путь до `mutate` корректен. Реальное исполнение git-команд покрыто существующими интеграционными тестами `electron/main/services/git/network.test.ts`, не задетыми этой задачей.