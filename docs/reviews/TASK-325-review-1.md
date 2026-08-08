# Code Review: TASK-325 — Iteration 1

## Metadata

- Date: 2026-08-08 18:35
- Scope: working-tree diff against HEAD, focused on TASK-325 (Uncommited changes node in commit graph)
- Files reviewed:
  - `src/widgets/repo-graph-vertical/types.ts`
  - `src/pages/repository/lib/toCommitNodes.ts`
  - `src/widgets/repo-graph-vertical/lib/computeLayout.ts`
  - `src/widgets/repo-graph-vertical/ui/CommitRow.tsx`
  - `src/pages/repository/ui/RepositoryPage.tsx`
  - `src/widgets/repo-graph-vertical/lib/computeLayout.test.ts`
  - `src/widgets/repo-graph-vertical/ui/RepoGraphTable.test.tsx`
- Excluded changes: `AGENTS.md` (trivial newline cleanup), `docs/tasks/README.md` (status table), `docs/tasks/TASK-324.md`, `docs/tasks/TASK-326.md` (untracked task stubs for other tasks, no overlap with TASK-325 scope)

## Verdict

`APPROVED_WITH_FOLLOWUPS`

The implementation adds the virtual `Uncommited changes` row in the correct slice (`pages/repository/lib/toCommitNodes.ts`) and threads `isDirty` from `RepositoryPage` via the existing `useRepository` hook. `computeLayout` correctly bypasses lane-color logic for the uncommitted commit (node fill, parent edge color and `continuousLines` color are all derived from `commit.color ?? 'var(--color-muted-foreground)'`), and the lane-assignment algorithm still places the uncommitted node on lane 0 with its `parents: [headHash]` always resolving `head` to lane 0 as well (because `parentIdx === 0` ⇒ `pLane = cLane`), so the visual link from `UNCOMMITTED` to HEAD is consistently drawn as a muted-foreground `continuousLines` segment. `CommitRow` short-circuits before rendering branch/tag chips or author/date cells for `isUncommitted` rows, leaving `------` in the commit column and an `AlertCircle` icon + `Uncommited changes` text in the description column. Static checks (`tsc`, `lint`, `test`, `build`) all pass on the full repo (`256 / 256` tests, `39 / 39` files). Dev server boots without errors and the renderer mounts the workspace page with zero runtime errors. The five follow-ups below are cosmetic, contract, or future-task concerns — none blocks the feature.

## Verification

| Check               | Status | Evidence |
| ------------------- | ------ | -------- |
| `npm run tsc`       | PASS   | exit 0; renderer + electron tsconfig both clean |
| `npm run lint`      | PASS   | exit 0; 0 errors, 7 pre-existing `react-refresh/only-export-components` warnings in `src/shared/ui/{button,dialog,input,tabs,toast}` (unrelated to TASK-325) |
| `npm test`          | PASS   | exit 0; 256 tests across 39 files passed in 3.34s. `computeLayout.test.ts` 17/17 (was 15, +2 uncommitted cases), `RepoGraphTable.test.tsx` 13/13 (was 12, +1 uncommitted case). All other graph-widget tests still green (TASK-322 hover scale regression unchanged) |
| `npm run build`     | PASS   | exit 0; renderer bundle `1.37 MB`, `index.html 0.57 kB`, no warnings. `build:icon` skipped ("Icons are up to date") |
| `npm run dev`       | PASS   | electron-vite started on `http://localhost:5173/`; renderer loaded the workspaces page successfully |
| Main screen         | PASS   | Snapshot shows "Create your first workspace" page; zero `console.error` messages |
| Playwright MCP      | SKIPPED | The repository page that hosts the graph is reached only after the user creates a workspace via the native folder picker (Electron-only). Chrome DevTools MCP cannot drive the Electron BrowserWindow from outside the process, and adding a workspace + dirty repo fixture end-to-end is out of scope for the review. Static + jsdom tests cover the rendering rules |
| Chrome DevTools MCP | PASS (limited) | Connected to the Vite renderer at `http://localhost:5173/#/workspaces`; no console errors. The two React-Router future-flag warnings from earlier tasks are still present but unrelated |

## Critical

Нет подтверждённых findings.

## Major

Нет подтверждённых findings.

## Minor

### MI-1 — Typo "Uncommited" (one `t`) is used as the visible user-facing label while the `aria-label` uses the correctly spelled "Uncommitted"

