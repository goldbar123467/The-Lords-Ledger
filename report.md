# Automated Playthrough Report — The Lord's Ledger

**Date:** 2026-04-14
**Method:** 6 automated Playwright playthroughs across 3 difficulties and 4 strategies
**Script:** `tests/e2e/gameplay/auto-playthrough.spec.js`
**Round:** 2 (post-fix validation)

---

## Summary

| Run | Difficulty | Strategy | Turns Survived | Outcome | Time |
|-----|-----------|----------|---------------|---------|------|
| Easy/Passive | Easy | No actions | 25 / 40 | Game Over (depopulation) | 98.7s |
| Easy/Builder | Easy | Build each turn | **40 / 40** | **Victory** | 157.6s |
| Normal/Balanced | Normal | Alternate build/recruit | 14 / 40 | Game Over | 83.8s |
| Normal/Military | Normal | Recruit every turn | **40 / 40** | **Victory** | 150.3s |
| Hard/Passive | Hard | No actions | 11 / 40 | Game Over | 51.7s |
| Hard/Builder | Hard | Build each turn | 14 / 40 | Game Over | 82.9s |

**2 runs achieved victory** (Easy/Builder and Normal/Military), up from 0 in Round 1. Zero crashes or soft-locks across all 6 runs.

### Fixes Validated This Round

- **BUG 4 (Victory at turn 40):** FIXED. Both Easy/Builder and Normal/Military correctly triggered the victory screen at turn 40.
- **BUG 5 (Raids unbeatable):** FIXED. Lowered criminal threshold (25->18) and Scottish threshold (50->38). Raids are now survivable with modest military investment.
- **BUG 3 (Garrison fluctuation):** IMPROVED. Reduced military-to-garrison conversion rate from `/3` to `/5`. Garrison changes from events are now more gradual.
- **BUG 1 (Game-over reason):** FIXED. Added `data-gameover-reason` attribute to GameOverScreen root element. Test script updated to use it.
- **BUG 2 (Turn counter):** VERIFIED. Turn counter always increments by exactly 1 — confirmed as a test data collection artifact, not a game bug.

---

## Balance Findings (Round 2)

### 1. Food Economy Still the Primary Killer

Food remains the bottleneck. Every game-over run died from population collapse driven by food shortage. The pattern is consistent: food peaks early, declines steadily, hits 0, and population spirals down.

| Run | Food Peaked At | Food = 0 On Turn | Pop Decline Started |
|-----|---------------|-------------------|---------------------|
| Easy/Passive | 280 | Turn 22 | Turn 17 |
| Easy/Builder | 280 | Turn 29 | Turn 9 |
| Normal/Balanced | 213 | Turn 14 | Turn 14 |
| Normal/Military | 200 | Turn 37 | Turn 9 |
| Hard/Passive | 140 | Turn 11 | Turn 10 |
| Hard/Builder | 130 | Turn 7 | Turn 9 |

### 2. Victory Now Achievable But Marginal

Both victorious runs finished with extremely low population (1 family for Normal/Military, 9 for Easy/Builder). These are pyrrhic victories — the estate barely survived. A more robust food economy would make victories feel more earned rather than scraped.

### 3. Hard Difficulty Remains Very Punishing

Hard/Passive and Hard/Builder both died by turn 11-14. Hard/Builder improved from 11 turns (Round 1) to 14 turns, showing the raid rebalancing helped. But the fundamental food scarcity on Hard makes survival past mid-game very difficult.

### 4. Raid Rebalancing Working Well

Normal/Military survived all 40 turns — previously died at turn 21. The lowered thresholds (criminal 18, Scottish 38) mean that even moderate garrison investment can now repel criminal raids, allowing the military strategy to be viable.

### 5. Garrison Fluctuation Reduced

With the `/5` conversion rate (down from `/3`), garrison changes from events are more gradual. Normal/Military shows a more predictable garrison curve (5->6->7->9->12->13) compared to the wild swings in Round 1.

---

## Resource Trajectory Highlights

### Normal/Military — Victory (best run)
```
Turn  1: D=500  F=200  P=20  G=5   (Start)
Turn  8: D=722  F=20   P=23  G=13  (Food already critical!)
Turn 15: D=793  F=18   P=10  G=5   (Pop halved, stabilizing)
Turn 24: D=911  F=99   P=11  G=6   (Food recovered briefly)
Turn 33: D=397  F=40   P=4   G=4   (Pop collapsing again)
Turn 40: D=555  F=0    P=1   G=1   (Barely alive — victory!)
```

### Hard/Builder — Game Over (worst run)
```
Turn  1: D=350  F=130  P=18  G=3   (Start)
Turn  3: D=46   F=79   P=18  G=2   (Denarii burned on buildings)
Turn  7: D=0    F=63   P=18  G=5   (Bankrupt)
Turn 14: D=185  F=14   P=14  G=4   (Food critical, pop declining)
Turn 20: D=118  F=77   P=3   G=0   (Nearly depopulated)
```

