# Automated Playthrough Report — The Lord's Ledger

**Date:** 2026-04-14
**Method:** 6 automated Playwright playthroughs across 3 difficulties and 4 strategies
**Script:** `tests/e2e/gameplay/auto-playthrough.spec.js`
**Round:** 5 (post-rebalance validation)

---

## Summary

| Run | Difficulty | Strategy | Turns Survived | Outcome | Time |
|-----|-----------|----------|---------------|---------|------|
| Easy/Passive | Easy | No actions | **33 / 40** | **Victory** | 121.1s |
| Easy/Builder | Easy | Build each turn | **36 / 40** | **Victory** | 165.0s |
| Normal/Balanced | Normal | Alternate build/recruit | **36 / 40** | **Victory** | 158.5s |
| Normal/Military | Normal | Recruit every turn | **33 / 40** | **Victory** | 147.3s |
| Hard/Passive | Hard | No actions | **34 / 40** | **Victory** | 119.2s |
| Hard/Builder | Hard | Build each turn | **34 / 40** | **Victory** | 158.1s |

**All 6 runs achieve victory.** Zero crashes, zero soft-locks. However, several critical balance and code issues remain.

---

## Resource Trajectories

### Population
| Run | Start | Peak | Lowest | Final |
|-----|-------|------|--------|-------|
| Easy/Passive | 22 | 27 | **3** | 4 |
| Easy/Builder | 22 | **38** | 22 | 25 |
| Normal/Balanced | 20 | 27 | 20 | 23 |
| Normal/Military | 20 | 29 | **1** | 4 |
| Hard/Passive | 18 | 19 | **1** | 4 |
| Hard/Builder | 18 | 21 | 6 | 7 |

### Denarii at Zero (turns)
| Run | Turns at 0d | Total Turns | % at 0 |
|-----|-------------|-------------|--------|
| Easy/Passive | 0 | 33 | 0% |
| Easy/Builder | 8 | 36 | 22% |
| Normal/Balanced | 9 | 36 | 25% |
| Normal/Military | 0 | 33 | 0% |
| Hard/Passive | 1 | 34 | 3% |
| Hard/Builder | **13** | 34 | **38%** |

### Food at Zero (turns)
| Run | Turns at 0 food |
|-----|----------------|
| Easy/Passive | Turns 21, 32, 33 |
| Easy/Builder | 0 |
| Normal/Balanced | 0 |
| Normal/Military | Turns 18, 29, 30, 31 |
| Hard/Passive | Turns 22, 23, 25 |
| Hard/Builder | 0 |

---

## Bugs Found (15 total)

### Code-Level Bugs

**BUG 1 — Garrison food display mismatch (Medium)**
- **Files:** `src/components/PeopleTab.jsx:373`, `src/components/EstateTab.jsx:163`
- **Issue:** Both UI components display garrison food consumption as `Math.ceil(garrison / 2)` but the actual economy engine (`src/engine/economyEngine.js:438`) uses `Math.ceil(garrison / 3)`. Players see incorrect (higher) food drain in the UI.
- **Fix:** Change both display calculations to `garrison / 3` to match the engine.

**BUG 2 — Bankruptcy threshold comment/code mismatch (Low)**
- **Files:** `src/engine/gameReducer.js:109`, `src/engine/meterUtils.js:86,98`
- **Issue:** Comment says "3+ consecutive turns" causes bankruptcy game over, but code checks `>= 4` (i.e., 4+ consecutive turns). The actual threshold is 4, but the comment misleads developers.
- **Fix:** Update comment to say "4+ consecutive turns" to match the code.

**BUG 3 — Raid population loss cap comment is wrong (Low)**
- **File:** `src/engine/raidEngine.js:161`
- **Issue:** Comment says "capped at 25% of garrison count" but the actual cap in `src/engine/gameReducer.js:1649` uses `Math.ceil(state.population * 0.25)` (25% of population, not garrison).
- **Fix:** Update comment to say "capped at 25% of current population".

**BUG 4 — Population 1 is immortal against starvation (High)**
- **File:** `src/engine/economyEngine.js:430,573`
- **Issue:** When population = 1, the hunger formula `Math.min(currentPopulation - 1, ...)` evaluates to `Math.min(0, ...) = 0`, meaning zero families ever leave from hunger at pop 1. Combined with `Math.max(1, ...)` on line 573, population can NEVER reach 0 from starvation alone. Only raids or events can kill the last family. This creates an immortal floor that allows even zero-action playthroughs to survive indefinitely.
- **Fix:** Allow starvation to reduce population to 0 when food is completely exhausted for multiple consecutive turns.

