# Automated Playthrough Report — The Lord's Ledger

**Date:** 2026-04-14
**Method:** 6 automated Playwright playthroughs across 3 difficulties and 4 strategies
**Script:** `tests/e2e/gameplay/auto-playthrough.spec.js`
**Round:** 3 (post-balance-tuning validation)

---

## Summary

| Run | Difficulty | Strategy | Turns Survived | Outcome | Time |
|-----|-----------|----------|---------------|---------|------|
| Easy/Passive | Easy | No actions | **40 / 40** | **Victory** | 123.3s |
| Easy/Builder | Easy | Build each turn | **40 / 40** | **Victory** | 163.7s |
| Normal/Balanced | Normal | Alternate build/recruit | 25 / 40 | Game Over (depop) | 128.3s |
| Normal/Military | Normal | Recruit every turn | **40 / 40** | **Victory** | 147.7s |
| Hard/Passive | Hard | No actions | 30 / 40 | Game Over (depop) | 107.9s |
| Hard/Builder | Hard | Build each turn | 18 / 40 | Game Over (depop) | 97.5s |

**3 victories** achieved (up from 2 in Round 2, 0 in Round 1). Game-over reason detection now working correctly (`depopulation` shown instead of `unknown`).

### Progress Across Rounds

| Run | Round 1 Turns | Round 2 Turns | Round 3 Turns | Trend |
|-----|:---:|:---:|:---:|---|
| Easy/Passive | 29 | 25 | **40 (Victory)** | Fixed |
| Easy/Builder | 33 (BUG) | 40 (Victory) | **40 (Victory)** | Fixed |
| Normal/Balanced | 25 | 14 | **25** | Improved |
| Normal/Military | 21 | 34 (Victory) | **33 (Victory)** | Fixed |
| Hard/Passive | 22 | 11 | **30** | Major improvement |
| Hard/Builder | 11 | 14 | **18** | Improved |

---

## Fixes Applied This Round

### BUG 7 (High): Food Building Output Increased
- Strip Farm: 4 -> 6 grain, cost 100 -> 80d
- Demesne Field: 7 -> 10 grain
- Pasture: 3 -> 5 livestock
- Fishpond: 3 -> 5 fish, cost 120 -> 100d

### BUG 9 (High): Population Growth Gated on Food Surplus
- Changed threshold from `food > population` to `food > population * 3`
- Families now only arrive when there's enough food for 3 seasons
- Prevents the death spiral of growing population consuming scarce food

### BUG 8 (Medium): Bankruptcy Grace Period Extended
- Changed from 3 to 4 consecutive turns at 0 denarii
- Gives buildings time to become profitable before game over triggers

### BUG 10 (Medium): Building Costs Reduced for Viability
- Strip Farm cost: 100 -> 80d (most common early building)
- Fishpond cost: 120 -> 100d (alternative food source)
- Makes building strategy viable even on Normal/Hard difficulty

### BUG 11 (Medium): Winter Farm Output Multiplier Raised
- Changed from 0.25x to 0.4x
- Winter is still the worst season but no longer devastating
- Represents stored produce and winter crops (turnips, kale)

---

## Balance Analysis

### 1. Easy Difficulty is Now Well-Balanced
Both Easy runs achieved victory. Easy/Passive winning confirms that the base economy (without any player intervention) can sustain a 40-turn game on Easy. Easy/Builder also won, showing building investment helps but isn't required on Easy.

### 2. Normal Difficulty is Challenging But Winnable
Normal/Military won with 33 turns of active play. Normal/Balanced struggled (died at turn 25), but showed significant improvement from Round 2 (died at turn 14). The balanced strategy needs more tuning — alternating between building and military spreads resources too thin compared to focusing on one.

### 3. Hard Difficulty Remains Very Challenging
Hard/Passive improved dramatically (30 turns, up from 11-22). Hard/Builder improved from 11 to 18 turns. Neither won, which is appropriate for Hard difficulty — it should require skilled play to survive. The food economy is now sustainable longer, but Hard's low starting resources still make the mid-game very tight.

### 4. Population Growth Gate Working Well
The `food > population * 3` threshold prevented runaway population growth. On Hard/Builder, population stayed at 18 from turns 1-16 instead of growing to 25+ and consuming all food. On Easy/Passive, population peaked at 34 (down from 35 in Round 2) and growth only happened when food was genuinely abundant.

### 5. Food Economy Now Sustainable Mid-Game
With increased building output, food now stays above critical levels much longer. Hard/Passive maintained food > 50 through turn 16 (vs. turn 8 in Round 2). Easy/Passive maintained food > 100 through turn 19. The mid-game food crash is less severe, though late-game food scarcity still provides challenge.

---

## Remaining Bugs

### BUG 14: Late-Game Food Collapse Still Occurs on All Difficulties

**Severity:** Medium (balance)
**Details:** Even with improved food production, all runs show a consistent late-game pattern where food drops to 0 between turns 25-35. This happens because:
1. Population reaches 25-33 families, consuming 25-50 food/season
2. Building condition degrades over time, reducing output
3. Raids and events periodically destroy food stores
The food economy is now sustainable through mid-game (good!) but still collapses in the late game.

### BUG 15: Building Condition Degradation Creates Compounding Food Loss

**Severity:** Medium (balance)
**Details:** Buildings degrade 5 points/season (7.5 in winter). Over 40 turns, a building drops from 100 to ~0 condition without repair. At Poor condition (25-49), output drops to 50%. At Ruined (<25), output drops to 0%. This means early-game food buildings produce nothing by late game unless repaired, but the automated bot doesn't repair buildings. While repair is a player decision, the degradation rate may be too aggressive for food buildings specifically.

### BUG 16: Hard/Builder Goes Bankrupt Despite Lower Building Costs

**Severity:** Low (balance)
**Details:** Hard/Builder still hit 0 denarii by turn 7 (down from turn 6 in Round 1). The reduced strip farm cost (80d) helped extend survival from 11 to 18 turns, but the fundamental issue remains: 350d starting denarii minus 3 buildings (80+100+150 = 330d) leaves only 20d. Hard/Builder needs to be more selective about building order.

### BUG 17: Raids Still Depopulate Hard/Builder Despite Lower Thresholds

**Severity:** Low (balance)
**Details:** Hard/Builder lost 11 families between turns 14-18, going from 18 to 7. While garrison was 0, raids still fire and extract population losses. The zero-garrison penalty (3 extra families lost) compounds with base losses to cause devastating depopulation on Hard.

### BUG 18: Normal/Balanced Dies Earlier Than Expected

**Severity:** Medium (balance)
**Details:** Normal/Balanced (alternate build/recruit each turn) survived 25 turns but didn't win. The strategy splits denarii between building costs (~80-200d) and soldier recruitment/upkeep, meaning it does neither well. By turn 7, denarii hit 437d (from 500), and by turn 14 it drops further while both food and garrison are mediocre. The balanced strategy needs either cheaper overall costs or more synergy between building and military.

---

## Test Infrastructure

All 6 tests passed in 2.8 minutes. Game-over reason detection now working correctly via `data-gameover-reason` attribute — all 3 game-over runs correctly report `depopulation` as the cause. Victory detection continues to work for the 3 winning runs.
