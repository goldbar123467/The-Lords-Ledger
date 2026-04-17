# QA Backlog — The Lord's Ledger

> Cap: 25 items. When full, fix before adding more.
> Format: see `QA.md`.
> Populated: 2026-04-17 — fresh persona QA + gameplay/visual suite run.
> Prior backlog (B-01..B-25) resolved across 5 fix cycles on this branch
> (see git log). This backlog starts a new cycle; numbering continues from B-26.
> 2026-04-17 cycle 2: re-ran persona + exploratory QA, added B-37..B-42 from
> the gameplay/visual suite and full tab tour. Total unfixed items: 11 (under
> 25 cap). Current fix set: B-32, B-33, B-34, B-36, B-37 (5 items).

Priority legend:
- P0: crash / blocker
- P1: broken feature or soft-lock
- P2: UX / balance / accessibility
- P3: polish / dead code

---

### B-26 — game-start.spec.js expects stale food totals (Normal: 200 vs 365) ✅ FIXED 2026-04-17
- Persona: N/A (CI)
- Severity: P1 (CI red)
- Reproduction: `npx playwright test tests/e2e/gameplay/game-start.spec.js` →
  "starting on Normal difficulty sets correct initial resources" expects
  `food === 200` but receives `365`.
- Expected: Test asserts the current Normal startingInventory
  (grain 280 + livestock 50 + fish 35 = 365) which matches `src/data/economy.js:283`.
- Actual: Comment and assertion reflect pre-B-06/B-07 balance values.

### B-27 — game-start.spec.js expects stale food totals (Easy: 280 vs 480) ✅ FIXED 2026-04-17
- Persona: N/A (CI)
- Severity: P1 (CI red)
- Reproduction: Same spec, "Easy difficulty gives more resources" expects 280,
  receives 480.
- Expected: Assertion should match current Easy inventory in `economy.js` (grain
  360 + livestock 80 + fish 40 = 480).
- Actual: Outdated assertion blocks CI.

### B-28 — game-start.spec.js expects stale Hard denarii (350 vs 400) ✅ FIXED 2026-04-17
- Persona: N/A (CI)
- Severity: P1 (CI red)
- Reproduction: "Hard difficulty gives fewer resources" expects `denarii === 350`,
  receives 400. `economy.js:294` sets Hard `startingDenarii: 400`.
- Expected: Assertion updated to 400.
- Actual: Stale from earlier balance pass.

### B-29 — Dashboard test helper still uses `.text-2xl` index map ✅ FIXED 2026-04-17
- Persona: N/A (maintainability — B-17 was only half-fixed)
- Severity: P2
- Reproduction: `tests/e2e/gameplay/game-start.spec.js:14` `getDashboardValues`
  uses `document.querySelectorAll(".text-2xl")` and positional indexing.
  Dashboard now has `data-testid="resource-<key>"` (see `Dashboard.jsx:58, 111`)
  but tests never migrated. Any reorder/new .text-2xl breaks tests.
- Expected: Use `data-testid="resource-denarii"`, `resource-food`, etc.
- Actual: Positional mapping; brittle.

### B-30 — Visual snapshot `tab-bar.png` out of date after focus-ring fix ✅ FIXED 2026-04-17
- Persona: N/A (CI)
- Severity: P2
- Reproduction: `npx playwright test tests/e2e/visual/ui-screens.spec.js` →
  "Tab Navigation tab bar visual snapshot" pixel-diff fails. B-10's
  `:focus-visible` outline additions on `TabBar.jsx` changed rendering.
- Expected: Update baseline with `npm run test:update-snapshots`.
- Actual: Stale baseline fails CI visual suite.

### B-31 — Visual snapshot `estate-tab-initial.png` out of date ✅ FIXED 2026-04-17
- Persona: N/A (CI)
- Severity: P2
- Reproduction: "Estate Tab renders estate management view on game start" →
  48,732 pixels differ. Likely from chronicle-entry icon/color changes (B-16)
  or disabled-action tooltip (B-23).
- Expected: Refresh baseline snapshot.
- Actual: Pixel diff every run.

### B-32 — CSS warning: `grid-cols-3` not recognized as pseudo-class ✅ FIXED 2026-04-17
- Persona: N/A (build log noise)
- Severity: P3
- Reproduction: `npm run build` → "`grid-cols-3` is not recognized as a valid
  pseudo-class" (3 warnings, `src/index.css` around the responsive media block).
  Cause: selectors like `.grid.grid-cols-1.sm\\:grid-cols-3` double-escape
  the colon; Tailwind 4 parser rejects the escaped selector.
- Expected: Use single backslash escape (`\:`) or rewrite as
  `@media` rules targeting `.sm\:grid-cols-3` without class chaining.
- Actual: 3 warnings per build.

### B-33 — `dismissTutorial` helper races with overlay unmount ("element not stable") ✅ FIXED 2026-04-17
- Persona: N/A (flake)
- Severity: P2
- Reproduction: Running full `tests/e2e/gameplay/season-flow.spec.js` under
  parallel workers occasionally fails on `dismissButton.click()` with
  "element is not stable / element was detached". Helper reads
  `I Understand` then clicks before the overlay finishes its fade-in
  transition.
- Expected: Wait for `state: "visible"` + small settle, or use
  `locator.click({ trial: true, force: true })` after opacity transition.
- Actual: Flake rate ~10% under 8 parallel workers.

### B-34 — Military/fortification specs time out at 30s under parallel workers ✅ FIXED 2026-04-17
- Persona: N/A (flake)
- Severity: P2
- Reproduction: `npx playwright test tests/e2e/gameplay` with default workers:
  "Military Tab morale is displayed in the dashboard" and "fortification section
  shows walls, gate, moat tracks" timeout while they pass individually. Root
  cause is shared dev server saturating and dismissTutorial flake (B-33).
