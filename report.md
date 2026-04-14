# The Lord's Ledger - Playtest Bug & Balance Report

## Test Methodology

6 automated Playwright playthroughs across all difficulty levels and strategy archetypes.
Date: 2026-04-14, Playwright 1.59.1, Chromium headless.

| Run | Difficulty | Strategy | Turns | Outcome | Time |
|-----|-----------|----------|-------|---------|------|
| 1 | Hard | Passive | 36 | Game Over (depopulation) | 149s |
| 2 | Normal | Military | 29 | Softlock (sim button missing) | 149s |
| 3 | Easy | Passive | 37 | Softlock (possible) | 180s |
| 4 | Hard | Builder | 30 | Softlock (possible) | 181s |
| 5 | Easy | Builder | 28 | Softlock (possible) | 181s |
| 6 | Normal | Balanced | 27 | Crash (toast intercepts clicks) | 300s |

**Only 1 of 6 runs reached a natural game ending.** The rest hit softlocks or crashes.

---

## Bugs Found (25)

### Critical - Softlocks & Crashes

**BUG-01: SynergyToast Tier1 blocks Simulate Season button clicks**
- File: `src/components/SynergyToast.jsx` (Tier1Toast, lines 10-57)
- The toast is `fixed z-50` and intercepts pointer events even while fading (opacity transitions from 1 to 0 over 400ms, but the element stays in DOM). The Simulate Season button is at `z-30`. During the 5.4s window the toast exists, all clicks on the simulate button are intercepted.
- Caused Normal/Balanced run to fully crash with timeout.
- Fix: Add `pointerEvents: "none"` to the container and `pointerEvents: "auto"` only to the clickable inner area. Or set `pointerEvents: opacity < 0.1 ? "none" : "auto"`.

**BUG-02: SynergyToast Tier2Card never auto-dismisses**
- File: `src/components/SynergyToast.jsx` (Tier2Card, lines 60-111)
- Tier2Card slides in from the right but has NO auto-dismiss timer. It only dismisses on click. If the player doesn't notice it (e.g., during event phases), it persists indefinitely, blocking the right side of the screen.
- Fix: Add a 10-second auto-dismiss timer matching Tier1Toast pattern.

**BUG-03: RAID_CONTINUE does not clear scribesNote, stacking overlays**
- File: `src/engine/gameReducer.js`, RAID_DEFEND (line 1624), RAID_CONTINUE (line 1646)
- RAID_DEFEND sets `scribesNote` for first-time raids. RAID_CONTINUE does not clear it. Both the RaidScreen overlay and ScribesNote overlay render simultaneously. The scribe's note may be behind the raid screen, trapping the player.
- Fix: Add `scribesNote: null` to RAID_CONTINUE return state.

**BUG-04: Event phase dead-end when seasonal event has no options**
- File: `src/App.jsx` lines 596-624, `src/engine/eventSelector.js`
- During `seasonal_action` phase, if `currentEvent` is truthy but has 0 valid options (exhausted event pool returns malformed event), EventCard renders with no choice buttons. No way to progress.
- Fix: Add fallback auto-advance to seasonal_resolve when event has no options array.

**BUG-05: Flip/synergy notification overlap causes input deadlock**
- File: `src/engine/gameReducer.js` ADVANCE_TURN, `src/App.jsx` lines 631-635
- If a perspective flip triggers on the same turn a synergy notification is pending, both FlipScreen and SynergyToast render. The flip screen expects exclusive input, but SynergyToast (z-50) sits above it capturing clicks.
- Fix: Defer pending synergy notifications when entering flip phase (clear them from state, re-queue after flip).

### High - Balance Issues

**BUG-06: No starting food-producing buildings**
- File: `src/engine/gameReducer.js`, initialState (lines 88-93)
- Starting buildings: coal_pit, tannery, sawmill, smelter. Zero food production.
- 20 families * 3 food/season = 60 food consumed. Starting grain 280 (normal) lasts ~4-5 turns with zero production. Players MUST build farms immediately or face starvation. Every single run showed food crises.
- Fix: Add 1 wheat_field and 1 pasture to starting buildings.

