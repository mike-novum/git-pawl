# Code Review: TASK-319 — Iteration 1

## Metadata

- Date: 2026-08-08 15:35
- Scope: TASK-319 — RepoTree: branch switching on click (working-tree diff against `HEAD`)
- Files reviewed:
  - `/Users/mikenovum/projects/git-pawl/src/entities/branch/model/useCheckoutBranch.ts` (new)
  - `/Users/mikenovum/projects/git-pawl/src/entities/branch/index.ts`
  - `/Users/mikenovum/projects/git-pawl/src/entities/branch/model/index.ts`
  - `/Users/mikenovum/projects/git-pawl/src/widgets/repo-tree/types.ts`
  - `/Users/mikenovum/projects/git-pawl/src/widgets/repo-tree/ui/RepoTree.tsx`
  - `/Users/mikenovum/projects/git-pawl/src/widgets/repo-tree/ui/RepoTree.test.tsx` (new)
  - `/Users/mikenovum/projects/git-pawl/src/pages/repository/ui/RepositoryPage.tsx`
- Excluded changes:
  - `AGENTS.md` (trailing-whitespace cleanup, unrelated)
  - `docs/tasks/README.md` (status row for roadmap-9, orthogonal)
  - `docs/tasks/TASK-320..326.md` (untracked sibling task plans, not in TASK-319 scope)
- Supporting files inspected for IPC contract verification:
  - `/Users/mikenovum/projects/git-pawl/electron/shared/schemas.ts`
  - `/Users/mikenovum/projects/git-pawl/electron/shared/handler.ts`
  - `/Users/mikenovum/projects/git-pawl/electron/preload/index.ts`
  - `/Users/mikenovum/projects/git-pawl/electron/main/services/git/checkout.ts`
  - `/Users/mikenovum/projects/git-pawl/electron/main/index.ts`
  - `/Users/mikenovum/projects/git-pawl/src/shared/api/ipc.ts`

## Verdict

`CHANGES_REQUIRED`

The implementation looks consistent with the task spec at the renderer/type layer and all static checks plus tests pass, but the end-to-end feature is broken by a confirmed IPC-contract mismatch between `electron/preload/index.ts` (`GitCheckoutArgs.target`) and `electron/shared/schemas.ts` (`gitCheckoutSchema.ref`). Because `useCheckoutBranch.ts` respects the preload type and forwards `target`, every click of a branch will be rejected by the main-process zod validator with `Invalid git:checkout payload: ref: Required`. The user will see the error toast and the working tree will not switch. This is a Critical blocker for the AC "Клик на ветку в RepoTree реально переключает (через `gitCheckout`)".

## Verification

| Check               | Status                          | Evidence                                                                                                                                                                                                                              |
| ------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run tsc`       | PASS                            | Exit code 0; both `tsconfig.json` and `electron/tsconfig.json` passed `tsc --noEmit` with no output.                                                                                                                                  |
| `npm run lint`      | PASS                            | Exit code 0; only pre-existing `react-refresh/only-export-components` warnings in shared/ui (not introduced by TASK-319).                                                                                                            |
| `npm run test`      | PASS                            | Exit code 0; 33 test files, 217 tests passed including the new `src/widgets/repo-tree/ui/RepoTree.test.tsx` (2 tests).                                                                                                                |
| `npm run build`     | SKIPPED                         | Not part of the mandatory reviewer set for this task; `tsc` and the Vite dev compile cover the same correctness checks.                                                                                                              |
| `npm run dev`       | PASS (limited)                  | Electron-vite started, main and preload bundles built cleanly, dev server bound to `http://localhost:5173/`, then the Electron app started. A pre-existing unrelated error from `git:rev-parse` (HEAD outside a git worktree) appeared in stderr; no crash from TASK-319 code paths. |
| Main screen         | SKIPPED                         | No workspace/repo is open in dev, so the `/repository/:id` route is not reachable for end-to-end click verification.                                                                                                                  |
| Playwright MCP      | SKIPPED                         | Not exercised — Electron app's renderer is not on a publicly reachable URL and the author noted the same limitation.                                                                                                                   |
| Chrome DevTools MCP | SKIPPED                         | Same reason — no running renderer page to attach to.                                                                                                                                                                                  |

Independent IPC-contract verification (not part of mandatory checks, performed to substantiate CR-1):

```text
$ npx tsx /tmp/verify_zod.ts
Success: false
Errors: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": ["ref"],
    "message": "Required"
  }
]
```

