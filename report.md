# The Lord's Ledger - Playtest Report

## Test Configuration

- **Date**: 2026-04-14
- **Playwright version**: 1.59.1
- **Browser**: Chromium (headless)
- **Scenarios run**: 6 full playthroughs
- **Test file**: `tests/e2e/gameplay/auto-playthrough.spec.js`

## Playthrough Results Summary

| Run | Difficulty | Strategy | Turns Played | Outcome | Errors |
|-----|-----------|----------|--------------|---------|--------|
| 1 | Hard | Passive | 34 | victory | 0 |
| 2 | Hard | Builder | 27 | crash (context destroyed) | 1 |
| 3 | Normal | Military | 28 | sim_button_missing | 0 |
| 4 | Normal | Balanced | 27 | possible_softlock | 0 |
| 5 | Easy | Passive | 34 | possible_softlock | 0 |
| 6 | Easy | Builder | 27 | possible_softlock | 0 |

**Pass rate**: 1/6 clean victory, 4/6 softlocked, 1/6 crashed

## Resource Trends

| Run | Denarii Range | Food Range | Families Range | Garrison Range | Zero Food Turns | Zero Denarii Turns |
|-----|--------------|------------|----------------|----------------|-----------------|-------------------|
| Hard/Passive | 370-1314 | 0-144 | 5-18 | 1-7 | 3 | 0 |
| Hard/Builder | 0-400 | 90-176 | 16-24 | 0-5 | 0 | 11 |
| Normal/Military | 421-999 | 0-200 | 4-24 | 1-12 | 4 | 0 |
| Normal/Balanced | 0-500 | 3-200 | 20-25 | 0-17 | 0 | 4 |
| Easy/Passive | 594-2154 | 0-291 | 22-41 | 5-22 | 4 | 0 |
| Easy/Builder | 0-700 | 124-283 | 22-28 | 0-9 | 0 | 7 |

---

## Bugs Found

### BUG-01: CRITICAL - Double turn advancement on perspective flips
**File**: `src/engine/gameReducer.js`
**Lines**: 1883, 2020, 2233, 2269

ADVANCE_TURN increments `turn + 1` at line 1883 and enters `flip_intro` with `turn: nextTurn` at line 2020. When the flip completes, DISMISS_FLIP_SUMMARY again increments `turn + 1` at line 2233 and returns with `turn: advanceTurn` at line 2269. This means every flip consumes 2 turns instead of 1. With 9 possible flips, the game can end 9 turns early, explaining why Hard/Passive achieved "victory" at only 34 test-visible turns.

**Fix**: DISMISS_FLIP_SUMMARY should NOT increment the turn. It should return to management with the current `turn` value since ADVANCE_TURN already incremented it.

---

### BUG-02: CRITICAL - DISMISS_FLIP_SUMMARY skips seasonal state resets
**File**: `src/engine/gameReducer.js`
**Lines**: 2265-2287

When DISMISS_FLIP_SUMMARY advances to management, it does not reset seasonal subsystem state. Compare with ADVANCE_TURN (lines 2043-2061) which resets: `market` (advanceMarket), `greatHall` (advanceHall), `resourceDeltas` (zeroDeltas), `synergies`, `pendingSynergyNotifications`. The flip dismissal path misses all of these, causing:
- Market trades/haggles from the previous season carry over
- Great Hall feast/decree slots are not refreshed
- Resource deltas show stale values on the dashboard
- Synergy checks are skipped for the flip turn
- Foreign trader rotation is skipped

**Fix**: Add the same seasonal reset logic to DISMISS_FLIP_SUMMARY that exists in ADVANCE_TURN.

---

### BUG-03: HIGH - Bankruptcy game-over never triggers (threshold too high)
**File**: `src/engine/meterUtils.js`
**Lines**: 98-103