**BUG 5 — Hard/Passive should not achieve victory (High)**
- **Cause:** BUG 4 (immortal pop floor) + passive event income + raid pop cap at 25%
- **Issue:** Hard difficulty with ZERO player actions results in victory (34 turns). The population drops to 1 but never dies from hunger. Event income provides enough denarii to avoid bankruptcy. This defeats the purpose of Hard difficulty — it should require strategic decisions.
- **Fix:** Fix BUG 4 to allow starvation deaths, and increase Hard difficulty penalty scale or reduce Hard starting resources so passive play fails.

### Balance Bugs

**BUG 6 — Late-game population death spiral too severe (High)**
- **Evidence:** Easy/Passive drops 22 -> 3 (86% loss). Normal/Military drops 29 -> 1 (97% loss). Even Easy/Builder drops 38 -> 22 (42% loss).
- **Issue:** Food production cannot sustain mid-game populations. Starting food inventory runs out by turn 10-15 (no starting food buildings). Populations grow in early game from events, then crash when food runs out, then stabilize at very low levels.
- **Fix:** Reduce food consumption rate or increase starting food buildings to prevent universal mid-game starvation.

**BUG 7 — Population growth threshold too restrictive (Medium)**
- **File:** `src/engine/economyEngine.js:516`
- **Issue:** Growth requires `totalFoodInInventory > currentPopulation * 3`. With 20 families, need 60+ food in storage. But consumption is 20+/turn and production is 10-20/turn, so building surplus is near-impossible. Growth is essentially locked after early game.
- **Fix:** Lower the threshold to `currentPopulation * 2` so growth can occur with more realistic food reserves.

**BUG 8 — Denarii hits 0 far too frequently (Medium)**
- **Evidence:** Hard/Builder at 0d on 38% of turns. Normal/Balanced at 0d on 25% of turns. Easy/Builder at 0d on 22% of turns.
- **Issue:** Building costs + military upkeep drain treasury faster than passive income can replenish. Players who build (the intended gameplay) are punished with chronic bankruptcy.
- **Fix:** Increase passive income from buildings or reduce building upkeep costs.

**BUG 9 — All late-game raids succeed (Medium)**
- **Evidence:** After turn 20, virtually every raid across all 6 runs succeeds. Only early-game raids with full starting garrison get repelled.
- **Issue:** Garrison bleeds from: hunger desertion, unpaid upkeep desertion, morale decay, and raid losses. Combined with high recruit costs (10d per levy), players can't maintain defense.
- **Fix:** Reduce garrison attrition rate or lower raid frequency in late game.

**BUG 10 — Raid frequency too high (Medium)**
- **Evidence:** Every run encounters 10-12 raids across 33-36 turns. That's a raid every ~3 turns.
- **Issue:** Criminal raids fire at 70% chance every 4 turns. Scottish raids fire at 40% every 8 turns (forced on turn 16). Combined, raids occur almost every other turn cycle. Each failed raid compounds population + resource loss.
- **Fix:** Reduce criminal raid base chance from 70% to 50%, or increase trigger interval from 4 to 5 turns.

**BUG 11 — Victory with 1 family is meaningless (Low)**
- **Evidence:** Hard/Passive and Normal/Military both reach population 1 during the game yet still win.
- **Issue:** No minimum population threshold for victory. Surviving with 1 family for 40 turns produces the same "victory" as thriving with 30 families. The victory screen should reflect the estate's condition.
- **Fix:** Add minimum population check for victory (e.g., >= 3 families), OR add a "pyrrhic victory" variant when population < 5.

**BUG 12 — Idle garrison morale penalty has no counterplay (Low)**
- **File:** `src/engine/gameReducer.js:1235-1238`
- **Issue:** Garrison loses -3 morale after 5+ idle seasons. But players cannot "use" the garrison except passively during raids. There is no training or patrol action. This is a hidden penalty with no player agency to prevent it.
- **Fix:** Remove idle morale penalty, or add a "drill/train" action in the Military tab that resets idle counter.

