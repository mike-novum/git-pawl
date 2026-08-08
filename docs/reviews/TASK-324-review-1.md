# Code Review: TASK-324 — Iteration 1

## Metadata

- Date: 2026-08-08 18:58
- Scope: TASK-324 working-tree diff against HEAD (`main`, 6 commits ahead of origin)
- Files reviewed:
  - `electron/shared/ipc-channels.ts`
  - `electron/shared/schemas.ts`
  - `electron/preload/index.ts`
  - `electron/main/index.ts`
  - `electron/main/services/git/index.ts`
  - `electron/main/services/git/parser.ts`
  - `electron/main/services/git/index.test.ts`
  - `electron/main/services/git/parser.test.ts`
  - `src/entities/file-change/api/fileChangeApi.ts`
  - `src/entities/file-change/api/index.ts`
  - `src/entities/file-change/index.ts`
  - `src/entities/file-change/model/fileChangeQueries.ts`
  - `src/entities/file-change/model/index.ts`
  - `src/entities/file-change/model/useCommitFiles.ts` (new)
  - `src/shared/api/ipc.ts`
  - `src/shared/api/index.ts`
  - `src/widgets/repo-graph-vertical/types.ts`
  - `src/widgets/repo-detail-panel/types.ts`
  - `src/widgets/repo-detail-panel/ui/RepoDetailPanel.tsx`
  - `src/widgets/repo-detail-panel/ui/RepoDetailPanel.test.tsx` (new)
  - `src/pages/repository/ui/RepositoryPage.tsx`
- Excluded changes: `AGENTS.md` (whitespace only), `docs/tasks/README.md` (task tracking), untracked `docs/tasks/TASK-326.md` and `docs/tasks/TASK-325.md` (separate tasks)

## Verdict

`APPROVED_WITH_FOLLOWUPS`

All seven acceptance criteria are satisfied with verifiable evidence: the IPC pipeline for `gitShow` is wired end-to-end through `safeHandle`, `invoke`, `safeInvoke`, and the new `useCommitFiles` hook; the parser handles M/A/D/R/C correctly with tab+null guards; the `RepoDetailPanel` decomposes into three branches (null / uncommitted / normal commit); `<CommitMessageForm>` is wrapped in a `<footer className="max-h-[250px] overflow-auto">` that enforces the 250px ceiling; the file list uses `<ScrollAreaRoot>` so it scrolls inside the available area; the stash button is gone; `tsc`, `lint`, `test` (267/267), and `build` all pass; `npm run dev` serves the renderer and the workspaces empty-state page loads without console errors. The author explicitly disclosed two design choices in the task notes (single `workTree` code on commit files; dropping `message.body`/`footer` when forwarding the form). Four Minor findings remain — none block the task's scope.

## Verification

| Check               | Status | Evidence |
| ------------------- | ------ | -------- |
| `npm run tsc`       | PASS   | exit 0; no diagnostics from `tsc --noEmit -p tsconfig.json && tsc --noEmit -p electron/tsconfig.json` |
| `npm run lint`      | PASS   | exit 0; 0 errors, 7 pre-existing `react-refresh/only-export-components` warnings in `src/shared/ui/{button,dialog,input,tabs,toast}` (unchanged, unrelated) |
| `npm test`          | PASS   | exit 0; 40 files / 267 tests in 3.50s. `electron/main/services/git/parser.test.ts` 4 new `parseShowNameStatus` tests pass; `electron/main/services/git/index.test.ts` 3 new `gitShow` tests pass; `src/widgets/repo-detail-panel/ui/RepoDetailPanel.test.tsx` 4 new tests pass. 1 stderr `Warning: An update to ScrollAreaRoot inside a test was not wrapped in act(...)` (see MI-3) |
| `npm run build`     | PASS   | exit 0; `electron-vite build` produced `out/main/index.mjs` 70.40 kB, `out/preload/index.js` 2.93 kB, `out/renderer/{index.html,assets/*}` |
| `npm run dev`       | PASS   | `electron-vite dev` started, renderer served at `http://localhost:5173/`. The single `git:rev-parse` error in the main-process log is for `/Users/mikenovum/git/personal/gitlab-mcp` (an unrelated local repo with no commits) and is not caused by this task |
| Main screen         | PASS   | Playwright MCP `browser_navigate('http://localhost:5173/')` lands on `/#/workspaces` showing the "Create your first workspace" empty state with no console errors |
| Playwright MCP      | SKIPPED | Same limitation noted in TASK-323 review: the repository page (`/repos/...`) is only reachable after a workspace is loaded from `electron-store` via `fsWorkspaceList`, which is not exposed in the browser-only Playwright context. The 4 new `RepoDetailPanel.test.tsx` tests + the 4 new parser tests + the 3 new `gitShow` tests cover the affected logic at unit level |
| Chrome DevTools MCP | SKIPPED | Same limitation; console on the workspaces page shows only the 2 pre-existing React Router v7 future-flag warnings |