## Critical

### CR-1 — IPC contract mismatch breaks the entire feature end-to-end

- Location:
  - Author intent: `src/entities/branch/model/useCheckoutBranch.ts:24-32`
  - Preload contract: `electron/preload/index.ts:34` (`GitCheckoutArgs = { repoPath; target; create? }`)
  - Main validation contract: `electron/shared/schemas.ts:114-118` (`gitCheckoutSchema = { repoPath; ref; create? }`)
  - Main consumer: `electron/main/services/git/checkout.ts:10` (`gitArgs.push(args.ref)`)
  - IPC handler registration: `electron/main/index.ts:196` (`safeHandle(GIT_CHECKOUT, gitCheckoutSchema, ...)`)
- Confidence: high
- Failure scenario: any non-current branch is clicked in `RepoTree`. The mutation calls `gitCheckout({ repoPath, target: 'feature/auth', create: false })`. The preload forwards the payload unchanged over IPC. The main process runs `gitCheckoutSchema.safeParse(args)`; the schema requires `ref` and zod strips unknown keys by default, so `parsed.success === false`. `safeHandle` throws `Invalid git:checkout payload: ref: Required`, the IPC promise rejects, and the renderer's `onError` fires with the validation message. `useToast().error` renders "Не удалось переключить ветку feature/auth". The branch is never switched and no toast.success is shown. This contradicts AC1 ("Клик на ветку в RepoTree реально переключает") and AC3 ("После переключения обновляются...") because no git operation runs at all.
- Evidence:
  - `gitCheckoutSchema` in `electron/shared/schemas.ts:114-118` defines `ref: z.string()`.
  - `gitCheckoutSchema` is used in `electron/main/index.ts:196` via `safeHandle`, which in `electron/shared/handler.ts:20-23` throws on `parsed.success === false`.
  - `electron/main/services/git/checkout.ts:10` reads `args.ref`, confirming main reads only `ref`.
  - `electron/preload/index.ts:34` declares `GitCheckoutArgs` with `target`, which is the type imported by `src/shared/api/ipc.ts:19` and consumed by `useCheckoutBranch.ts:7,27-31`.
  - `useCheckoutBranch.ts:27-31` builds `{ repoPath, target: input.ref, create: false }` — the only field that satisfies the preload type.
  - Independent reproduction: `gitCheckoutSchema.safeParse({ repoPath: '/tmp/repo', target: 'main', create: false })` returns `Success: false` with `ref: Required` (see Verification table).
- Impact: the user-facing feature is non-functional. Every click on a non-current branch results in an error toast and no checkout. The current branch is correctly disabled, but the rest of the AC chain fails.
- Direction: align the three layers on a single field name. The cleanest fix is to make `electron/preload/index.ts:34` use `ref` to match the existing zod schema and the existing main-process service code (no main-side code change needed). Alternatively, change the zod schema field to `target` and update `checkout.ts` accordingly. The fix is out of TASK-319's stated scope, but the task explicitly says the goal is to make `gitCheckout` work — without alignment, the new code does not satisfy that goal and the task cannot be accepted as DONE. Whichever name is chosen, also update the new `CheckoutBranchInput` shape so it matches the chosen field name and the `target → ref` indirection in `invokeCheckout` disappears.
- Fix verification: (1) after the alignment, run `gitCheckoutSchema.safeParse({ repoPath, ref: 'feature/auth', create: false })` and confirm `Success: true`; (2) the same with `{ repoPath, target: 'feature/auth', create: false }` and confirm `Success: false` (or true if the schema is the side changed); (3) re-run `npm test` (217/217); (4) in a real workspace with multiple branches, click a non-current branch and confirm `git rev-parse --abbrev-ref HEAD` returns the new branch name.

## Major

No confirmed Major findings.

## Minor

### MI-1 — Tests do not cover the `useCheckoutBranch` mutation or the IPC payload shape