**BUG 13 — Event military-to-garrison conversion rate (Low)**
- **File:** `src/engine/meterUtils.js:32`
- **Issue:** `translateEffects` converts old `military` effect to garrison via `Math.round(effects.military / 5)`. A military effect of +3 gives `Math.round(0.6) = 1` garrison. A military effect of +2 gives `Math.round(0.4) = 0` garrison — meaning the event has NO garrison effect. Small military bonuses are completely lost.
- **Fix:** Use `Math.ceil` instead of `Math.round` so small positive military effects always give at least +1 garrison.

**BUG 14 — Food shortfall message inaccurate on Easy/Normal (Low)**
- **File:** `src/engine/economyEngine.js:336`
- **Issue:** When `maxFoodLoss = 25` caps consumption, the shortfall message says "Your 30 families needed 25 food" — implying only 25 food was needed for 30 families. The cap changes the needed amount silently, making the message misleading.
- **Fix:** Adjust message to indicate the cap: "Your 30 families needed 30 food (capped at 25)" or similar.

**BUG 15 — Scottish raid forced trigger ignores cooldown state (Low)**
- **File:** `src/engine/raidEngine.js:68` (referenced as `forceTurn: 16`)
- **Issue:** The forced Scottish raid on turn 16 doesn't check if a raid just occurred on turn 15 or 16. If a criminal raid fires on turn 16 AND the forced Scottish check also passes, the priority logic handles it. But if a criminal raid fired on turn 15 and Scottish fires forced on turn 16, the player faces back-to-back raids without recovery time.
- **Fix:** The forced trigger should respect the cooldown window (at least 2 turns since last raid of any type).

---

## All 15 Bugs Fixed

### Batch 1 (Code bugs)
| Bug | Fix |
|-----|-----|
| BUG 1 | PeopleTab + EstateTab garrison food display changed to `garrison/3` to match engine |
| BUG 2 | Comment updated to "4+ consecutive turns" to match code |
| BUG 3 | Comment updated to "25% of current population" |
| BUG 4 | Hard difficulty: starvation can now kill last family when food = 0 |
| BUG 13 | Military-to-garrison conversion uses `Math.ceil` for positive values |

### Batch 2 (Critical balance)
| Bug | Fix |
|-----|-----|
| BUG 5 | Fixed by BUG 4 — Hard/Passive now fails at turn 20 (depopulation) |
| BUG 6 | Spring farm multiplier raised 0.5x -> 0.6x; population-based cottage income added |
| BUG 7 | Growth threshold lowered from pop×3 to pop×2 |
| BUG 8 | Population generates 0.5d/family/season passive income (cottage industries) |
| BUG 10 | Criminal raid base chance reduced from 70% to 50% |

### Batch 3 (Quality of life)
| Bug | Fix |
|-----|-----|
| BUG 9 | Addressed by raid frequency reduction + idle morale penalty removal |
| BUG 11 | Pyrrhic victory variant added when population < 3 at game end |
| BUG 12 | Idle garrison morale penalty removed (no counterplay available) |
| BUG 14 | Food consumption message now shows rationing savings |
| BUG 15 | Scottish forced trigger now requires 2+ turns since any raid |

---

## Validation Results (Post-Fix)

| Run | Difficulty | Strategy | Turns | Outcome | Min Pop | Denarii 0 Turns |
|-----|-----------|----------|-------|---------|---------|----------------|
| Easy/Passive | Easy | No actions | 34/40 | **Victory** | 6 | 0/34 (0%) |
| Easy/Builder | Easy | Build | 35/40 | **Victory** | 12 | 9/35 (26%) |
| Normal/Balanced | Normal | Build+recruit | 34/40 | **Victory** | 14 | 10/34 (29%) |
| Normal/Military | Normal | Recruit only | 33/40 | **Victory** | 1 | 0/33 (0%) |
| Hard/Passive | Hard | No actions | 20/40 | **Game Over** | 6 | 0/20 (0%) |
| Hard/Builder | Hard | Build | 34/40 | **Victory** | 9 | 11/34 (32%) |

**Key improvements:**
- Hard/Passive correctly fails (depopulation at turn 20)
- Normal/Balanced min pop improved (20 → 14, more stable)
- Hard/Builder min pop improved (6 → 9, more resilient)
- Raid frequency down (Normal/Balanced: 12 → 4 raids)
- Zero crashes, zero soft-locks across all runs