- Location: `src/widgets/repo-graph-vertical/ui/CommitRow.tsx:47` (`aria-label="Uncommitted changes"`), `src/widgets/repo-graph-vertical/ui/CommitRow.tsx:77,79` (visible `<span>` text and `title` attribute — both use the misspelled `Uncommited changes`), `src/pages/repository/lib/toCommitNodes.ts:79` (`subject: 'Uncommited changes'`), `src/widgets/repo-graph-vertical/lib/computeLayout.test.ts:36,392`, `src/widgets/repo-graph-vertical/ui/RepoGraphTable.test.tsx:299,320`
- Confidence: high
- Failure scenario: the visible label and the `title` tooltip both read `Uncommited changes` (one `t`), while the screen-reader `aria-label` says `Uncommitted changes` (two `t`s). Users with assistive tech hear the correctly spelled string but everyone else sees the misspelling, which is also propagated into the `RepoDetailPanel` (`commit.subject`) and TASK-324's pending `<h2>Uncommited changes</h2>` plan. The two test assertions in `computeLayout.test.ts:392` and `RepoGraphTable.test.tsx:320` cement the typo as the source-of-truth spelling.
- Evidence: `grep -n "Uncommited\|Uncommitted"` over the four changed files confirms the inconsistency. The TASK-325 plan itself uses the misspelled form, so the implementation matches the spec literally — but the spec is wrong, and the diff propagates it.
- Impact: cosmetic / brand quality; accessibility users get a different label than sighted users; the misspelled label will appear in the commit-detail panel and (per TASK-324 plan) in a future `<h2>`.
- Direction: pick one spelling — `"Uncommitted changes"` is correct English — and use it everywhere: `subject`, `title`, `aria-label`, panel heading, tests.
- Fix verification: `grep -n "Uncommited" src/` returns zero hits; `npm test` stays green after updating the two test assertions.

### MI-2 — `commit.timestamp: Date.now()` makes the virtual node non-deterministic and forces `commitLayout` to recompute on every status change

