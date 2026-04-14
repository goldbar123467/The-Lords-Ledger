# Automated Playthrough Report -- The Lord's Ledger

**Date:** 2026-04-14
**Method:** 6 automated Playwright playthroughs across 3 difficulties and 4 strategies
**Script:** `tests/e2e/gameplay/auto-playthrough.spec.js`
**Round:** 6 (regression check)

---

## Summary

| Run | Difficulty | Strategy | Turns Survived | Outcome | Time |
|-----|-----------|----------|---------------|---------|------|
| Hard/Passive | Hard | No actions | 12 | game_over:depopulation | 56.8s |
| Normal/Military | Normal | Recruit every turn | 11 | sim_button_missing (softlock) | 57.1s |
| Easy/Passive | Easy | No actions | 13 | possible_softlock | 77.2s |
| Hard/Builder | Hard | Build each turn | 9 | possible_softlock | 77.5s |
| Normal/Balanced | Normal | Alternate build/recruit | 11 | possible_softlock | 77.9s |
| Easy/Builder | Easy | Build each turn | 8 | crash (page navigated to title) | 299.8s |

**No run reached turn 40 or achieved victory.** All games either crashed, softlocked, or ended in game over well before the midpoint. This is a significant regression from Round 5.

---

## Resource Trajectories

### Hard/Passive (12 turns, game_over:depopulation)
```
T1  Spring Y1: D=400  F=130  Fam=18  G=3
T2  Summer Y1: D=339  F=105  Fam=19  G=3
T3  Autumn Y1: D=363  F=61   Fam=19  G=5
T4  Winter Y1: D=578  F=49   Fam=20  G=5
T6  Summer Y2: D=435  F=17   Fam=19  G=5
T7  Autumn Y2: D=333  F=27   Fam=16  G=2
T8  Winter Y2: D=385  F=0    Fam=16  G=3
T10 Summer Y3: D=275  F=57   Fam=6   G=0
T12 Winter Y3: D=293  F=69   Fam=6   G=1
T14 Summer Y4: D=286  F=57   Fam=4   G=2
T17 Spring Y5: D=423  F=1    Fam=4   G=3
```
Food hits 0 by turn 8. Population drops from 20 to 6 between turns 8-10 (2 seasons). Garrison hits 0 by turn 10.

### Easy/Passive (13 turns, softlock)
```
T1  Spring Y1: D=700  F=280  Fam=22  G=5
T9  Spring Y3: D=1404 F=92   Fam=30  G=8
T17 Spring Y5: D=1425 F=29   Fam=29  G=10
```
Even on Easy with 700d start, food drops from 280 to 29 by turn 17. Game softlocked before reaching turn 20.

---

## Bugs Found (20 total)

### CRITICAL (game-breaking)

**BUG 1 -- Softlock when seasonal event is null**
- **Files:** `src/engine/gameReducer.js:1541-1542`, `src/App.jsx:596-602`
- **Description:** `pickSeasonalEvent()` returns `{ event: null }` when no valid event is available. The SIMULATE_SEASON case sets `phase: "seasonal_action"` with `currentEvent: null`. App.jsx guards EventCard rendering with `currentEvent &&`, so nothing renders. The game is stuck in `seasonal_action` phase with no UI to advance. This caused softlocks in 4 out of 6 runs.
- **Fix:** When `seasonalEvent` is null, skip to `seasonal_resolve` phase.

**BUG 2 -- EventCard crashes on undefined event.options**
- **Files:** `src/components/EventCard.jsx:67`
- **Description:** `event.options.map(...)` has no null guard. If an event lacks an `options` field, this throws a TypeError that crashes React, navigating back to the title screen. This caused the Easy/Builder crash.
- **Fix:** Guard with `event.options?.map(...)` or return early.

### HIGH (severe balance issues)

**BUG 3 -- Hard mode has no food rationing cap**
- **File:** `src/engine/economyEngine.js:424`
- **Description:** Easy/Normal cap food consumption at 25/season. Hard has `maxFoodLoss = null` (uncapped). With 18 families + winter 1.5x, consumption reaches 27/season -- exceeding all production. Food depletes by turn 8 every time. Hard mode is unwinnable.
- **Fix:** Give Hard mode a higher cap (e.g., 35) instead of no cap.

**BUG 4 -- Starvation penalty too harsh on Hard**
- **File:** `src/engine/economyEngine.js:434`
- **Description:** `familiesLeave = min(pop-floor, round(min(5, shortfall) * penaltyScale))`. Hard penaltyScale 1.5 means up to 7-8 families leave per season. Pop 20 to 6 in 2 famine seasons. No recovery path exists.
- **Fix:** Cap per-season attrition to `ceil(pop * 0.2)` (max 20% loss).

**BUG 5 -- Triple garrison desertion cascade**
- **Files:** `src/engine/economyEngine.js:455,472`, `src/engine/gameReducer.js:1242-1254`
- **Description:** Three desertion sources fire in the same turn: (1) hungry garrison, (2) unpaid upkeep, (3) morale-based. On Hard, a bad turn goes from 5 to 0 garrison. All three compound when food/denarii are low.
- **Fix:** Cap total per-season desertion to 50% of current garrison.