**BUG-07: Food consumption vs production structurally imbalanced**
- File: `src/engine/economyEngine.js` lines 315-346, `src/data/economy.js` lines 207-211
- At 40 families: 120 food/season (150 in winter). Wheat field produces 10 grain * 0.5 (winter) = 5 grain. Need 30 farms for winter alone, but only 24 total land plots exist.
- Fix: Reduce FOOD_PER_FAMILY from 3 to 2.

**BUG-08: Estate maintenance cost double-stacks with building upkeep**
- File: `src/engine/economyEngine.js` lines 537-546
- Formula: `buildingCount * 2 + max(0, population - 15) * 0.5` charged ON TOP of per-building upkeep.
- With 15 buildings and 30 pop: 38d extra/season PLUS 30-150d building upkeep. Builder strategy on Easy hit 0d by turn 27 despite 700d start.
- Fix: Reduce multiplier from 2 to 1 and exempt freeUpkeep buildings from the count.

**BUG-09: Garrison upkeep death spiral with no recovery**
- File: `src/engine/economyEngine.js` lines 82-89, 481-492
- When denarii hits 0: unpaid upkeep triggers desertion, lowering defense, making raids more devastating, causing more denarii loss. No escape mechanism exists.
- Fix: Reduce levy upkeep from 2d to 1d and add a 1-season grace period for newly recruited soldiers.

**BUG-10: Bankruptcy threshold (4 turns) spans one winter-spring cycle**
- File: `src/engine/meterUtils.js` lines 91-105
- Game over at 4 consecutive turns of 0 denarii. Winter has lowest income + highest costs. A normal winter-spring dip easily triggers 4 consecutive zero-denarii turns without the player doing anything wrong.
- Fix: Increase threshold from 4 to 6 consecutive turns.

### Medium - Gameplay/Tuning Bugs

**BUG-11: Population growth uncapped, scales into unavoidable famine**
- File: `src/engine/economyEngine.js` lines 556-625
- Population grows 1-2/turn with food surplus + ale. No cap. At 40+ families, food consumption (120+) exceeds max possible production from available land plots.
- Fix: Add soft cap - growth rate halves when population exceeds 35, stops at 50.

**BUG-12: Winter season is quadruple-punishing**
- File: `src/data/economy.js` lines 207-224
- Winter: farm output 0.5x, consumption 1.25x, building degradation 1.5x, no tax income. Creates annual resource valley where bankruptcy/starvation cluster.
- Fix: Reduce winter consumption multiplier from 1.25 to 1.1.

**BUG-13: Quarterly market levy (non-autumn) negligible**
- File: `src/engine/economyEngine.js` lines 515-521
- Non-autumn levy: `Math.floor(population * 0.15)`. With 20 pop = 3d/season. Upkeep alone is 20-60d. The levy is a rounding error.
- Fix: Increase multiplier from 0.15 to 0.25 and add a minimum floor of 5d.

**BUG-14: Building degradation too fast, repair too expensive**
- File: `src/engine/gameReducer.js` building degradation, `src/data/economy.js` REPAIR_COST_PER_POINT
- Buildings degrade 5-10%/season (15% in winter at 1.5x). Reaches "Ruined" in 10-15 turns. Repair at 2d/point means restoring from 50% costs 100d.
- Fix: Reduce repair cost from 2d to 1d per point.

**BUG-15: Raid damage ignores difficulty level**
- File: `src/engine/raidEngine.js`
- Raid resource losses (denarii, food, garrison, population) are identical on Easy, Normal, and Hard. Easy mode players face the same devastating raids.
- Fix: Scale raid losses by difficulty penaltyScale (0.5x Easy, 1.0x Normal, 1.5x Hard).

### Low - Minor Tuning Issues

**BUG-16: RAID_CONTINUE bankruptcy counter double-counts**
- File: `src/engine/gameReducer.js` lines 1726-1732
- After raid, if denarii drops to 0, bankruptcy counter increments. But SIMULATE_SEASON already set the counter for this turn's economy. A bad raid can add +2 to the counter in a single turn.
- Fix: Don't increment bankruptcy counter in RAID_CONTINUE if SIMULATE_SEASON already incremented it this turn.

**BUG-17: No implicit food production from population**
- Population growth benefits the lord (more tax, more levy) but costs more food with zero food production increase. No "more farmers = more food" mechanic.
- Fix: Add +1 grain per 10 families from subsistence farming in production phase.