- Location: `src/pages/repository/lib/toCommitNodes.ts:82`
- Confidence: medium
- Failure scenario: `toCommitNodes` is wrapped in `useMemo(..., [branches, branchQuery.data, logQuery.data, repo?.status, tags])` in `RepositoryPage.tsx:51-63`. `Date.now()` returns a fresh number on every invocation, so when `repo?.status` flips between `'dirty'` and `'clean'` (every `refetchInterval: 30_000` cycle of `useRepositoryStatus`) the new uncommitted node has a different `timestamp`, which makes the `commits` array reference change, which makes `useMemo(..., [commits])` for `commitLayout` recompute a full `computeLayout(commits)` even though the layout depends on graph topology only — not on timestamps.
- Evidence: `src/pages/repository/lib/toCommitNodes.ts:82` hard-codes `timestamp: Date.now()`; `src/pages/repository/model/useRepository.ts:60-63` configures `useRepositorySize` (sibling of `useRepositoryStatus`) with `refetchInterval: 30_000` — the same store backs `useRepository`, so the status can flip without the user acting.
- Impact: extra React/algorithm work on a 30s cadence when the repo is dirty; no correctness bug, but the layout itself never changes.
- Direction: pick a stable timestamp source — e.g. `logQuery.data?.[0]?.date ?? 0` (the HEAD commit's date) — or omit `timestamp` entirely (the row UI only renders it for normal commits and the uncommitted cell is empty anyway).
- Fix verification: with the dev server running and a dirty repo, navigate to `/repo/:id` and watch the React profiler / commit count over a 60s window — it should be flat.

### MI-3 — `lane: 0` is hard-coded on the uncommitted node and is silently overwritten by `computeLayout`

- Location: `src/pages/repository/lib/toCommitNodes.ts:84` (`lane: 0`), `src/widgets/repo-graph-vertical/lib/computeLayout.ts:196` (`const lane = laneByHash.get(commit.hash) ?? 0;`)
- Confidence: low
- Failure scenario: the value `lane: 0` in the uncommitted literal is meaningless — `computeLayout` recomputes `lane` from `laneByHash` and writes it back into `commit.lane`. The hard-coded `0` suggests the author expects lane assignment to be a no-op for the uncommitted node (it isn't — it goes through the full `findFreeLaneIndex` path), which could mislead a future reader.
- Evidence: `computeLayout.ts:196` (`const lane = laneByHash.get(commit.hash) ?? 0;`) overrides any input; `computeLayout.ts:219-220` spreads the recomputed value back into `commit: { ...commit, lane, color: nodeColor }`.
- Impact: readability only. No runtime bug.
- Direction: drop `lane: 0` from the uncommitted literal — `lane` is optional-ish in `CommitNode` (always overridden) and its absence makes the override obvious.
- Fix verification: code reads more clearly; `npm run tsc` and `npm test` stay green.

### MI-4 — `UNCOMMITTED_HASH` constant is exported but never consumed outside the file

- Location: `src/pages/repository/lib/toCommitNodes.ts:9`
- Confidence: low
- Failure scenario: `export const UNCOMMITTED_HASH = 'UNCOMMITTED'` is declared and used only inside the same file. No other file in `src/` or `electron/` imports it (verified via `grep -rn "UNCOMMITTED_HASH" src/`). TASK-324's pending plan says the panel will check `commit.hash === 'UNCOMMITTED'`, so an outside consumer is plausible — but until that work lands, the export is dead surface area.
- Evidence: `grep -rn "UNCOMMITTED_HASH" src/` returns two hits in `toCommitNodes.ts` only.
- Impact: minor public-API noise on the page slice. Not a bug.
- Direction: keep `UNCOMMITTED_HASH` if TASK-324 will reference it (the plan does mention the literal `'UNCOMMITTED'`); otherwise drop the `export` keyword. Worth coordinating with the TASK-324 author.
- Fix verification: `grep -rn "UNCOMMITTED_HASH" src/` either returns consumers in TASK-324's diff, or returns only the local declaration.

### MI-5 — `RepoGraphTable` test asserts "no chips" by absence rather than by filtering

- Location: `src/widgets/repo-graph-vertical/ui/RepoGraphTable.test.tsx:294-324`
- Confidence: medium
- Failure scenario: the new test sets `branches` / `tags` / `authorEmail` only on the regular commit, not on the UNCOMMITTED node. The assertion `screen.queryByTitle('Branch: main')).not.toBeInTheDocument()` passes because `main` is on `aaaaaaaa`, but `aaaaaaaa` is at row 1 (the regular commit) — the chips question is whether the UNCOMMITTED row at row 0 filters its own `branches`/`tags` data. The current test would also pass if the early-return in `CommitRow.tsx:43` were deleted and the uncommitted node were simply given empty chips data.
- Evidence: the test fixture has `branches: undefined` (via the `createCommit` helper) on the UNCOMMITTED node, so no chips would render even without the `if (commit.isUncommitted)` guard. The existing TASK-318 tests at lines 199-217 do the opposite — set `['feature-x']` on a regular commit and assert the chip — which is the correct contract test.
- Impact: the test does not actually prove the new behavior. A future refactor that drops the `isUncommitted` short-circuit in `CommitRow` would silently break the feature while keeping this test green.
- Direction: extend the UNCOMMITTED literal in the test with `branches: ['main']`, `tags: ['v1']`, `author: 'someone'`, `authorEmail: 'someone@example.com'`, then assert that `Branch: main` and `Tag: v1` are not in the document while `Uncommited changes` is. Optionally render the whole table and query specifically for chips rendered inside the UNCOMMITTED `<tr>`.
- Fix verification: `npm test src/widgets/repo-graph-vertical/ui/RepoGraphTable.test.tsx` stays green; a hypothetical regression that drops the `isUncommitted` guard now fails this test.

### MI-6 — `computeLayout.test.ts` does not end with a newline (POSIX / prettier convention)

- Location: `src/widgets/repo-graph-vertical/lib/computeLayout.test.ts` (last 5 bytes: `;   }   )   ;`, no `\n`)
- Confidence: low
- Failure scenario: `RepoGraphTable.test.tsx` ends with `});\n`, but `computeLayout.test.ts` ends with `});` — the diff comment `\ No newline at end of file` is present for `computeLayout.test.ts`. Many POSIX tools and linters (`prettier` with `--check`, some CI checks) flag missing trailing newlines.
- Evidence: `tail -c 5` on both files shows the difference; `git diff` displays the `\ No newline at end of file` marker.
- Impact: cosmetic / convention only. Some CI setups would fail.
- Direction: append a single `\n` to the file (or run the project's prettier with `--write`).
- Fix verification: `tail -c 1` returns `\n`; `npm test` stays green.

### MI-7 — TASK-324 plan expects `commit.kind === 'uncommitted'`, but TASK-325 implements `commit.isUncommitted`

- Location: `docs/tasks/TASK-324.md` (lines 30, 49), `src/widgets/repo-graph-vertical/types.ts:17`
- Confidence: medium
- Failure scenario: TASK-324's plan adds `kind?: 'commit' | 'uncommitted'` and tells the panel to branch on `commit.kind === 'uncommitted'`. TASK-325 chose `isUncommitted?: boolean` instead. The TASK-324 plan's fallback clause "`commit?.kind === 'uncommitted'` (or `hash === 'UNCOMMITTED'`)" keeps the work unblocked, but the two implementations are now divergent and a future reader has to reconcile.
- Evidence: `grep -rn "kind.*'uncommitted'" docs/` returns the TASK-324 plan; the type file adds `isUncommitted?`, not `kind?`. TASK-324 is still `⏳ pending`.
- Impact: small coordination risk between the two tasks. The TASK-325 reviewer cannot fix this — only the TASK-324 author can pick a convention.
- Direction: when implementing TASK-324, prefer `commit.isUncommitted` (already shipped by TASK-325) over introducing `kind`. If `kind` is still wanted, add it as a parallel field at the same time.
- Fix verification: TASK-324 diff uses one consistent discriminator across the panel, the form, and the file-changes panel.

### MI-8 — `references` variable is computed for uncommitted rows but never used

- Location: `src/widgets/repo-graph-vertical/ui/CommitRow.tsx:38-41`
- Confidence: low
- Failure scenario: lines 38-41 build `references = [...tipBranches.map(...), ...(commit.tags ?? []).map(...)].join(', ')` unconditionally before the `if (commit.isUncommitted)` early return. For uncommitted rows `tipBranches` is `[]` (no `branches`) and `commit.tags` is undefined, so `references` is the empty string and the early return discards it.
- Evidence: `CommitRow.tsx:38-41` precedes `CommitRow.tsx:43-90`; the variable is not referenced anywhere inside the uncommitted `<tr>`.
- Impact: micro-perf only (one array allocation per render of an uncommitted row); readability mildly suffers.
- Direction: move `tipBranches` and `references` computation after the `if (commit.isUncommitted) return …` guard.
- Fix verification: `npm test` stays green; code reads top-to-bottom.

## Questions for Author

Нет.

## Positive Notes

- The implementation is contained: 5 source files touched, 2 test files extended, 0 new files. The uncommitted node is defined in the page slice (`pages/repository/lib/toCommitNodes.ts`) per page-first FSD guidance — it is not (yet) reused by any other slice, and lifting it into a widget would be premature.
- `computeLayout` is extended with the smallest possible diff: three conditional expressions (`parentEdges`, `parents[]`, `nodeColor`) plus one `continuousLines` color gate that already covers the "HEAD ends up on lane 0 next to UNCOMMITTED" layout reality (verified by reading the algorithm end-to-end).
- The new test in `computeLayout.test.ts:395-422` is the right level — it searches both `parentEdges` and `continuousLines` for the row-0 → row-1 segment, which is robust to the lane-assignment choice. The new test in `RepoGraphTable.test.tsx:294-324` confirms the row-level rendering contract.
- AGENTS.md style is fully respected: arrow-function components, `FC<Props>` typing, `types.ts` neighbour for the new `isUncommitted` field, no comments, no enums, no `function` keyword, no new JSDoc. The `handle*` prefix is not used because there are no event handlers added at the page level — `toCommitNodes` is a pure function.
- `var(--color-muted-foreground)` is defined in both `theme.css` (dark) and `light.css`, so the gray node and line render correctly in both themes without any conditional fallback.
- The early return for uncommitted rows in `CommitRow.tsx:43-90` correctly skips the `branchTips` filter, the `tags` map, the `author`/`authorEmail` span and the `<time dateTime={...}>` element — exactly what the task spec required ("Остальные колонки пустые").
- The implementation did not touch the existing `graphOverlay` plumbing, the `GraphLayer` hover-scale (TASK-322 regression), the `branchTips` map, or any of the lane-assignment core logic. The diff is additive in spirit.
- The `useMemo` dependency array in `RepositoryPage.tsx:62` correctly adds `repo?.status` so the uncommitted row appears/disappears in lockstep with `useRepositoryStatus` polls.

## Unverified Areas and Limitations

- The uncommitted row was not observed end-to-end inside the real Electron BrowserWindow. The dev server was reached and the workspace page was loaded with zero console errors, but navigating to a repository requires the native folder picker (Electron-only) and then setting up a workspace + dirty repo fixture. The jsdom tests for `computeLayout`, `RepoGraphTable`, and the new branch/tag-chip assertion cover the rendering contract, but a real BrowserWindow smoke test (preferably with `_electron` Playwright) would confirm the `var(--color-muted-foreground)` actually paints gray rather than failing silently due to a CSS variable resolution miss. This is a tooling limitation, not a code-quality one.
- The merge-commit case (`head` is a merge with multiple parents) was traced by reading `computeLayout` but not exercised by a dedicated unit test. The trace shows it works: UNCOMMITTED at lane 0, `head` at lane 0 (because `parentIdx === 0` ⇒ `pLane = cLane`), other parents of `head` at higher lanes with normal `laneColor`. The added color gate covers both the `parentEdges` and `continuousLines` paths, so a regression here would only happen if lane assignment moved UNCOMMITTED off lane 0 — and the current test suite asserts `lanes.map(...)` indirectly via the continuous-line search, which would fail if lanes shifted. Worth adding a focused merge+dirty test as part of MI-5's follow-up.
- `npm test` was not re-run with the new edge-case tests the reviewer could imagine (empty commits + dirty, octopus merge + dirty). The two new tests + the seven existing tests are sufficient for the AC but a fuller fixture table would harden the implementation.