`checkGameOver` requires `bankruptcyTurns >= 4` (4 consecutive turns at 0 denarii) to trigger bankruptcy. Hard/Builder ran with denarii=0 for 11 consecutive turns without game over. The bankruptcy counter is only incremented in SIMULATE_SEASON, not during RAID_CONTINUE where raids can push denarii to 0. Additionally, RAID_CONTINUE at line 1726 passes `state.bankruptcyTurns` unchanged to checkGameOver, so the counter isn't updated after a raid.

**Fix**: Ensure the bankruptcy counter is properly incremented in all paths where denarii can reach 0 (RAID_CONTINUE, event choices).

---

### BUG-04: HIGH - Softlock when flip phases can't be dismissed by automation
**File**: `src/engine/gameReducer.js`, `tests/e2e/helpers.js`
**Lines**: 2082-2110 (reducer), 158-170 (helpers)

4 out of 6 runs ended in softlock or "sim_button_missing". The flip phases use buttons that don't always match the test automation's expected selectors. Also, DISMISS_FLIP_INTRO at line 2082 returns `state` unchanged if the flip doesn't exist, trapping the player in flip_intro forever with no escape.

**Fix**: Add guard clauses in flip phase handlers that fall back to management phase if flip data is missing/invalid. Also update the test to handle flip-specific button patterns.

---

### BUG-05: HIGH - Victory check uses wrong comparison in DISMISS_FLIP_SUMMARY
**File**: `src/engine/gameReducer.js`
**Line**: 2236

`if (turn >= MAX_TURNS)` uses the pre-increment `turn` value (before `advanceTurn = turn + 1` on line 2233). This means victory triggers at turn 40 (correct), but combined with BUG-01 where flips double-increment, the effective check happens 1 turn too early after each flip.

**Fix**: After fixing BUG-01 (removing the double increment), the victory check should use the current turn value, consistent with ADVANCE_TURN's check.

---

### BUG-06: MEDIUM - Starvation attrition too slow (capped at 5 families)
**File**: `src/engine/economyEngine.js`
**Line**: 436

`familiesLeave = Math.min(currentPopulation - floorPop, maxAttrition, Math.round(Math.min(5, consumption.shortfall) * penaltyScale))`

The `Math.min(5, consumption.shortfall)` cap means at most 5 families leave per turn from starvation on Normal, regardless of how severe the shortage is. With 30+ families and 0 food, it takes 6+ turns to depopulate. Easy/Passive hit food=0 for 4 turns and only dropped from 41 to 28 families.

**Fix**: Remove the `Math.min(5, ...)` cap. Let `maxAttrition` (20% of population) serve as the sole cap on attrition rate.

---

### BUG-07: MEDIUM - FOOD_PER_FAMILY = 1 makes food trivially easy to maintain
**File**: `src/data/economy.js`
**Line**: 180

Each family consumes only 1 food per season. With 20 families, only 20 food is needed (30 in winter). Starting with 200 food on Normal means 10 seasons of food without production. Food management is nearly irrelevant for the first 2.5 years.

**Fix**: Increase FOOD_PER_FAMILY to 3. Adjust starting food inventories accordingly (multiply by ~2).

---

### BUG-08: MEDIUM - Garrison deserts from unpaid upkeep use hardcoded value
**File**: `src/engine/economyEngine.js`
**Lines**: 478-483

When soldiers can't be paid, desertion is `Math.ceil(2 * penaltyScale)` - a flat 2 (Normal) or 3 (Hard). Even with 50 unpaid soldiers, only 2-3 desert. The unpaid upkeep amount is ignored.

**Fix**: Scale desertion by unpaid ratio: `Math.ceil((unpaidUpkeep / totalUpkeep) * currentGarrison * 0.15 * penaltyScale)`.

---

### BUG-09: MEDIUM - Market state not reset on DISMISS_FLIP_SUMMARY
**File**: `src/engine/gameReducer.js`
**Lines**: 2265-2287

