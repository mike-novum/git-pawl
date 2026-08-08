# Code Review: TASK-323 — Iteration 2

## Metadata

- Date: 2026-08-08 18:15
- Scope: pass #2 of TASK-323 — fixes after review #1
- Files reviewed:
  - `src/features/create-branch/ui/CreateBranchDialog.tsx`
  - `src/features/create-branch/ui/types.ts`
  - `src/widgets/repo-tree/ui/RepoTree.tsx`
  - `src/widgets/repo-tree/ui/RepoTree.integration.test.tsx` (new)
- Excluded changes: `AGENTS.md` (whitespace), `docs/tasks/README.md`, the untracked task files `TASK-324..326.md`, and the previously reviewed source files in `src/features/create-branch/{index.ts,model/*,ui/index.ts,ui/CreateBranchDialog.test.tsx}` and `src/widgets/repo-tree/ui/RepoTree.test.tsx` — these are unchanged since review #1 and were already verified there

## Verdict

`APPROVED`

All findings from review #1 (1 Major + 4 Minor) are addressed. The MA-1 duplicate-toast regression is fixed by removing `onCreated` from the dialog, so the create flow no longer re-enters `useCheckoutBranch`; `useCreateBranch.onSuccess` invalidates the same 4 query keys that `useCheckoutBranch` would have, which is sufficient to refresh `current-branch`, `branch-list`, `git-log`, and `branch-mainlines` (verified by matching the key factories in `src/entities/branch/model/branchQueries.ts` and the inline `['git-log', repoPath]` key in `src/pages/repository/ui/RepositoryPage.tsx:46`). A new `RepoTree.integration.test.tsx` proves the MA-1 fix at the wiring level (one toast, no `onSwitchBranch` call). `handleClose` now blocks dismissal while `isPending`, with a dedicated test. The `name.trim()` path is covered by a new unit test. `tsc`, `lint`, `test` (253/253), and `build` all pass; `npm run dev` serves the renderer and the workspaces page loads without errors.

## Verification

| Check               | Status                          | Evidence |
| ------------------- | ------------------------------- | -------- |
| `npm run tsc`       | PASS                            | exit 0; no diagnostics from `tsc --noEmit -p tsconfig.json && tsc --noEmit -p electron/tsconfig.json` |
| `npm run lint`      | PASS                            | exit 0; 0 errors, 7 pre-existing `react-refresh/only-export-components` warnings in `src/shared/ui/{button,dialog,input,tabs,toast}` (unrelated to TASK-323) |
| `npm test`          | PASS                            | exit 0; 39 files / 253 tests in 3.36s. `CreateBranchDialog.test.tsx` 7/7 (was 5/5: +`trims surrounding whitespace`, +`does not close the dialog when a dismiss request arrives while pending`), `RepoTree.test.tsx` 2/2 (existing-branch switch + disabled-on-current), `RepoTree.integration.test.tsx` 1/1 (new), `useCheckoutBranch.test.tsx` 4/4 unchanged |
| `npm run build`     | PASS                            | exit 0; `electron-vite build` produced `out/main/index.mjs`, `out/preload/index.js`, `out/renderer/{index.html,assets/*}` |
| `npm run dev`       | PASS                            | `electron-vite dev` started, renderer served at `http://localhost:5173/`. Page loaded "Create your first workspace" empty state. The `git:rev-parse` error in the log targets `/Users/mikenovum/git/personal/gitlab-mcp` (an unrelated local repo with no commits) and is not caused by this task |
| Main screen         | PASS                            | Playwright MCP navigation to `http://localhost:5173/#/workspaces` returns `heading "Create your first workspace"`; no console errors; only 2 React Router v7 future-flag warnings (pre-existing) |
| Playwright MCP      | SKIPPED                         | Same limitation as review #1: the create-branch dialog is only mounted on the repository page (`/repos/...`), which requires a workspace to be selected first. The workspace list is loaded from `electron-store` via the IPC bridge (`fsWorkspaceList`), which is not exposed in the browser-only Playwright context. The integration test (`RepoTree.integration.test.tsx`) covers the same end-to-end wiring at the React tree level |
| Chrome DevTools MCP | SKIPPED                         | Same limitation as Playwright MCP |