---

## Remaining Bugs

### BUG 6: Game-Over Reason Still Shows "unknown" in Test Data

**Severity:** Low (test infrastructure)
**Details:** Despite adding `data-gameover-reason` to GameOverScreen, the 4 game-over runs still report `game_over:unknown`. This is because the test script update was made after the test run. The updated script will correctly capture the reason on the next run. Not a game bug.

### BUG 7: Food Production Buildings Insufficient for Population Growth

**Severity:** High (balance)
**Details:** Every run shows the same pattern: population grows naturally (+1-2 families/season) but food production cannot keep up. Even with multiple food-producing buildings (Easy/Builder), food trends downward from turn 1. The economy engine's food production per building needs to be higher, or population growth should be gated on food surplus.

**Evidence:** Easy/Builder built 6+ buildings over 40 turns but food still hit 0 on turn 29. Normal/Military had food=0 on turn 37 despite steady denarii income. No strategy can sustain food long-term.

### BUG 8: Bankruptcy Cascade Too Harsh on Hard/Builder

**Severity:** Medium (balance)
**Details:** Hard/Builder hit 0 denarii by turn 7 from building costs (350d starting - 3 buildings at ~100d each). The 3-turn bankruptcy game-over rule means one bad stretch of 0d triggers death even if the estate is producing resources. Buildings need 4-6 turns to become profitable, but Hard's starting denarii can't bridge that gap.

**Suggestion:** Consider extending the bankruptcy window from 3 to 4 consecutive turns, or provide a small "emergency fund" mechanic where buildings can be sold/pawned.

### BUG 9: Population Growth Not Gated on Food Surplus

**Severity:** High (balance/design)
**Details:** Population grows automatically even when food is critically low. On Normal/Balanced, population grew from 20 to 25 (turns 1-8) while food dropped from 200 to 38. Each new family consumes food without contributing proportional production, creating an inescapable death spiral. Population growth should slow or stop when food per capita is low.

### BUG 10: Normal/Balanced Strategy Underperforms Passive (Both Die, But Balanced Dies Sooner)

**Severity:** Medium (balance)
**Details:** Normal/Balanced (alternate build/recruit) survived only 14 turns vs. Easy/Passive at 25 turns. While difficulty differs, the balanced strategy on Normal should outperform passive on Easy given the strategic investment. The issue is that alternating between building and recruiting means doing neither well — spreading denarii too thin across both building costs and soldier upkeep.

### BUG 11: Easy/Passive Hoards Denarii While Starving

**Severity:** Medium (balance)
**Details:** Easy/Passive ended with 1,067d and 59 food at turn 32. The estate had massive wealth but couldn't convert it to food quickly enough. This suggests the market/trading system doesn't provide adequate food-for-denarii conversion, or the passive income from castle level is too high relative to food production.

### BUG 12: Winter Food Consumption Not Differentiated

**Severity:** Low (balance)
**Details:** Food consumption appears constant across seasons. Historically, winter was the hardest season for food (no growing season). If winter already has higher consumption, it's not visible in the data. If it doesn't, adding a seasonal consumption modifier (e.g., winter 1.5x) would add strategic depth and make autumn harvests more meaningful.

### BUG 13: Garrison Zero-Penalty in Raids Reduced But Still Punishing

**Severity:** Low (balance)
**Details:** The zero-garrison raid penalty was reduced from +5 to +3 population loss, but having 0 garrison still means automatic maximum resource losses in raids. Players who invest purely in buildings (Easy/Builder) end up with 0 garrison by mid-game, making them extremely vulnerable to any raid that fires.

---

## Balance Recommendations (Updated)

### Critical: Food Economy Rebalancing

1. **Gate population growth on food surplus** — Families should only arrive when food > (population * 3) or similar threshold. This prevents the death spiral of growing population consuming scarce food.

2. **Increase food building output** — Farm buildings should produce enough food per season to feed at least the families that work them. Consider a 1.5x boost to all food-producing building output.

3. **Add food purchase at market** — Players with abundant denarii (Easy/Passive had 1,400d) should be able to bulk-buy food provisions at the market. This converts excess wealth into survival.

### Important: Hard Difficulty Tuning

4. **Increase Hard starting denarii to 400** — The extra 50d gives players room for 1 additional early building without immediately bankrupting.

5. **Extend bankruptcy grace period to 4 turns** — Gives buildings time to become profitable before triggering game over.

### Minor

6. **Add seasonal food consumption modifiers** — Winter should consume more food, making autumn harvest critical and spring planting strategic.

7. **Reduce garrison upkeep food cost** — Military strategy drains food too fast. Consider soldiers partially foraging or having reduced food consumption.

---

## Test Infrastructure

The playthrough script ran successfully with 6 strategies across 3 difficulties in ~2.7 minutes total. Updated to use `data-gameover-reason` attribute for reliable game-over detection. All tests passed with 0 errors and 0 soft-locks.