- Expected: Bump test-level timeout or stabilise dismissTutorial.
- Actual: Intermittent CI red.

### B-35 — npm audit: 4 vulnerabilities (1 moderate, 3 high)
- Persona: N/A (supply chain)
- Severity: P2
- Reproduction: `npm install` → "4 vulnerabilities (1 moderate, 3 high)".
- Expected: Review with `npm audit`, upgrade or document exceptions.
- Actual: Security notice on every install.

### B-36 — Persona QA logs CDN TLS errors and counts them toward `pageerror` budget ✅ FIXED 2026-04-17
- Persona: N/A (QA harness)
- Severity: P3
- Reproduction: `tests/e2e/qa/persona-qa.spec.js` → each persona records two
  `ERR_CERT_AUTHORITY_INVALID` console errors from external music/font CDN
  requests in the sandboxed environment. They inflate the error count and
  make a real regression harder to see.
- Expected: Filter `ERR_CERT_AUTHORITY_INVALID` and `net::` transport errors
  in the collector so only app-level errors count.
- Actual: Noise in `qa-findings.json` every run.

### B-37 — Remaining gameplay/visual specs still use `.text-2xl` positional indexing ✅ FIXED 2026-04-17
- Persona: N/A (maintainability — B-29 was partial)
- Severity: P2
- Reproduction: `grep -rn ".text-2xl" tests/` shows 9 more spec files still
  call `document.querySelectorAll(".text-2xl")` with positional index maps:
  `tests/e2e/gameplay/market.spec.js:15`,
  `tests/e2e/gameplay/estate-building.spec.js:15`,
  `tests/e2e/gameplay/auto-playthrough.spec.js:27`,
  `tests/e2e/gameplay/multi-turn.spec.js:16`,
  `tests/e2e/gameplay/military.spec.js:15, 26, 112`,
  `tests/e2e/gameplay/save-load.spec.js:16`,
  `tests/e2e/visual/theme-colors.spec.js:103`.
  B-29 only migrated `game-start.spec.js`.
- Expected: Use `data-testid="resource-<key>"` selectors added by B-29
  (Dashboard.jsx:58,111) across all remaining specs.
- Actual: Positional indexing persists in 9 spec locations; any reorder
  breaks many tests at once.

### B-38 — `qa-findings.json` appended forever across runs, no truncation
- Persona: N/A (QA harness)
- Severity: P3
- Reproduction: `tests/e2e/qa/persona-qa.spec.js` → `record()` reads
  existing findings and appends. Running the persona suite N times leaves
  N × 3 entries in `qa-findings.json`; the run-level `qa-summary.json`
  then reports the accumulated totals, not the current cycle.
- Expected: Truncate `qa-findings.json` at start of a new run (or stamp a
  `runId` and derive the per-run summary from that id).
- Actual: File grows and confuses cycle-over-cycle comparisons.

### B-39 — Full-page visual QA reveals layout overflow on Market/Estate tabs at 1280×720
- Persona: Avg Gamer
- Severity: P2
- Reproduction: `playtest-screenshots/qa-cycle/tab-market.png` (fullPage)
  — the "Purse: 500d", Simulate Season button, and merchant strip sit
  *below* a portion of the commodity table that is cut by the fold.
  Estate tab (after-turn-1) shows three production cards rendering empty
  (right column) when the viewport is narrower than the 3-col grid.
- Expected: Either enable a scrollable commodity panel that doesn't push
  merchants out of view, or drop to 2-col layout below a breakpoint.
  Blank production cards suggest Chapel/tribute lock state leaks into the
  BUILD NEW grid — investigate the `disabled` branch in EstateTab card
  render.
- Actual: Content feels truncated for players on default desktop window.

### B-40 — Exploratory spec shipped with stale tab labels (`Great Hall`, `Blacksmith`)
- Persona: N/A (QA harness)
- Severity: P2
- Reproduction: Initial version of `tests/e2e/qa/exploratory.spec.js`
  iterated `["Map", "Market", "Military", "People", "Great Hall",
  "Chapel", "Blacksmith", "Chronicle"]`. Actual TabBar labels (TabBar.jsx:10)
  are `Hall` and `Forge`; the spec timed out at 120s clicking a non-existent
  aria-label. Fixed inline this cycle, but no guard prevents regression.
- Expected: Export `TAB_CONFIG` from `src/components/TabBar.jsx` (or a
  shared list) so specs import the single source of truth.
- Actual: Any tab rename silently breaks downstream specs.

### B-41 — `SIMULATE_SEASON` button floats over Blacksmith forge on tall scrolls
- Persona: Avg Gamer / Goat Gamer
- Severity: P2 (UX)
- Reproduction: `playtest-screenshots/qa-cycle/tab-forge.png` (fullPage) —
  the Simulate Season action bar overlaps the cold-forge indicator and the
  anvil silhouette. At 1280px the anvil and "COLD" banner collide with the
  sticky-positioned action bar from the top-level layout.
- Expected: Add bottom padding equal to action-bar height on the Forge
  content so scroll bottom is reachable.
- Actual: Blacksmith interior appears cramped; anvil clipped.

### B-42 — Blacksmith anvil sprite rendered as black silhouette on dark background
- Persona: Noob (first-time player)
- Severity: P3 (visibility / onboarding)
- Reproduction: Forge tab at game start — the anvil SVG at the top of
  `BlacksmithTab.jsx` has `filter: "brightness(0.3)"` applied while the
  page background is already `#0f0d0a`. The anvil reads as a dark blob.
- Expected: Either lift the silhouette brightness to ~0.6 or place the
  anvil on a lighter plate so shape is visible to first-time players.
- Actual: Users can't tell what the black blob is until they interact.