## Critical

Нет подтверждённых findings.

## Major

Нет подтверждённых findings.

## Minor

### MI-1 (new, pass #2) — `useCheckoutBranch` is mocked but unused in `RepoTree.integration.test.tsx`

- Location: `src/widgets/repo-tree/ui/RepoTree.integration.test.tsx:11-17`
- Confidence: low
- Failure scenario: no behavioral defect — the mock is just unnecessary noise in the test file. `RepoTree.tsx` only uses `useBranches` from `@/entities/branch` (line 4, line 41); `useCheckoutBranch` is consumed by `RepositoryPage.tsx:43`, which is not in the render tree of this integration test. The mock was likely copied from `RepoTree.test.tsx:11-16`.
- Evidence: `grep -n "useCheckoutBranch" src/widgets/repo-tree/ui/RepoTree.tsx` returns no matches. The mock returns a static `{ mutate: vi.fn(), isPending: false }` and is never invoked.
- Impact: test hygiene only. Future readers will waste time looking for a reason this mock is here. No correctness or behavior risk.
- Direction: remove the `useCheckoutBranch` key from the `@/entities/branch` mock in `RepoTree.integration.test.tsx`. Keep the `useBranches` key only.
- Fix verification: `npm test` stays green; the file becomes ~6 lines shorter.

### MI-2 (new, pass #2) — No unit test asserting that `useCreateBranch.onSuccess` invalidates the expected query keys

