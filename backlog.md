# QA Backlog — The Lord's Ledger

> Cap: 25 items. When full, fix before adding more.
> Format: see `QA.md`.
> Populated: 2026-04-17 from Playwright persona QA (Noob/Avg/Goat) + lint + code review.

Priority legend:
- P0: crash / blocker
- P1: broken feature or soft-lock
- P2: UX / balance / accessibility
- P3: polish / dead code

---

### B-01 — Dead handler `handleSetTaxRate` in App.jsx ✅ FIXED 2026-04-17
- Persona: Avg, Goat
- Severity: P1
- Reproduction: `npm run lint` → `src/App.jsx:142` unused `handleSetTaxRate`.
  Grep confirms `SET_TAX_RATE` action exists in reducer but no UI wires it.
- Expected: Autumn tax phase lets the player set rate; or code should be removed
  cleanly.
- Actual: Handler declared, never passed to any tab; tax rate is always default.

### B-02 — `handleSimulateSeason` useCallback deps are wrong ✅ FIXED 2026-04-17
- Persona: All
- Severity: P1 (can cause stale closures / missed toasts)
- Reproduction: `src/App.jsx:230`. deps `[isResolving, payload, setTavernOpen]`
  but body reads `setWatchtowerOpen` and dispatch. React compiler flagged this
  as "could not preserve memoization".
- Expected: deps accurately list reads, or drop the manual memo (setters and
  dispatch are stable).
- Actual: Stale deps array; lint error.

### B-03 — useMusic effect calls `setPlaying` synchronously (cascading renders) ✅ FIXED 2026-04-17
- Persona: All
- Severity: P2
- Reproduction: `src/hooks/useMusic.js:60`. Lint rule
  `react-hooks/set-state-in-effect` fires.
- Expected: `playing` should be derived from the audio element events
  (`play`/`pause` listeners) instead of set in the mute effect body.
- Actual: Effect mutates state on every mute toggle and re-render cascade risk.

### B-04 — BardsCorner reads ref during render via useState initializer ✅ FIXED 2026-04-17
- Persona: Avg, Goat (whoever visits Tavern)
- Severity: P1
- Reproduction: `src/components/BardsCorner.jsx:142`. `generateContent()`
  closure captures a ref during the `useState(() => …)` initializer; lint
  rule `react-hooks/refs` fires.
- Expected: Initialize content in an effect or compute it from stable props/state.
- Actual: May read stale ref on remount; brittle behavior.

### B-05 — Test helper `playOneTurn` times out for hard-mode playthroughs ✅ FIXED 2026-04-17
- Persona: Goat
- Severity: P1
- Reproduction: `npx playwright test tests/e2e/qa/persona-qa.spec.js`
  on hard difficulty → Goat Gamer test times out at default 30s while still
  in turn loop.
- Expected: Persona QA spec should set `test.setTimeout(120_000)` and helper
  should detect infinite-loop cases and return false.
- Actual: Test fails with `Target page, context or browser has been closed`.

### B-06 — People meter climbs to 99 on Easy by turn 7 (near-auto-loss)
- Persona: Noob (docs), Avg
- Severity: P1 balance
- Reproduction: Start on Easy, do nothing harsh, watch People reach 99.
- Expected: Easy should be gentler than Normal; growth multiplier should
  stay under the meter-death threshold without player intervention.
- Actual: Cautious Explorer persona was one point from loss at turn 7.

### B-07 — Speedrunner (zero-action) persona dies fast; no passive stability
- Persona: Noob (who freezes)
- Severity: P2 balance
- Reproduction: Start game, only click "Simulate Season" each turn.
- Expected: Base consumption should match base production for 3–5 turns so
  new players can learn without instant spiral.
- Actual: People meter crashes from 63 to 22 in 3 turns with no actions.

### B-08 — No code splitting; bundle is 1.2 MB
- Persona: All (load time)
- Severity: P2
- Reproduction: `npm run build` → `dist/assets/index-*.js 1,219.14 kB`.
- Expected: lazy-load Tavern / GreatHall / BlacksmithTab via `React.lazy()`
  so first paint ships the title + dashboard only.
- Actual: Whole bundle loaded up front; slow on 3G school devices.

### B-09 — Tutorial overlays can stack (scribe's note + tutorial)
- Persona: Noob
- Severity: P2
- Reproduction: Persona QA occasionally has two fixed.inset-0 overlays
  visible at once (`overlayBtns.last().click()` hack in helpers.js).
- Expected: Single overlay queue; new overlays wait for previous to close.
- Actual: Helpers click "last" overlay assuming stacking; real players may
  click the wrong one or get stuck.

### B-10 — No focus ring on tab buttons after click ✅ FIXED 2026-04-17
- Persona: Noob (keyboard), accessibility
- Severity: P2 a11y
- Reproduction: Tab through UI, press enter, lose focus ring on current tab.
- Expected: Visible `:focus-visible` outline meeting WCAG contrast.
- Actual: `src/components/TabBar.jsx` sets colors inline but no focus style.

