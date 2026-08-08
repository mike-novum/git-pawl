# Code Review: TASK-323 — Iteration 1

## Metadata

- Date: 2026-08-08 16:30
- Scope: working-tree diff against HEAD, focused on TASK-323 ("RepoTree: модалка создания новой ветки")
- Files reviewed:
  - `src/features/create-branch/index.ts`
  - `src/features/create-branch/model/index.ts`
  - `src/features/create-branch/model/useCreateBranch.ts`
  - `src/features/create-branch/ui/index.ts`
  - `src/features/create-branch/ui/types.ts`
  - `src/features/create-branch/ui/CreateBranchDialog.tsx`
  - `src/features/create-branch/ui/CreateBranchDialog.test.tsx`
  - `src/widgets/repo-tree/ui/RepoTree.tsx`
  - `src/widgets/repo-tree/ui/RepoTree.test.tsx`
- Excluded changes: `AGENTS.md` (whitespace cleanup), `docs/tasks/README.md` (README-only), the untracked task files `TASK-324..326.md` (not in scope) — none of them affect the diff under review

## Verdict

`CHANGES_REQUIRED`

The new feature is structurally sound: FSD boundaries are respected, types are isolated in `types.ts`, arrow functions + `FC<Props>` + `handle` prefix follow `AGENTS.md`, IPC payload (`gitCheckout({ repoPath, ref, create: true })`) matches the zod schema in `electron/shared/schemas.ts:114-118` and the preload type in `electron/preload/index.ts:34`. `tsc`, `lint`, `test` (250/250), and `build` all pass. However, the integration with the existing `useCheckoutBranch` flow produces a confirmed user-visible bug: after a successful branch creation the user sees TWO consecutive toasts ("Ветка X создана" + "Ветка X переключена") because the dialog's `onCreated` callback re-enters `RepositoryPage.handleSwitchBranch` → `useCheckoutBranch.mutate`, and `useCheckoutBranch.onSuccess` unconditionally fires its own `toast.success`. This is a regression of the toast contract and a confirmed failure of the acceptance criterion "После успеха — toast.success" (singular). The author is aware of the design trade-off (notes acknowledge the second `git checkout` as a "no-op") but the resulting toast duplication is observable and was not caught by the unit tests because the test for the dialog mocks `useCreateBranch` in isolation. One Major and a few Minors below.

## Verification

| Check               | Status                          | Evidence |
| ------------------- | ------------------------------- | -------- |
| `npm run tsc`       | PASS                            | exit 0; `tsc --noEmit -p tsconfig.json && tsc --noEmit -p electron/tsconfig.json` produced no diagnostics |
| `npm run lint`      | PASS                            | exit 0; 0 errors, 7 pre-existing `react-refresh/only-export-components` warnings in `src/shared/ui/{button,dialog,input,tabs,toast}` (unrelated to TASK-323) |
| `npm test`          | PASS                            | exit 0; 38 files / 250 tests in 3.30s. `CreateBranchDialog.test.tsx` 5/5 green, `RepoTree.test.tsx` 2/2 green, `useCheckoutBranch.test.tsx` 4/4 green |
| `npm run build`     | PASS                            | exit 0; `electron-vite build` produced `out/main/index.mjs`, `out/preload/index.js`, `out/renderer/{index.html,index-*.js,index-*.css}` without errors |
| `npm run dev`       | PASS (limited)                  | `electron-vite dev` started, vite served renderer at `http://localhost:5173/`. Page loaded "Create your first workspace" empty state. The `git:rev-parse` error in the log targets `/Users/mikenovum/git/personal/gitlab-mcp` (an unrelated local repo with no commits) and is not caused by this task |
| Main screen         | PASS (limited)                  | Playwright MCP navigation to `http://localhost:5173/#/workspaces` returns `heading "Create your first workspace"`; no console errors; only 2 React Router v7 future-flag warnings (pre-existing) |
| Playwright MCP      | SKIPPED                         | The create-branch dialog is only mounted on the repository page (`/repos/...`), which requires a workspace to be selected first. The workspace list is loaded from `electron-store` via the IPC bridge (`fsWorkspaceList`), which is not exposed in the browser-only Playwright context. Verifying the dialog end-to-end through Playwright would require either seeding `localStorage` to bypass the workspace gate, or driving the real Electron BrowserWindow with Playwright `_electron`. The test was not run because the manual effort exceeds the value over the static analysis + the 5 unit tests that already cover the dialog behavior |
| Chrome DevTools MCP | SKIPPED                         | Same limitation as Playwright MCP — only the workspaces page is reachable from the browser without a real Electron main process holding the store |