**BUG 6 -- Morale recovery thresholds unreachable**
- **File:** `src/engine/gameReducer.js:1228-1232`
- **Description:** Morale gains +5 only if `food > 200` (very hard). Morale loses -10 if `food < 50` (very easy to hit). Net morale is always negative once food drops, creating an unrecoverable spiral. At morale 0-20, levy desertion triggers (10%/levy/season).
- **Fix:** Add intermediate thresholds: food 50-100 = no change, 100-200 = +2, >200 = +5.

**BUG 7 -- Garrison food double-drain**
- **File:** `src/engine/economyEngine.js:422-463`
- **Description:** Population food consumption (line 425) and garrison food (line 442) are independent. A 20-pop estate with 5 garrison consumes 20 + 2 = 22 food/season. The garrison drain is not shown in the food forecast, creating a hidden drain.
- **Fix:** Reduce garrison food rate from `ceil(garrison/3)` to `ceil(garrison/5)`.

### MEDIUM (gameplay/balance issues)

**BUG 8 -- Winter production/consumption 6:1 deficit**
- **File:** `src/data/economy.js:211,219`
- **Description:** Winter production is x0.25, consumption is x1.5. Combined: 6:1 deficit ratio. For 20 families with 2 farms: produce ~4 food, consume ~30 food. Each winter burns ~26 food from storage. This makes winter a game-ending season.
- **Fix:** Raise winter production to 0.4 OR reduce winter consumption to 1.25.

**BUG 9 -- Population income too low to sustain buildings**
- **File:** `src/engine/economyEngine.js:505`
- **Description:** Passive income is `floor(pop * 0.5)`. For 18 families = 9d/season. Building upkeep for 4 starting buildings is 15-25d. Passive income never covers upkeep, creating automatic denarii drain every single season.
- **Fix:** Increase multiplier from 0.5 to 0.75.

**BUG 10 -- Food surplus growth threshold too high**
- **File:** `src/engine/economyEngine.js:526`
- **Description:** Population growth requires `food > pop * 2`. For 20 families = 40 food surplus needed. With consumption 20+/season, maintaining 40+ food is near-impossible. Population rarely grows organically.
- **Fix:** Lower to `pop * 1.5` or `pop + 15`.

**BUG 11 -- Building degradation creates resource death spiral**
- **File:** `src/engine/gameReducer.js:1292-1313`
- **Description:** Buildings degrade 5-10%/season (x1.5 winter). After 8 seasons a building drops to ~30% (Poor condition, 50% output). Repairing costs denarii the player doesn't have. Ruined buildings produce nothing, cutting food/income further.
- **Fix:** Reduce base degradation from 5-10% to 3-7%.

**BUG 12 -- Tax only in Autumn -- 3 seasons without income**
- **File:** `src/engine/economyEngine.js:480`
- **Description:** Tax collection is Autumn-only. Combined with low passive income, the player loses denarii for 3 consecutive seasons before any tax. On Hard (400d start), 3 seasons of upkeep = ~105d drained before first tax.
- **Fix:** Add small quarterly levy in non-Autumn seasons.

### LOW (minor issues)

**BUG 13 -- Knights abandon at pop < 10 regardless of difficulty**
- **File:** `src/engine/gameReducer.js:1257-1262`
- **Description:** Knight departure threshold is not difficulty-scaled. On Hard, pop drops below 10 by turn 7, causing expensive knights to desert.
- **Fix:** Scale threshold by difficulty (hard: 5, normal: 8, easy: 10).

**BUG 14 -- Ale/salt consumed during famine**
- **File:** `src/engine/economyEngine.js:529-542`
- **Description:** Luxury goods (3 ale, 1 salt, 1 tools, 1 spices) consumed every season regardless of starvation. Wastes tradeable resources during crisis.
- **Fix:** Skip luxury consumption when `shortfall > 0`.

**BUG 15 -- Building upkeep uses pre-desertion garrison count**
- **File:** `src/engine/economyEngine.js:466`
- **Description:** Upkeep calculated on garrison before food-related desertion. Player pays for soldiers that already deserted.
- **Fix:** Use post-desertion garrison count for upkeep.

**BUG 16 -- Flip phases can softlock if flip data missing**
- **File:** `src/App.jsx:244`, `src/components/FlipScreen.jsx`
- **Description:** During flip phases, tabs and simulate button are hidden. If FlipScreen can't render its buttons, there's no escape.
- **Fix:** Add fallback "Skip" button for missing flip data.

**BUG 17 -- Food state.food can drift from inventory total**
- **File:** `src/engine/economyEngine.js:603`
- **Description:** Both `state.food` and `state.inventory` are set independently. They can desync if any code modifies one without the other.
- **Fix:** Always derive `state.food` from `getTotalFood(state.inventory)`.

**BUG 18 -- Military-to-garrison conversion loses small values**
- **File:** `src/engine/meterUtils.js:32`
- **Description:** `Math.round(effects.military / 5)` means military effect +2 gives 0 garrison. Small military bonuses are completely lost.
- **Fix:** Use `Math.ceil` for positive values.

