# QA Backlog — The Lord's Ledger

> Cap: 25 items. When full, fix before adding more.
> Format: see `QA.md`.
> Populated: 2026-04-17 — fresh persona QA + gameplay/visual suite run.
> Prior backlog (B-01..B-25) resolved across 5 fix cycles on this branch
> (see git log). This backlog starts a new cycle; numbering continues from B-26.

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

### B-32 — CSS warning: `grid-cols-3` not recognized as pseudo-class
- Persona: N/A (build log noise)
- Severity: P3
- Reproduction: `npm run build` → "`grid-cols-3` is not recognized as a valid
  pseudo-class" (3 warnings, `src/index.css` around the responsive media block).
  Cause: selectors like `.grid.grid-cols-1.sm\\:grid-cols-3` double-escape
  the colon; Tailwind 4 parser rejects the escaped selector.
- Expected: Use single backslash escape (`\:`) or rewrite as
  `@media` rules targeting `.sm\:grid-cols-3` without class chaining.
- Actual: 3 warnings per build.

### B-33 — `dismissTutorial` helper races with overlay unmount ("element not stable")
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

### B-34 — Military/fortification specs time out at 30s under parallel workers
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

### B-36 — Persona QA logs CDN TLS errors and counts them toward `pageerror` budget
- Persona: N/A (QA harness)
- Severity: P3
- Reproduction: `tests/e2e/qa/persona-qa.spec.js` → each persona records two
  `ERR_CERT_AUTHORITY_INVALID` console errors from external music/font CDN
  requests in the sandboxed environment. They inflate the error count and
  make a real regression harder to see.
- Expected: Filter `ERR_CERT_AUTHORITY_INVALID` and `net::` transport errors
  in the collector so only app-level errors count.
- Actual: Noise in `qa-findings.json` every run.