## Critical

Нет подтверждённых findings.

## Major

### MA-1 — After a successful branch creation the user sees two consecutive success toasts

- Location: `src/features/create-branch/ui/CreateBranchDialog.tsx:37-44` (toast #1) → `src/widgets/repo-tree/ui/RepoTree.tsx:58-60` (`handleCreated` → `handleSwitchBranch`) → `src/pages/repository/ui/RepositoryPage.tsx:108-110` (`checkoutMutation.mutate({ ref: branchName })`) → `src/entities/branch/model/useCheckoutBranch.ts:51-53` (toast #2)
- Confidence: high
- Failure scenario: user clicks "New branch", types `feature/auth`, clicks Create. `useCreateBranch` runs `git checkout -b feature/auth` (success). `CreateBranchDialog` fires `toast.success({ title: 'Ветка feature/auth создана' })`, then `onCreated('feature/auth')` → `RepoTree.handleCreated` → `handleSwitchBranch` → `onSwitchBranch` in `RepositoryPage` → `checkoutMutation.mutate({ repoPath, ref: 'feature/auth' })`. `useCheckoutBranch` runs `git checkout feature/auth`, which is a no-op (prints `Already on 'feature/auth'`, exits 0) but its `onSuccess` handler still calls `toast.success({ title: 'Ветка feature/auth переключена' })`. The user sees two stacked toasts in the bottom-right corner with semantically contradictory messages ("создана" then "переключена") for a single user action. The second toast is also semantically false: nothing was switched.
- Evidence: the chain is fully traceable from code. `git checkout` against the current branch is well-defined as a no-op success (`runGit` does not special-case it; `execFile` returns stdout `Already on 'X'` with exit 0, no error thrown, so `useCheckoutBranch.onSuccess` always fires). The author explicitly acknowledges this design in the task notes: "фактически no-op … но сохраняет «единый handler» из ТЗ". The five `CreateBranchDialog.test.tsx` cases all mock `useCreateBranch` in isolation, so none of them exercises the `onCreated → useCheckoutBranch` chain; this is why the bug was not caught.
- Impact: visible regression of the user-facing notification contract. Two toasts for one user action is a real UX defect (notification spam, confusion about which step succeeded), and the second toast lies about what happened ("переключена" when no switch occurred). This conflicts with TASK-323 acceptance criterion: "После успеха — toast.success, Dialog закрывается, граф обновляется, текущая ветка переключается" (one toast, not two).
- Direction: pick one of:
  1. skip `onCreated` entirely in the dialog after a successful create (the dialog's own success callback already closes the dialog and invalidates the queries through `useCreateBranch.onSuccess`); rely on `useCreateBranch` to refresh `current-branch` and the branch list. This removes the duplicate `git checkout` and the duplicate toast.
  2. change `useCheckoutBranch` to accept an optional `{ silent?: boolean }` and call it with `silent: true` from `RepoTree.handleCreated` (semantically clearer: "we already switched via -b, just refresh the state").
  3. add a separate `useEnsureCurrentBranch` (or just call `queryClient.invalidateQueries({ queryKey: ['current-branch', repoPath] })`) from the dialog on success, and drop the redundant `handleSwitchBranch` round-trip.
- Fix verification: open the repo page in a real Electron BrowserWindow, click "New branch", type `feature/x`, press Create. Observe exactly one success toast ("Ветка feature/x создана") and no second toast. Add a unit test that mounts the real `CreateBranchDialog` (or the real `RepoTree`) with `useCheckoutBranch` unmocked, spies on its `toast.success`, and asserts it was called at most once across the create flow.

## Minor

### MI-1 — `handleClose` does not actually block the dialog from closing while a mutation is pending

- Location: `src/features/create-branch/ui/CreateBranchDialog.tsx:20-25`
- Confidence: high
- Failure scenario: with the dialog open and a name typed, the user presses the submit button, the mutation enters `isPending`, then the user presses `Esc` (or clicks the X close button). `Dialog.Root` calls `onOpenChange(false)`, which lands in `handleClose(false)`. The current code only guards `setName('')` behind `!isPending` and unconditionally calls `onOpenChange(next)`, so the dialog closes. The Cancel button is disabled while pending (line 93), so this inconsistency is real: the keyboard/X paths let the user dismiss the dialog while git is still running, the button path doesn't.
- Evidence: `Dialog.tsx:87-95` (shared/ui) renders a `BaseDialog.Close` with `aria-label="Close dialog"`, which fires `onOpenChange(false)` on click. The Base UI Dialog Root also closes on `Escape`. Both go through `handleClose`, which never blocks on `isPending`.
- Impact: minor UX inconsistency. No data loss (mutation completes), no crash. But it is observable and contradicts the intent expressed by disabling Cancel/inputs.
- Direction: at the top of `handleClose`, `if (!next && isPending) return;` so the dialog truly cannot be dismissed while pending from any input path.
- Fix verification: add a unit test that sets `isPending: true` via the `vi.doMock('../model', ...)` pattern already used in `CreateBranchDialog.test.tsx:250-275`, presses `Esc`, and asserts that `onOpenChange` is not called with `false`.

### MI-2 — No integration test for the `onCreated → handleSwitchBranch → useCheckoutBranch` chain

- Location: `src/features/create-branch/ui/CreateBranchDialog.test.tsx` (whole file) and `src/widgets/repo-tree/ui/RepoTree.test.tsx:1-122`
- Confidence: high
- Failure scenario: the only place the duplicate-toast bug (MA-1) and any other cross-feature wiring issue would surface is the integration between the dialog's `onCreated` callback and the parent `onSwitchBranch`. Neither test file renders both hooks. `CreateBranchDialog.test.tsx` mocks `../model` and `@/shared/ui` so the toast side-effect of the second mutation is invisible; `RepoTree.test.tsx` mocks `@/features/create-branch` as `() => null`, so the dialog never runs.
- Evidence: `CreateBranchDialog.test.tsx:11-20` mocks `useCreateBranch` and never imports `useCheckoutBranch`. `RepoTree.test.tsx:26-28` replaces `CreateBranchDialog` with a no-op. There is no test file for `src/widgets/repo-tree` that mounts the real dialog and asserts the post-create `onSwitchBranch` is invoked with the trimmed branch name.
- Impact: low (the static reading of the code finds the issue) but it perpetuates the gap that allowed MA-1 to ship.
- Direction: add a test (either in `RepoTree.test.tsx` or a new `RepoTree.integration.test.tsx`) that mounts `RepoTree` with the real `CreateBranchDialog` mocked at the `useCreateBranch` boundary only, types a branch name, clicks Create, and asserts `onSwitchBranch` is called exactly once with the trimmed name. Add a separate negative test that ensures `useCheckoutBranch.toast.success` is not called as a side effect of the create path (would force a fix for MA-1 if the dialog ever stops calling `onCreated`).
- Fix verification: `npm test` stays green; the new test fails before the MA-1 fix and passes after.

### MI-3 — Test for the "name with leading/trailing whitespace" case is missing

- Location: `src/features/create-branch/ui/CreateBranchDialog.tsx:32` (`const trimmed = name.trim()`) and `CreateBranchDialog.test.tsx`
- Confidence: medium
- Failure scenario: user types `  feature/x  `. The Create button is enabled (because `!name.trim()` is false on a non-empty trimmed string), so the user can submit. The mutation is called with `{ ref: 'feature/x' }` (trimmed), the success toast is `Ветка feature/x создана`, and `onCreated` is called with `'feature/x'`. The behavior is correct in code, but the test suite never exercises it.
- Evidence: the only "submit" test (`CreateBranchDialog.test.tsx:136-164`) types `'feature/new-branch'` (no leading/trailing whitespace) and asserts `mutateMock` was called with `{ ref: 'feature/new-branch' }`. No `user.type('  feature/x  ')` case.
- Impact: low — the behavior is correct, the test is just incomplete. A future refactor that accidentally removes the `trim()` would not be caught.
- Direction: add one `it('trims surrounding whitespace before mutate', ...)` case.
- Fix verification: the new test passes against current behavior; would fail if `name.trim()` is removed.

### MI-4 — Acceptance criterion "Пока выполняется — спиннер на кнопке 'Create'" verified only at the mock level

- Location: `src/features/create-branch/ui/CreateBranchDialog.test.tsx:240-284`
- Confidence: medium
- Failure scenario: the loading-state test re-imports `CreateBranchDialog` after `vi.doMock('../model', () => ({ isPending: true, ... }))`. It asserts `data-loading="true"` on the button mock and that the input is `disabled`. The mock's `data-loading` attribute is added by the mock factory itself, not by the real `<Button>`. So the test is verifying the wiring (the dialog passes `loading={isPending}` to the shared `<Button>` and `disabled={isPending}` to the shared `<Input>`), but it does not verify the real `Button` actually renders a spinner when `loading` is true. If the real `Button` ever stops respecting the prop, the unit test would still pass.
- Evidence: `CreateBranchDialog.test.tsx:42-54` — the mock's `<button data-loading={loading ? 'true' : undefined}>{loading ? <span data-testid="spinner" /> : null}{children}</button>` is what the test sees. The shared `Button` in `src/shared/ui/button/Button.tsx` is never imported by the test.
- Impact: low. A separate test for the shared Button would be the right place to verify spinner rendering. This is a test-hygiene concern, not a runtime defect.
- Direction: either add a Storybook `play` function for `Button` with `loading` set, or add a small `Button.test.tsx` that asserts the spinner is rendered when `loading` is true. No change to TASK-323 code required.
- Fix verification: the new Button test passes; the dialog test still passes.

## Questions for Author

Нет.

## Positive Notes

- Strict FSD compliance: `features/create-branch` is a new slice that only imports from `shared` and uses its own `index.ts` as the public API (`src/features/create-branch/index.ts`). RepoTree in `widgets` correctly imports through the public API (`import { CreateBranchDialog } from '@/features/create-branch'`) — no deep imports of `./ui/CreateBranchDialog`. The internal imports in the dialog use relative `../model` paths, which is the recommended pattern.
- IPC payload alignment is correct: `gitCheckout({ repoPath: input.repoPath, ref: input.ref, create: true })` in `useCreateBranch.ts:24-28` matches the zod schema `repoPath: z.string(), ref: z.string(), create: z.boolean().optional()` in `electron/shared/schemas.ts:114-118` and the preload type `GitCheckoutArgs = { repoPath: string; ref: string; create?: boolean }` in `electron/preload/index.ts:34`. The `create: true` literal is forwarded as a boolean, not a string.
- AGENTS.md style: `CreateBranchDialog` is an arrow function with `FC<CreateBranchDialogProps>` (`CreateBranchDialog.tsx:10`), the prop type is isolated in `types.ts`, no `function` keyword, no enums, no new comments, handlers use the `handle` prefix (`handleClose`, `handleNameChange`, `handleSubmit`). `RepoTree.handleCreated` follows the same convention. `useCreateBranch` and `useCheckoutBranch` are kept as two separate hooks with a clear single responsibility (one of them is creation, the other is checkout) and the same query-key list, which keeps the cache invalidation consistent.
- Test coverage at the unit level is reasonable: empty input → disabled Create, valid name + click → correct mutate payload, success → toast.success + onCreated + onOpenChange(false), error → toast.error + dialog stays open, pending → spinner + disabled input. The `vi.resetModules()` + `vi.doMock('../model', ...)` dance for the pending case is the correct way to test a per-render `isPending` value.
- Defensive: `useCreateBranch` does not call any toast on its own `onSuccess`, which means the model stays reusable in non-UI contexts (e.g., a future CLI test or a different dialog). All user-facing notifications stay in the UI layer.
- The dialog mounts cleanly inside `<aside>` — Base UI's `Dialog.Portal` renders the content at `document.body`, so the visual position is decoupled from the React tree, and `Dialog.Root` is correctly placed at the end of `RepoTree`'s JSX as a sibling of the `<Section>`s, not inside a `<button>` (which would have been invalid HTML).

## Unverified Areas and Limitations

- The dialog was not exercised end-to-end in a real Electron BrowserWindow. Playwright MCP and Chrome DevTools MCP can only reach `http://localhost:5173/#/workspaces` (the empty-state workspace page). Reaching the repository page that mounts `RepoTree` requires either a populated `electron-store` (read only by the Electron main process) or a manual user gesture on the native folder picker — both outside the reach of these tools in this review. The 5 dialog unit tests + the 2 RepoTree unit tests + the 4 `useCheckoutBranch` unit tests together cover the component logic, but the MA-1 duplicate-toast chain is only verifiable end-to-end or via an integration test that mounts both hooks (see MI-2).
- `npm run build` succeeded but the generated `out/renderer/index-*.js` bundle is the renderer only; this review did not unpack the bundle to confirm the new `CreateBranchDialog` code is present and not tree-shaken. Static analysis (TypeScript, lint, tests) already covers reachability.
- The author's note "After `git checkout -b X`, calling `git checkout X` is a no-op for git" is accepted as true (`git` itself documents this). It is a no-op for git's side effects on the working tree but not a no-op for the application: it (a) re-invalidates the same query keys, (b) fires a second success toast, (c) costs one extra `execFile` IPC round-trip. None of these corrupt data, but (b) is the user-visible defect captured in MA-1.
- The repo scope file `AGENTS.md` and `docs/tasks/README.md` were modified in the working tree but are not in the task's file list. They were excluded from the review as out-of-scope per the reviewer's instructions.