**BUG-18: Passive income populationIncome doesn't scale enough**
- File: `src/engine/economyEngine.js` line 526
- `Math.floor(population * 0.75)`: 20 pop = 15d, 40 pop = 30d. Upkeep scales faster.
- Fix: Increase to `Math.floor(population * 1.0)`.

**BUG-19: Mill is net-negative food building**
- File: `src/data/buildings.js`, `src/data/economy.js` line 8
- Mill consumes 3 grain, produces flour. Both count equally as food (FOOD_RESOURCES includes flour). Mill adds processing cost for zero food benefit.
- Fix: Make flour count as 1.5x food value, or increase mill output to produce more flour than grain consumed.

**BUG-20: Breadbasket synergy population bonus unreachable**
- File: `src/engine/synergyEngine.js`
- Requires `totalFood > pop * 1.5`. At 30+ pop, need 45+ food surplus AFTER consumption. With production limits, this threshold is nearly impossible.
- Fix: Lower threshold to `pop * 1.0`.

**BUG-21: Watchtower defense bonus invisible to player**
- File: `src/engine/gameReducer.js` lines 1575-1585, 1700-1703
- Watchtower bonus applied to defense rating but not shown in raid chronicle entry. Players can't see the value of their watchtower investment.
- Fix: Include watchtower bonus in buildRaidChronicleText output.

**BUG-22: Event pool exhaustion creates empty decision turns**
- File: `src/engine/eventSelector.js`
- With 40 turns and limited event pools, events repeat or pool empties. When empty, turns have no seasonal decision, feeling hollow.
- Fix: Reset usedSeasonalIds when pool is exhausted (allow repeats after full cycle).

**BUG-23: Ale consumed even during famine (wasted)**
- File: `src/engine/economyEngine.js` lines 561-567, 621-623
- Ale is consumed for morale even when famine cancels any population growth benefit. The ale is wasted.
- Fix: Skip ale consumption when `consumption.shortfall > 0`.

**BUG-24: removeFromGarrison can underflow typed counts to negative**
- File: `src/engine/gameReducer.js` removeFromGarrison function
- If loss exceeds total garrison, individual type counts (levy, menAtArms, knights) can go negative.
- Fix: Clamp each type to `Math.max(0, ...)` after removal.

**BUG-25: No population recovery mechanism below 10 families**
- File: `src/engine/economyEngine.js`
- Once population drops below ~10, passive income drops, making recovery nearly impossible. No wandering settlers or baseline recovery exists below this threshold.
- Fix: Add +1 family chance (40%) when pop < 8, food > 0, and denarii > 0.

---

## Resource Trend Analysis

### Denarii
| Run | Min | Max | Final | Consecutive 0-turns |
|-----|-----|-----|-------|---------------------|
| Hard/Passive | 182 | 919 | 182 | 0 |
| Normal/Military | 496 | 1172 | 1116 | 0 |
| Easy/Passive | 700 | 2327 | 2327 | 0 |
| Hard/Builder | 0 | 400 | 0 | 4 |
| Easy/Builder | 0 | 773 | 107 | 1 |
| Normal/Balanced | 0 | 561 | 105 | 1 |

### Food
| Run | Min | Max | Turns at 0 food |
|-----|-----|-----|-----------------|
| Hard/Passive | 0 | 255 | 6 turns |
| Normal/Military | 0 | 365 | 2 turns |
| Easy/Passive | 30 | 480 | 0 |
| Hard/Builder | 82 | 255 | 0 |
| Easy/Builder | 171 | 480 | 0 |
| Normal/Balanced | 4 | 365 | 0 |

### Population
| Run | Min | Max | Final |
|-----|-----|-----|-------|
| Hard/Passive | 1 | 19 | 1 |
| Normal/Military | 4 | 28 | 4 |
| Easy/Passive | 22 | 40 | 40 |
| Hard/Builder | 17 | 28 | 25 |
| Easy/Builder | 22 | 44 | 44 |
| Normal/Balanced | 20 | 39 | 33 |

---

## Priority Fix Order

1. BUG-01 through BUG-05 (Critical - crashes and softlocks)
2. BUG-06 through BUG-10 (High - balance fundamentals)
3. BUG-11 through BUG-15 (Medium - gameplay tuning)
4. BUG-16 through BUG-20 (Low - minor tuning)
5. BUG-21 through BUG-25 (Low - polish)