## Critical

Нет подтверждённых findings.

## Major

Нет подтверждённых findings.

## Minor

### MI-1 — `kind?: 'commit' \| 'uncommitted'` field is added to `CommitNode` but never read for branching

- Location: `src/widgets/repo-graph-vertical/types.ts:18`, `src/widgets/repo-detail-panel/ui/RepoDetailPanel.tsx:86`
- Confidence: medium
- Failure scenario: a future refactor adds a third `kind` value (e.g. `'merge'` or `'stash'`) or forgets to set `kind` on a newly created node. The runtime check still falls back to `commit.isUncommitted || commit.hash === UNCOMMITTED_HASH`, so the `kind` field silently lies about the node's category. The test fixtures (`RepoDetailPanel.test.tsx:80,102`) set `kind: 'commit'` / `kind: 'uncommitted'` only to satisfy the type, not to drive the rendering decision.
- Evidence: `grep -rn "\.kind\b" src/` returns only the type definition and the two test fixtures. `RepoDetailPanel.tsx:86` reads `commit.isUncommitted` and `commit.hash`, not `commit.kind`. The `toCommitNodes.ts:76-87` producer sets `isUncommitted: true` on the synthetic node but does not set `kind`.
- Impact: type-level contract mismatch. The `kind` discriminator is dead weight today; either the branch condition should migrate to `commit.kind === 'uncommitted'` or the field should be removed.
- Direction: pick one source of truth. Either replace the runtime check with `if (commit.kind === 'uncommitted')` and ensure `toCommitNodes` sets `kind: 'uncommitted'` on the synthetic node, or delete the field.
- Fix verification: `git grep -n "kind:" src/` shows only the definition; the runtime condition uses the chosen field.

### MI-2 — `handleFormCommit` discards `message.body` and `message.footer` from the form

- Location: `src/widgets/repo-detail-panel/ui/RepoDetailPanel.tsx:123-125`
- Confidence: medium
- Failure scenario: the user types a multi-paragraph commit message in the `CommitMessageForm` (header + body + footer), clicks Commit. The handler does `onCommit(message.header)`; the body and footer are silently dropped. The success toast shows only the header (`useCommit.ts:88-89`): "Commit created — feat: header". The user has no signal that the body/footer they typed were lost.
- Evidence: `RepoDetailPanel.tsx:123` destructures only `message.header`. `CommitMessageFormProps.onCommit: (message: CommitMessage) => void` (commit-message-form/types.ts:14) — the full object is available. The mock in `RepoDetailPanel.test.tsx:38-51` only sends `{ header }`, so no test catches the data loss.
- Impact: data loss for any user who relies on conventional-commit body/footer (Refs, BREAKING CHANGE, long descriptions). The acceptance criterion explicitly asks for `onCommit: (message: string) => void`, so this is in-scope per the spec — but the UX hazard is real.
- Direction: either (a) widen the panel prop to `onCommit: (message: CommitMessage) => void` and forward the full message, or (b) hide the body/footer fields when the form is rendered inside `RepoDetailPanel` (e.g. pass `showBody={false}`/`showFooter={false}` props to `CommitMessageForm`), so the user does not invest time typing content that will be discarded.
- Fix verification: typing "feat: x\n\nbody" in the form and clicking Commit results in `onCommit` being called with the full message (option a) or the body textarea is not rendered (option b).

### MI-3 — `RepoDetailPanel.test.tsx` triggers an `act(...)` warning on the normal-commit path

