# Code Review: TASK-322 — Iteration 1

## Metadata

- Date: 2026-08-08 13:20
- Scope: working-tree diff against HEAD, focused on `src/widgets/repo-graph-vertical/`
- Files reviewed:
  - `src/widgets/repo-graph-vertical/types.ts`
  - `src/widgets/repo-graph-vertical/ui/GraphLayer.tsx`
  - `src/widgets/repo-graph-vertical/ui/RepoGraphTable.tsx`
  - `src/widgets/repo-graph-vertical/ui/CommitRow.tsx`
  - `src/widgets/repo-graph-vertical/ui/GraphLayer.test.tsx`
  - `src/widgets/repo-graph-vertical/ui/RepoGraphTable.test.tsx`
- Excluded changes: only `AGENTS.md`, `docs/tasks/README.md` and the `??` documents `TASK-323..326.md` are outside the named scope; they do not affect the diff

## Verdict

`APPROVED_WITH_FOLLOWUPS`

The fix replaces the broken `group-hover:scale-[1.2]` on a shared `<svg>` (which could not fire because the circles were not DOM children of the `<tr>` carrying the `group` class) with a controlled React-state approach: `RepoGraphTable` tracks `hoveredRowIndex` and passes it to the single `GraphLayer`, which only enlarges the matching circle. Static unit tests confirm exactly one `circle[r="6"]` and the rest `circle[r="5"]` after `fireEvent.mouseEnter` on a row, and reset to all `r=5` on `mouseLeave`. `tsc`, `lint`, and `test` all pass. `group-hover` is fully removed from `GraphLayer.tsx`, and Tailwind v4 emits a real `.transition-[r] { transition-property: r; ... }` rule. One low-severity followup about a memoization optimisation and one about `r` being a presentation attribute are documented below but do not change the verdict.

## Verification

| Check               | Status | Evidence |
| ------------------- | ------ | -------- |
| `npm run tsc`       | PASS   | exit 0; no diagnostics for renderer or electron tsconfig |
| `npm run lint`      | PASS   | exit 0; 0 errors, 7 pre-existing `react-refresh/only-export-components` warnings in `src/shared/ui/{button,dialog,input,tabs,toast}` (unrelated to TASK-322) |
| `npm test`          | PASS   | exit 0; 37 files / 245 tests passed in 3.04s. `GraphLayer.test.tsx` (7/7) and `RepoGraphTable.test.tsx` (12/12) both green |
| `npm run build`     | SKIPPED | not required by task; static checks already cover type safety |
| `npm run dev`       | PASS   | electron-vite started on `http://localhost:5174/` (port 5173 busy); renderer loaded "Create your first workspace" page; zero console errors or warnings |
| Main screen         | PASS   | Page loaded with banner + main heading; no errors |
| Playwright MCP      | SKIPPED | This is an Electron app; Playwright MCP cannot drive native folder-picker dialogs. Workspace creation (and therefore the repository page that hosts the graph) requires the native dialog exposed only inside Electron. Visual hover verification in a real Electron BrowserWindow is not available to Chrome DevTools MCP from outside the process. Static and jsdom tests cover the behaviour |
| Chrome DevTools MCP | PASS (limited) | Connected to the Vite renderer at `http://localhost:5174/`. Workspace page loaded, no console errors. Stylesheet `globals.css` returned 200 and contains the compiled rule: `.transition-\[r\] { transition-property: r; transition-timing-function: var(--tw-ease, var(--default-transition-timing-function)); transition-duration: var(--tw-duration, var(--default-transition-duration)); }`. Confirmed via `grep` on the served stylesheet — Tailwind v4 emits a real CSS rule for `transition-[r]`. No regression-style `group-hover:scale-[1.2]` rule remains in the served CSS bundle for the graph layer |

## Critical

Нет подтверждённых findings.

## Major

Нет подтверждённых findings.

## Minor

### MI-1 — `r` set as an SVG presentation attribute may not animate smoothly