`tradesThisSeason`, `quickTradesUsed`, `haggleTradesUsed`, and `activeHaggle` are NOT reset when a flip dismissal advances the turn. Trades carry into the next season and the foreign trader doesn't rotate.

**Fix**: Part of BUG-02 fix. Include market seasonal reset in DISMISS_FLIP_SUMMARY.

---

### BUG-10: MEDIUM - Tavern seasonal limits not reset on flip turn advance
**File**: `src/engine/gameReducer.js`
**Lines**: 2265-2287

`gambitRoundsThisSeason`, `ratsPlayedThisSeason`, and `strangerAppearedThisSeason` are not reset in DISMISS_FLIP_SUMMARY. Players can double-dip on tavern activities after a flip.

**Fix**: Part of BUG-02 fix. Include tavern seasonal reset in DISMISS_FLIP_SUMMARY.

---

### BUG-11: MEDIUM - Watchtower scan not reset on flip turn advance
**File**: `src/engine/gameReducer.js`
**Lines**: 2265-2287

`scannedThisSeason` and `lastScanResult` are not reset, so the watchtower appears already used after a flip.

**Fix**: Part of BUG-02 fix. Include watchtower seasonal reset in DISMISS_FLIP_SUMMARY.

---

### BUG-12: MEDIUM - Blacksmith seasonal state not reset on flip turn advance
**File**: `src/engine/gameReducer.js`
**Lines**: 2265-2287

`salesThisSeason`, supply event countdown, and forge market prices are not updated in DISMISS_FLIP_SUMMARY.

**Fix**: Part of BUG-02 fix. Include blacksmith seasonal reset in DISMISS_FLIP_SUMMARY.

---

### BUG-13: MEDIUM - Building degradation skipped during flip turns
**File**: `src/engine/gameReducer.js`

Building condition degrades in SIMULATE_SEASON (lines 1296-1305). When a flip consumes an extra turn (BUG-01), the building degradation for that phantom turn is skipped. Players with more flips get an advantage in building maintenance.

**Fix**: Resolves once BUG-01 is fixed (flips no longer consume an extra turn).

---

### BUG-14: MEDIUM - Economy simulation skipped during flip turns
**File**: `src/engine/gameReducer.js`

When a flip fires via ADVANCE_TURN, the next SIMULATE_SEASON is never called for the consumed turn. Production, consumption, upkeep, tax collection, and population growth are all skipped for one entire season. Players get a "free" season with no costs.

**Fix**: Resolves once BUG-01 is fixed. The flip happens on the current turn and the next SIMULATE_SEASON runs normally.

---

### BUG-15: LOW - Cause chain not updated during flip consequences
**File**: `src/engine/gameReducer.js`
**Lines**: 2195-2287

DISMISS_FLIP_SUMMARY applies resource effects but doesn't add an entry to `causeChain`. If the game ends after a flip, the Game Over screen's "Chronicle of Ruin" won't show what the flip did.

**Fix**: Add a causeChain entry in DISMISS_FLIP_SUMMARY summarizing the flip's resource effects.

---

### BUG-16: LOW - RAID_CONTINUE does not increment bankruptcyTurns
**File**: `src/engine/gameReducer.js`
**Line**: 1726

`postRaidState` passes `bankruptcyTurns: state.bankruptcyTurns` unchanged. If a raid causes denarii to drop to 0, the bankruptcy counter is not incremented.

**Fix**: Increment bankruptcyTurns in RAID_CONTINUE if post-raid denarii <= 0.

---

### BUG-17: LOW - Ale consumed even during famine (wasted)
**File**: `src/engine/economyEngine.js`
**Lines**: 544-597

Ale consumption and settler attraction compute at lines 544-591, but famine check at line 594-597 cancels any population growth. The ale is still consumed even though growth is impossible during starvation.

**Fix**: Move the famine check before ale consumption. Skip ale when `consumption.shortfall > 0`.

---