- Location: `src/widgets/repo-detail-panel/ui/RepoDetailPanel.test.tsx:116-128`
- Confidence: low
- Failure scenario: when the normal-commit branch renders `CommitView`, the Base UI `ScrollAreaRoot` fires a state update after `render` returns, producing a stderr warning. The test still passes (4/4 green), and there is no functional defect, but the warning makes CI logs noisy and can mask real `act` violations introduced later.
- Evidence: vitest output line `stderr | src/widgets/repo-detail-panel/ui/RepoDetailPanel.test.tsx > RepoDetailPanel > renders commit info and footer actions for a normal commit` followed by `Warning: An update to ScrollAreaRoot inside a test was not wrapped in act(...)`. The other three tests in the file do not trigger the warning because they render `UncommittedView` (no `ScrollAreaRoot`) or the placeholder (no scroll area). No existing test in the repo wraps a Base UI scroll area in `act`, so this is not a regression of a previous state — but neither is there a pattern to copy.
- Impact: test hygiene only. No correctness risk today; future test additions that touch the scroll area will inherit the noise.
- Direction: wrap the `render` call in `await act(async () => ...)` and switch the synchronous `screen.getByText(...)` calls to `await screen.findByText(...)` for the affected test, or extract `CommitView` into a smaller component and test it without the scroll area.
- Fix verification: re-running `npm test -- src/widgets/repo-detail-panel` produces zero stderr lines for this file.

### MI-4 — Inline `onClick={() => onXxx(commit.hash)}` handlers in `CommitView` bypass the `handle` prefix convention

- Location: `src/widgets/repo-detail-panel/ui/RepoDetailPanel.tsx:196, 242, 250, 258, 266`
- Confidence: low
- Failure scenario: style inconsistency. AGENTS.md states "Функции обработки кликов - называть с префиксом `handle`". The same file's `UncommittedView` follows the rule (`handleFormCommit` at line 123), but the five footer buttons in `CommitView` use inline arrow functions directly in JSX. The pattern is otherwise consistent across the codebase (`RepositoryPage.tsx:100, 111, 115` uses `handleCopyHash`, `handleSwitchBranch`, `handleCommit`).
- Evidence: `grep -nE "onClick=\\{\\(\\) =>" src/widgets/repo-detail-panel/ui/RepoDetailPanel.tsx` shows 5 inline handlers; the named-handler convention is used in `UncommittedView` and in `RepositoryPage.tsx`.
- Impact: minor style consistency. No functional or behavioral impact.
- Direction: extract to named handlers inside `CommitView` (`handleCopyHashClick`, `handleCreatePatchClick`, `handleCherryPickClick`, `handleRevertClick`, `handleResetToHereClick`) and pass them as `onClick={handleCopyHashClick}`. Or, since each handler is a one-liner that just calls a prop, argue that the inline form is acceptable and add a comment to AGENTS.md clarifying that inline event adapters for forwarded callbacks are exempt.
- Fix verification: `grep -nE "const handle[A-Z]" src/widgets/repo-detail-panel/ui/RepoDetailPanel.tsx` returns 6+ handlers (current `handleFormCommit` plus 5 new ones); the JSX `onClick` lines no longer contain arrow functions.

## Questions for Author

Нет.

## Positive Notes