**BUG 19 -- Food shortfall message misleading with rationing**
- **File:** `src/engine/economyEngine.js:336`
- **Description:** With `maxFoodLoss = 25`, message says "needed 25 food" for 30 families, hiding the cap.
- **Fix:** Show actual vs capped consumption.

**BUG 20 -- Garrison food display mismatch in UI**
- **Files:** `src/components/PeopleTab.jsx`, `src/components/EstateTab.jsx`
- **Description:** UI shows garrison food as `ceil(garrison/2)` but engine uses `ceil(garrison/3)`. Display is higher than actual.
- **Fix:** Match UI to engine formula.

---

## Priority Order for Fixes

1. **BUG 1 + BUG 2** (softlock + crash) -- Most impactful, blocks all playthroughs
2. **BUG 3 + BUG 4 + BUG 5** (death spirals) -- Hard mode is unplayable
3. **BUG 6 + BUG 7 + BUG 8** (morale/food balance) -- All difficulties suffer
4. **BUG 9 + BUG 10 + BUG 11 + BUG 12** (economy balance) -- Quality of play
5. **BUG 13-20** (minor issues) -- Polish

---

## All 20 Bugs Fixed

### Batch 1 (Critical)
| Bug | Fix |
|-----|-----|
| BUG 1 | Skip to seasonal_resolve when no seasonal event available |
| BUG 2 | Guard EventCard against undefined event.options |
| BUG 3 | Add food rationing cap for hard mode (35) |
| BUG 4 | Cap per-season starvation attrition to 20% of population |
| BUG 5 | Cap total garrison desertion to 50% per season |

### Batch 2 (Balance)
| Bug | Fix |
|-----|-----|
| BUG 6 | Add intermediate morale tiers (food 50-100 neutral, 100-200 gives +2) |
| BUG 7 | Reduce garrison food rate from garrison/3 to garrison/5 |
| BUG 8 | Winter production 0.25->0.5, consumption 1.5->1.25 |
| BUG 9 | Increase population passive income from 0.5 to 0.75 per family |
| BUG 10 | Lower food surplus growth threshold from pop*2 to pop*1.5 |

### Batch 3 (Tuning)
| Bug | Fix |
|-----|-----|
| BUG 11 | Apply 0.7x dampener to building degradation |
| BUG 12 | Add quarterly market levy (pop*0.15d) in non-Autumn seasons |
| BUG 13 | Scale knight departure threshold by difficulty (easy:10, normal:8, hard:5) |
| BUG 14 | Skip luxury consumption (ale, salt, tools, spices) during famine |
| BUG 15 | Confirmed not a real bug - upkeep already uses post-desertion count |

### Batch 4 (Polish)
| Bug | Fix |
|-----|-----|
| BUG 16 | Add fallback "Return to Your Reign" button in FlipScreen |
| BUG 17 | Confirmed not a real bug - food always synced from economy engine |
| BUG 18 | Confirmed already fixed - Math.ceil used for positive conversions |
| BUG 19 | Show rationing savings in shortfall message |
| BUG 20 | Update garrison food display to match engine formula (garrison/5) |

---

## Validation Results (Post-Fix)

| Run | Difficulty | Strategy | Turns | Outcome | Pop Range | 0d Turns | 0 Food |
|-----|-----------|----------|-------|---------|-----------|----------|--------|
| Easy/Passive | Easy | No actions | **35** | **VICTORY** | 17-29 | 0 | 1 |
| Easy/Builder | Easy | Build | **26** | survived | 18-25 | 7 | 0 |
| Normal/Balanced | Normal | Build+recruit | **26** | survived | 15-28 | 3 | 1 |
| Normal/Military | Normal | Recruit only | **28** | survived | 20-35 | 0 | 1 |
| Hard/Passive | Hard | No actions | **33** | survived | 5-21 | 4 | 0 |
| Hard/Builder | Hard | Build | **26** | survived | 14-24 | 3 | 0 |

### Comparison: Before vs After

| Run | Before (turns) | After (turns) | Improvement |
|-----|---------------|--------------|-------------|
| Easy/Passive | 13 (softlock) | **35 (VICTORY)** | +22 turns, game completable |
| Easy/Builder | 8 (crash) | **26 (survived)** | +18 turns, no crash |
| Normal/Balanced | 11 (softlock) | **26 (survived)** | +15 turns |
| Normal/Military | 11 (softlock) | **28 (survived)** | +17 turns |
| Hard/Passive | 12 (game over) | **33 (survived)** | +21 turns, no death spiral |
| Hard/Builder | 9 (softlock) | **26 (survived)** | +17 turns |

### Key Improvements
- **Zero crashes** across all 6 runs (was 1 crash + 4 softlocks)
- **Easy/Passive achieves VICTORY** -- game is completable end-to-end
- **Hard mode playable** -- Hard/Passive survives 33 turns (was 12)
- **No food death spirals** -- max 1 turn at 0 food (was multiple turns)
- **Population stable** -- all runs maintain 5+ population (was dropping to 0)
- **Garrison sustainable** -- no instant cascade from 5 to 0