### BUG-18: LOW - Denarii accumulation unchecked on Easy difficulty
**File**: `src/engine/economyEngine.js`, `src/data/economy.js`

Easy/Passive accumulated 2154 denarii by turn 39 with zero strategy. `penaltyScale: 0.5` halves negatives while passive income scales with population. No inflation or spending pressure exists.

**Fix**: Consider adding estate maintenance costs that scale with building count or wealth.

---

### BUG-19: LOW - Population death spiral with no recovery mechanism
**File**: `src/engine/economyEngine.js`

Normal/Military saw families drop to 4 with no recovery. Once population drops below ~10, passive income drops, making recovery nearly impossible. No mechanic exists for wandering settlers or population recovery.

**Fix**: Add a small baseline population recovery chance (e.g., +1 family if population < 10 and food > 0) to prevent unrecoverable states.

---

### BUG-20: LOW - Flip consequences can push garrison above MAX_GARRISON
**File**: `src/engine/gameReducer.js`
**Lines**: 2180-2193

`applyResourceEffects` clamps garrison to MAX_GARRISON, but typed garrison reconciliation at lines 2186-2192 adds levy soldiers without checking the cap.

**Fix**: Clamp total typed garrison count after reconciliation.

---

### BUG-21: LOW - removeFromGarrison edge case with negative typed counts
**File**: `src/engine/gameReducer.js`

`removeFromGarrison` is called in DISMISS_FLIP_SUMMARY and RAID_CONTINUE. If loss exceeds total garrison, individual type counts could underflow to negative.

**Fix**: Ensure removeFromGarrison clamps each type to Math.max(0, ...).

---

### BUG-22: LOW - Synergy checks skipped during flip turns
**File**: `src/engine/gameReducer.js`
**Lines**: 2265-2287

DISMISS_FLIP_SUMMARY doesn't run `checkSynergies()` or update synergy consecutive counters. Players can miss synergy activations during flip turns.

**Fix**: Add synergy check logic to DISMISS_FLIP_SUMMARY, matching the ADVANCE_TURN pattern.

---

### BUG-23: LOW - Crash on Hard/Builder at turn 28
**File**: Test infrastructure / reducer

Hard/Builder crashed with "Execution context was destroyed". This suggests an unhandled error causing React to throw, or a hot-reload trigger during gameplay.

**Fix**: Investigate reducer edge cases (undefined building type, NaN values). May be a test-environment artifact.

---

### BUG-24: LOW - Perspective flip triggers too aggressively
**File**: `src/engine/flipEngine.js`
**Lines**: 81-91

`cyoa_lord` (minTurn 5) and `cyoa_monk` (minTurn 12) trigger unconditionally. Combined with 7 other easily-met flips, most games see 6-8 flips in 40 turns.

**Fix**: Add meaningful trigger conditions to cyoa_lord and cyoa_monk. Consider adding a cooldown between consecutive flips.

---

### BUG-25: LOW - Garrison upkeep too cheap (1d per levy)
**File**: `src/data/economy.js`

At 1 denarii per levy per season, maintaining 10 soldiers costs only 10d. Even men-at-arms at 5d each are cheap. Military upkeep is negligible compared to income, making garrison maintenance trivial.

**Fix**: Increase GARRISON_UPKEEP_PER_SOLDIER or add food costs for garrison.

---

## Balance Observations (Not Bugs)

1. **Food is too abundant**: FOOD_PER_FAMILY=1 means 20 families only need 20 food/season. Starting inventory has 200+ food. Food rarely becomes a constraint.
2. **Denarii snowball on Easy**: With no spending pressure, Easy mode accumulates 2000+ denarii by mid-game.
3. **Military strategy is punishing**: Recruiting soldiers costs denarii but provides no income.
4. **Population recovery is too slow**: Once below 10, the estate enters a death spiral.
5. **Building strategy drains denarii fast**: Easy/Builder hit 0 denarii by turn 30 despite 700d start.