- Location: `src/widgets/repo-tree/ui/RepoTree.test.tsx:10-17`
- Confidence: medium
- Failure scenario: a future refactor that breaks the wiring between the prop callback, the mutation, or the payload shape (`{ repoPath, ref }` or the resolved `{ repoPath, target, create }`) is not detected by the new tests. Combined with CR-1, this is precisely how the end-to-end breakage slipped through review.
- Evidence: the new test file only asserts that the widget propagates the `onSwitchBranch` prop on click and that the current branch button is `disabled`. It mocks `useCheckoutBranch` to return `{ mutate: vi.fn(), isPending: false }`, so neither the mutation input, the IPC payload, nor the toast feedback are exercised. The author acknowledged this limitation in the task notes ("`useCheckoutBranch` замокан в тесте ... минимально, потому что сам тест проверяет именно проброс колбэка").
- Impact: low-severity on its own, but it is the proximate reason CR-1 was not caught by the author.
- Direction: add at least one test that mounts `RepositoryPage` (or directly the hook) with a stubbed `gitCheckout` and asserts the payload sent to the IPC layer includes the branch name. Also assert that `gitCheckoutSchema` accepts the payload shape the hook produces — that single zod check would have caught CR-1.
- Fix verification: `npm test` shows new tests for the hook payload passing, and a regression test would fail on the current code with CR-1 unfixed.

### MI-2 — Unused mocks and imports in the new test

- Location: `src/widgets/repo-tree/ui/RepoTree.test.tsx:12, 27-29`
- Confidence: low
- Failure scenario: harmless today, but adds noise and increases the chance of a stale mock hiding a real regression (e.g., if `RepoTree` starts using `useCurrentBranch`).
- Evidence: `vi.mock('@/entities/branch', ...)` includes `useCurrentBranch`; `RepoTree.tsx` only uses `useBranches`. The cast `useBranches as unknown as ReturnType<typeof vi.fn>` is also unnecessary because `vi.mock` already provides a typed mock function — the cast is repeated three times and would be flagged by stricter lint configs.
- Impact: maintainability only.
- Direction: drop the unused `useCurrentBranch` mock; remove the `as unknown as ReturnType<typeof vi.fn>` casts or use the `mocked()` helper from `vitest` instead.
- Fix verification: `npm run lint` and `npm run test` still pass after cleanup.

### MI-3 — No defensive handling for detached HEAD state in the widget

- Location: `src/widgets/repo-tree/ui/RepoTree.tsx:62`
- Confidence: low
- Failure scenario: in a detached-HEAD repository, `git branch --list` returns no branch with `current: true`. The widget still renders all branches; clicking any of them switches correctly via the new mutation (assuming CR-1 is fixed). The `disabled` flag then has no effect on the current branch, but `useCurrentBranch` returns `name: null` and `RepoTree` has no awareness of that state. This is not a regression — it was the pre-existing behaviour — but the new code path was a natural place to consider whether the widget should disable all rows or show a "detached" marker.
- Evidence: `RepoTree.tsx` does not consume `useCurrentBranch`. The branch list in `branchApi.ts` does not include the detached state.
- Impact: UX only.
- Direction: out of TASK-319 scope. Note for a future task that introduces detached-aware UI.
- Fix verification: N/A (no change required for this task).

## Questions for Author

Нет.

## Positive Notes

- Public API of `entities/branch` is updated symmetrically in both `index.ts` and `model/index.ts`; types are re-exported alongside the runtime values.
- `useCheckoutBranch` invalidates exactly the query keys produced by `branchQueries.ts` (`current-branch`, `branch-list`, `branch-mainlines`) and the ad-hoc `git-log` key used by `RepositoryPage`. The invalidation contract is consistent.
- `RepoTree.test.tsx` covers both AC items the task explicitly asked for (click invokes `onSwitchBranch`; current branch is `disabled`).
- Toast messages are user-facing strings in Russian, matching the existing UI copy in this slice.
- `displayName` is set on the two FC components, which avoids the React DevTools "Anonymous" noise and aligns with AGENTS.md's FC preference.

## Unverified Areas and Limitations

- Could not drive the full click→checkout flow in a live Electron window: there is no workspace with a multi-branch repository open in the dev environment, and the dev-server stderr surfaced a pre-existing `git:rev-parse` failure unrelated to TASK-319. As a result, the runtime toast/branch-switch path was not observed; CR-1 is substantiated by code analysis plus an independent zod reproduction, not by a live renderer session.
- Playwright MCP and Chrome DevTools MCP were not exercised because the Electron renderer is not attached to a publicly reachable URL.
- Whether the existing `Console.warn` fallback in `RepoTree.tsx:48-51` ever triggers in production was not verified — `RepositoryPage` always passes the callback today, so this is theoretical.
- The other unrelated diffs in `AGENTS.md`, `docs/tasks/README.md`, and the untracked `TASK-320..326.md` files were excluded from the scope and were not reviewed for content.