- Location: `src/features/create-branch/model/useCreateBranch.ts:42-47`
- Confidence: medium
- Failure scenario: a future refactor that drops one of the 4 keys from `CREATE_QUERY_KEYS` (or typos a key) would not be caught by any test in the `create-branch` slice. The current integration test (`RepoTree.integration.test.tsx`) does not exercise `useCreateBranch` directly — it mocks the hook entirely. The shared `useCheckoutBranch` has the equivalent test (`useCheckoutBranch.test.tsx:76-107`).
- Evidence: `find src/features/create-branch -name "*.test*"` returns only `ui/CreateBranchDialog.test.tsx`. There is no `src/features/create-branch/model/useCreateBranch.test.ts(x)`. The `useCheckoutBranch.test.tsx` analogue sets the precedent.
- Impact: low — the invariant is satisfied today (verified by code review and by `useCheckoutBranch`'s test passing against the same key list), but the safety net is missing. If `useCheckoutBranch` were ever deleted and `useCreateBranch` had to take over, the lack of test would let the wrong keys slip in unnoticed.
- Direction: add a small `useCreateBranch.test.tsx` that mocks `@/shared/api`, renders the hook with `renderHook`, and asserts the 4 invalidated query keys on success (`expect(calledKeys).toEqual(expect.arrayContaining(['current-branch', 'branch-list', 'git-log', 'branch-mainlines']))`).
- Fix verification: the new test passes against current behavior; would fail if any of the 4 keys is removed/renamed.

## Questions for Author

Нет.

## Positive Notes

- The fix for MA-1 is exactly the right level of abstraction: instead of layering a `silent` flag onto `useCheckoutBranch` or adding a separate refresh hook, the author recognized that `git checkout -b X` already switches the branch, so the redundant `git checkout X` round-trip was removed entirely. This matches the architecture in `architecture.md` ("Все git-операции выполняются в main-процессе через `child_process.execFile('git', ...)`") — one git invocation per user action, not two.
- `useCreateBranch.onSuccess` invalidates the exact same 4 query keys as `useCheckoutBranch.onSuccess` (`current-branch`, `branch-list`, `git-log`, `branch-mainlines`). The keys are defined in `useCreateBranch.ts:16-21` as `CREATE_QUERY_KEYS` and match `useCheckoutBranch.ts:17-22` (`CHECKOUT_QUERY_KEYS`). Both hooks also correctly use the `branchListQueryKey(repoPath)` / `currentBranchQueryKey(repoPath)` factories from `branchQueries.ts` as the second array element of the key tuple, so the invalidation actually reaches the right query in the cache (verified: `queryClient.invalidateQueries({ queryKey: [key, repoPath] })` matches a query registered with `queryKey: [key, repoPath]`).
- The integration test (`RepoTree.integration.test.tsx`) is well-designed for this scenario: it mocks only at the `useCreateBranch` boundary (where the test has no way to drive real git), keeps the real `CreateBranchDialog`, real `Dialog`, real `Button`, real `Input`, and real `useToast` mocks, and asserts the two properties that matter for the MA-1 fix: `toast.success` called exactly once and `onSwitchBranch` never called. The `userEvent.setup()` + `act()` pattern correctly handles the mutation's promise resolution.
- `handleClose` is now consistent across all dismiss paths: clicking Cancel (button is `disabled={isPending}`), pressing Escape (Base UI closes the root), or clicking the close trigger in shared `Dialog` (the integration test's `data-testid="dialog-close-trigger"`) all flow through `handleClose`, which now uniformly blocks while pending. The `data-testid="dialog-close-trigger"` pattern in the mock makes the test target explicit and doesn't require DOM-level Escape key simulation.
- `name.trim()` is now applied at both decision points (`handleSubmit` guard and `mutate` payload), and the test `trims surrounding whitespace from the name before mutate` (`CreateBranchDialog.test.tsx:185-210`) covers the edge case where the user pastes `  feature/x  ` into the field. The Create button uses `disabled={!name.trim()}` so an all-whitespace name keeps the button disabled — UI-level defense in depth.
- No regression of the existing branch-switch flow: `RepoTree.test.tsx` still verifies that clicking on a non-current branch calls `onSwitchBranch` with the correct name and that clicking on the current branch is a no-op (the `<button disabled={b.current}>` short-circuit). Both tests still pass.
- AGENTS.md style is preserved: `CreateBranchDialog` is an arrow function with `FC<CreateBranchDialogProps>`, the prop type is in `types.ts`, no `function` keyword, no enums, no new comments, handlers use the `handle` prefix (`handleClose`, `handleNameChange`, `handleSubmit`). `RepoTree.handleSwitchBranch` follows the same convention. `useCreateBranch` returns `UseCreateBranchResult` — a clean public type.

## Unverified Areas and Limitations

- The dialog was not exercised end-to-end in a real Electron BrowserWindow, for the same reason as review #1: Playwright MCP and Chrome DevTools MCP can only reach `http://localhost:5173/#/workspaces` (the empty-state workspace page) because the workspace store lives in the Electron main process and is not accessible from the browser-only renderer. The 7 dialog unit tests + the 2 RepoTree unit tests + the 4 `useCheckoutBranch` unit tests + the new 1-test integration suite together cover the component logic and the cross-feature wiring. The MA-1 chain is now verifiable via `RepoTree.integration.test.tsx`.
- `npm run build` succeeded but this review did not unpack the generated `out/renderer/index-*.js` bundle to confirm the new `CreateBranchDialog` code is present and not tree-shaken. Static analysis (TypeScript, lint, tests) already covers reachability, and the integration test mounts the real `CreateBranchDialog` so its imports are exercised.
- The repo scope file `AGENTS.md` and `docs/tasks/README.md` were modified in the working tree but are not in the task's file list. They were excluded from the review as out-of-scope per the reviewer's instructions.
- The integration test uses `vi.hoisted` for `mutateMock`, `toastSuccessMock`, `toastErrorMock` — this is the correct pattern for sharing mocks across the `vi.mock` factory (which is hoisted above imports) and the test body. Verified: the mock is reset in `beforeEach` and re-implemented to fire `options?.onSuccess?.()` synchronously, which matches the test's expectations.
- `MI-4` from review #1 (spinner test at mock level) was explicitly accepted by the author as sufficient for this task; the test continues to verify the wiring (`loading={isPending}` reaches the `Button` mock's `data-loading` attribute, `disabled={isPending}` reaches the `Input` mock). A separate test for the real shared `Button` spinner rendering is still absent but is unrelated to TASK-323 and outside this task's scope.