### B-11 — Unused imports/vars across test suite (7 files) ✅ FIXED 2026-04-17
- Persona: N/A (CI)
- Severity: P3
- Reproduction: `npm run lint` → 7 unused-vars errors in
  tests/e2e/gameplay and tests/e2e/visual.
- Expected: Clean lint, remove unused imports.
- Actual: Lint fails in CI.

### B-12 — `process` not defined in playwright.config.js, playtest.js ✅ FIXED 2026-04-17
- Persona: N/A (CI)
- Severity: P2
- Reproduction: `npm run lint` → `'process' is not defined  no-undef` in
  playwright.config.js and playtest scripts.
- Expected: ESLint flat config should add `globals.node` for these files.
- Actual: 8+ lint errors block CI.

### B-13 — `playwright-playtest.js` has "Unnecessary escape character: \"" ✅ FIXED 2026-04-17
- Persona: N/A
- Severity: P3
- Reproduction: `npm run lint` → line 999.
- Expected: remove redundant backslashes in double-quoted string.
- Actual: 2 lint errors.

### B-14 — Trader Kid persona's spice buys push Faith to 91-92
- Persona: Avg, Goat (market focus)
- Severity: P2 balance
- Reproduction: Buy spices repeatedly from foreign merchants; faith climbs.
- Expected: Faith should plateau with diminishing returns on spice purchases.
- Actual: Near-loss on faith meter documented in `playtest-report.md`.

### B-15 — Random Clicker wins with every meter < 20 ("nail-biter win")
- Persona: Noob
- Severity: P2 UX
- Reproduction: Win with T:12 P:56 M:13 F:14 (see report).
- Expected: Victory screen should acknowledge fragile wins ("You survived
  by the skin of your teeth"); meters colored red.
- Actual: Victory screen is the same for any win.

### B-16 — Chronicle entries not visually differentiated by type ✅ FIXED 2026-04-17
- Persona: Noob, Avg
- Severity: P3
- Reproduction: Open Chronicle tab; system/action/event entries all look
  identical.
- Expected: Subtle icon or color per `type: "system"|"action"|"event"`.
- Actual: Homogeneous text wall.

### B-17 — Dashboard numbers use `.text-2xl` class only — test brittle ✅ FIXED 2026-04-17
- Persona: N/A (maintainability)
- Severity: P3
- Reproduction: `tests/e2e/gameplay/auto-playthrough.spec.js:28` relies on
  querying every `.text-2xl` and mapping by position.
- Expected: Add stable `data-testid` attributes to Dashboard resource values.
- Actual: Index-based test is fragile to layout changes.

### B-18 — Synergy toast auto-dismiss timing swallows War Kid persona
- Persona: Avg
- Severity: P2
- Reproduction: War Kid persona STUCK at turn 6 (see report).
- Expected: Toast should not block input; dismiss should be triggerable by
  any click when auto-timer is active.
- Actual: Gets stuck in a toast loop.

### B-19 — Raid defend button sometimes below viewport on 720p
- Persona: Avg, Goat
- Severity: P2
- Reproduction: RaidScreen with long description pushes "Defend" offscreen
  on 1280×720 (Playwright default).
- Expected: Scroll container or sticky action row.
- Actual: Button not reachable without scroll.

### B-20 — Build warning: chunk > 500 KB (no manual chunks)
- Persona: N/A
- Severity: P3
- Reproduction: `npm run build` warning on chunk size.
- Expected: Configure `build.rollupOptions.output.manualChunks` splitting
  lucide-react and data files.
- Actual: Warning every build.

### B-21 — `SAVE_KEY` declared inside component body (every render allocates string) ✅ FIXED 2026-04-17
- Persona: N/A perf
- Severity: P3
- Reproduction: `src/App.jsx:201`.
- Expected: Hoist to module scope constant.
- Actual: Trivial re-allocation but also unused by any hook dep array.

### B-22 — `hasSavedGame` recomputed every render via IIFE ✅ FIXED 2026-04-17
- Persona: N/A
- Severity: P3
- Reproduction: `src/App.jsx:228` — reads localStorage on every render.
- Expected: useState with lazy initializer or useMemo.
- Actual: Hits localStorage on every state update.

### B-23 — No visible feedback when player clicks a disabled action ✅ FIXED 2026-04-17
- Persona: Noob
- Severity: P2
- Reproduction: Try to build when treasury < cost — button disabled but no
  tooltip or shake.
- Expected: Tooltip "Not enough denarii" or brief red flash.
- Actual: Silent click; frustrating for 6th graders.

### B-24 — Tab icon-only view on narrow screens has no tooltip ✅ FIXED 2026-04-17
- Persona: Avg on mobile
- Severity: P2 a11y
- Reproduction: Viewport < sm breakpoint → only labels shown under icons but
  no `title=` or tooltip system.
- Expected: `title` attribute mirroring `aria-label`.
- Actual: Screen readers OK, but mouse hover has nothing.

### B-25 — Persona QA spec lacks per-test error reporter merge
- Persona: N/A (process)
- Severity: P3
- Reproduction: `qa-findings.json` appended per-test with no run-level
  summary; hard to compare across cycles.
- Expected: Add an `afterAll` hook that emits a run summary section.
- Actual: Bare array of findings.