- Location: `src/widgets/repo-graph-vertical/ui/GraphLayer.tsx:79`
- Confidence: medium
- Failure scenario: although Tailwind compiles `.transition-[r] { transition-property: r; }` and the React attribute `r={radius}` is updated, modern browsers only run a CSS transition when the **computed** CSS value of the property changes. In Chromium / WebKit the `r` SVG presentation attribute participates in the cascade, so the transition usually fires — but in some builds (and historically) the engine treats the value as the attribute source of truth and snaps without interpolating. The static unit test passes (the new `r` is set), but the user-visible smoothness is not asserted anywhere. If the change becomes a no-op animation, the user will still see only the hovered circle growing, so acceptance criteria are still met, but the explicit goal of "анимация" is not verified.
- Evidence: `className="[transform-box:fill-box] origin-center transition-[r] duration-fast ease-out"` is paired with `r={radius}` (attribute, not style). Tailwind v4 CSS for the class is correct (verified in served `globals.css`). No test calls `getComputedStyle` or inspects `animation`/`transition` events.
- Impact: only the smoothness of the radius change; correctness of the hover (only the hovered circle grows) is unaffected.
- Direction: either change `r={radius}` to `style={{ r: String(radius) }}` to force the CSS property path (recommended for animatable SVG geometry), or run a manual smoke check inside the real Electron BrowserWindow and add a small assertion that the computed `r` changes between hover and unhover.
- Fix verification: a one-shot Playwright test on the real Electron window (`_electron`) hovering a row and asserting `getComputedStyle(circle).r === '6px'` after `transitionend`, or a manual visual check.

### MI-2 — `memo` on `CommitRow` is effectively defeated by recreated handlers

- Location: `src/widgets/repo-graph-vertical/ui/RepoGraphTable.tsx:258-259`
- Confidence: medium
- Failure scenario: every render of `RepoGraphTable` allocates fresh `onMouseEnter={() => handleRowMouseEnter(rowIndex)}` and `onMouseLeave={handleRowMouseLeave}` (where `handleRowMouseLeave` itself is a new const-arrow each render). `CommitRow` is wrapped in `memo`, so the shallow-comparison on every prop forces a re-render of every row on every state change of the parent. The "не плодить useCallback" comment in the task is technically wrong: `const handle = () => …` does not stabilise the reference; only `useCallback` does.
- Evidence: `RepoGraphTable.tsx:106-112` defines `handleRowMouseEnter` / `handleRowMouseLeave` as plain `const` arrows; `RepoGraphTable.tsx:258-259` wraps the first in a fresh inline arrow; `CommitRow.tsx:122` exports the row as `memo(CommitRowComponent)`. No `useCallback`, no `useRef` of the handler.
- Impact: extra React work on every hover and every column-width change. For 245 tests passing it is not a correctness issue, but it nullifies the explicit `memo()` on `CommitRow`.
- Direction: either drop `memo` from `CommitRow` (the row is small and the cost of memo bookkeeping may exceed the savings), or stabilise the handlers with `useCallback` and pass `onMouseEnter={onMouseEnterForRow}` built via a stable factory. The current "best of both" comment is misleading.
- Fix verification: re-run `npm test`; the suite stays green; optional micro-benchmark with a 1000-row fixture comparing render counts.

## Questions for Author

Нет.

## Positive Notes

- The root cause analysis in `TASK-322.md` is precise: `group-hover` cannot work because all `<circle>` elements live in a single shared `<svg>` rendered once at the top of the table, not as DOM descendants of each `<tr>`. The fix correctly moves the source of truth to React state instead of CSS.
- The added `fireEvent.mouseEnter` / `fireEvent.mouseLeave` test in `RepoGraphTable.test.tsx` (lines 260-291) is the right level of coverage: it exercises the public `RepoGraphTable` boundary, asserts exactly one `circle[r="6"]` and two `circle[r="5"]`, and confirms reset on leave. This is the test the original reviewer's question demanded.
- The new `GraphLayer` props (`hoveredRowIndex`) and `CommitRow` handlers (`onMouseEnter` / `onMouseLeave`) are correctly added to the existing `types.ts` rather than to ad-hoc inline types. AGENTS.md's "типы и интерфейсы компонента выноси в отдельный файл types.ts" rule is followed.
- AGENTS.md style: all three modified components remain arrow functions with `FC<…>`; new handlers use the `handle` prefix; no `function` keyword, no enums, no new JSDoc. No comments were added inside the changed code.
- The test count in the report (245 / 37 files) matches the verified run; the author did not over-claim.

## Unverified Areas and Limitations

- The hover animation in the real Electron BrowserWindow was not observed end-to-end. The Vite renderer is reachable, but creating a workspace requires the native folder picker (exposed only via the Electron main process), so navigating to a repository page (the only place `RepoGraphTable` is mounted) was not possible through Chrome DevTools MCP. The static and jsdom tests are sufficient to confirm the radius change but do not assert the CSS transition actually interpolates over time. MI-1 captures the residual risk.
- `npm run build` was not executed; the task does not require it and `tsc` already covers type-correctness for both renderer and electron projects. Lint and tests together cover the new code paths.