- IPC pipeline is end-to-end consistent: `IPC_CHANNELS.GIT_SHOW = 'git:show'` (`electron/shared/ipc-channels.ts:11`) → `gitShowSchema = z.object({ repoPath: z.string(), commit: z.string().min(1) })` (`electron/shared/schemas.ts:37-40`) → `safeHandle(IPC_CHANNELS.GIT_SHOW, gitShowSchema, ...)` (`electron/main/index.ts:177`) → `gitShow: (args) => invoke('git:show', args) as Promise<FileStatus[]>` (`electron/preload/index.ts:69, 130`) → `gitShow(args)` in shared API (`src/shared/api/ipc.ts:103-104`) → `listCommitFiles` (`src/entities/file-change/api/fileChangeApi.ts:90-115`) → `useCommitFiles` (`src/entities/file-change/model/useCommitFiles.ts`). Each boundary type-matches its neighbour.
- `parseShowNameStatus` correctly handles the four real `--name-status` shapes: `M\tpath` (modified/added/deleted), `R100\told\tnew` (renamed with score), `C100\told\tnew` (copied with score), and bare `T\tpath` (type change). The `(\d*)` group captures optional rename scores and falls back to empty for the no-score case. The `isFileStatusCode` guard from `parseStatusPorcelain` is reused as a single source of truth for valid status codes. Tests at `electron/main/services/git/parser.test.ts:367-408` cover each shape plus the blank-line and unknown-code branches.
- `useCommitFiles` correctly uses TanStack Query's disabled pattern: `queryKey` is a sentinel `['commit-files', 'disabled']` constant when `repoPath || commitHash` is null, and `enabled` short-circuits to `false`. This avoids the "request fires with undefined" footgun. Verified by reading `useCommitFiles.ts:8-22` and the parallel pattern in `useFileChanges.ts:8-18`.
- `RepoDetailPanel` cleanly separates three rendering branches via the existing `Empty` shared component (`/Users/mikenovum/projects/git-pawl/src/shared/ui/empty/Empty.tsx`). The `commit === null` branch reuses `<Empty title="Select a commit">`, the `files.length === 0` branch reuses `<Empty title="No files">`, and the `isError` branch reuses `<Empty title="Failed to load files">`. No bespoke empty-state markup was added — FSD respected, shared UI-kit reused.
- AGENTS.md style is followed throughout the new code: `RepoDetailPanel`, `UncommittedView`, `CommitView`, `CommitFilesList` are all arrow-function `FC<Props>` components. `useCommitFiles` and `fetchCommitFiles` are arrow functions. The `gitShow`, `listCommitFiles`, `parseShowNameStatus`, `commitFilesQueryKey`, and `fetchCommitFiles` exports are all camelCase. The `RepoDetailPanelProps` type is in `src/widgets/repo-detail-panel/types.ts`, separate from the component file. No enums, no `function` keyword, no unsolicited comments.
- The `<CommitMessageForm>` container is a `<footer className="max-h-[250px] shrink-0 overflow-auto border-t p-3">` (`RepoDetailPanel.tsx:145`) which caps the visible area at 250px and lets the inner form scroll if its natural height exceeds the cap. This satisfies the "не более 250px" requirement without disabling the body/footer fields that the user might want to fill in (acknowledged caveat noted in MI-2).
- `gitShow` uses `child_process.spawn` via `execGit(gitArgs, ...)` (`electron/main/services/git/index.ts:130`), which is array-based and shell-injection-safe by construction. The commit hash is a free-form string from the renderer, but it is passed as an array element, never interpolated into a shell command.
- Three distinct test layers cover the change: parser unit tests (`parseShowNameStatus` shape coverage), service unit tests (`gitShow` flag construction + happy path + error wrapping), and component unit tests (`RepoDetailPanel` rendering branches). 11 new tests in total (4 + 3 + 4), all green.

## Unverified Areas and Limitations

- The visual flow "click a commit in the graph → see file list on the right" / "click Uncommitted changes → see file changes panel + commit form" could not be exercised end-to-end in a real Electron BrowserWindow. The dev server's renderer (`http://localhost:5173/#/workspaces`) only renders the empty workspace state because the workspace list is sourced from `electron-store` via `fsWorkspaceList` IPC, which the browser-only Playwright context cannot reach. The 4 `RepoDetailPanel.test.tsx` tests verify the same rendering branches at the React tree level with mocked `useCommitFiles`, `FileChangesPanel`, and `CommitMessageForm`; the 3 `gitShow` tests verify the IPC command construction; the 4 `parseShowNameStatus` tests verify the parser. Together these cover the wiring, but no automated check confirms the visual layout (file list scrolls inside the 384px panel, footer cap at 250px, etc.) — that remains a manual verification step.
- The "Stash button removed" criterion was verified by absence in the new `RepoDetailPanel.tsx` (no reference to `stash`, `Stash`, or `onStash` in the file), but the task did not require a search across the codebase for orphan imports of the now-removed props. Manual inspection shows no `onStash` or `onDiscard` references remain in the page or panel; if a third-party consumer was expected to pass these, this task would silently drop them.
- The `kind?: 'commit' | 'uncommitted'` field added per the task instructions is set in test fixtures but not in `toCommitNodes.ts` (the producer) and is not read by `RepoDetailPanel.tsx` (the consumer). The runtime branch condition still uses `isUncommitted`/`hash === 'UNCOMMITTED'`. See MI-1 for the proposed fix.
- The dev server's `git:rev-parse` error in the log targets `/Users/mikenovum/git/personal/gitlab-mcp` — a real local repo on the reviewer's machine that has no commits yet. This is unrelated to TASK-324 and would be reproduced by any review run that opens the same path through the sidebar's "Recent repos" cache.
- The 7 pre-existing `react-refresh/only-export-components` lint warnings in `src/shared/ui/{button,dialog,input,tabs,toast}` were observed before this task and remain unchanged. They are flagged for awareness only.