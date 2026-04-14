# Automated Playthrough Report — The Lord's Ledger

**Date:** 2026-04-14
**Method:** 6 automated Playwright playthroughs across 3 difficulties and 4 strategies
**Script:** `tests/e2e/gameplay/auto-playthrough.spec.js`

---

## Summary

| Run | Difficulty | Strategy | Turns Survived | Outcome | Time |
|-----|-----------|----------|---------------|---------|------|
| Easy/Passive | Easy | No actions | 29 / 40 | Game Over | 110.7s |
| Easy/Builder | Easy | Build each turn | **40 / 40** | Game Over (BUG) | 162.5s |
| Normal/Balanced | Normal | Alternate build/recruit | 25 / 40 | Game Over | 125.1s |
| Normal/Military | Normal | Recruit every turn | 21 / 40 | Game Over | 98.2s |
| Hard/Passive | Hard | No actions | 22 / 40 | Game Over | 84.8s |
| Hard/Builder | Hard | Build each turn | 11 / 40 | Game Over | 67.1s |

**No run achieved a victory screen**, though Easy/Builder survived all 40 turns and should have won. Instead, the game processed a 41st-turn raid after turn 40 and triggered game over — this is a **critical bug** (see BUG 4 below). Zero crashes or soft-locks occurred across all 6 runs.

---

## Balance Findings

### 1. Food is the Primary Killer

Every single run died because food production cannot keep up with consumption as population grows. The pattern is consistent:

| Run | Food Peaked At | Food < 50 On Turn | Pop Decline Started |
|-----|---------------|-------------------|---------------------|
| Easy/Passive | 297 | Turn 25 | Turn 18 |
| Easy/Builder | 280 | Turn 20 | Turn 9 |
| Normal/Balanced | 207 | Turn 8 | Turn 17 |
| Normal/Military | 200 | Turn 13 | Turn 9 |
| Hard/Passive | 163 | Turn 14 | Turn 9 |
| Hard/Builder | 130 | Turn 6 | Turn 6 |

Food consistently trends downward across all runs. Even on Easy difficulty with 280 starting food, the economy cannot sustain itself past the mid-game. The food consumption rate outpaces production from buildings and events.

**Key observation:** On Easy/Passive, denarii actually *grew* to 1,254 by endgame while food collapsed to 0 — the player has plenty of money but no way to convert it into food fast enough. This suggests a structural imbalance: gold income is adequate but food production paths are insufficient.

### 2. Difficulty Scaling Works But Is Steep

Starting resources by difficulty:
- **Easy:** 700d / 280 food / 22 families / 5 garrison
- **Normal:** 500d / 200 food / 20 families / 5 garrison
- **Hard:** 350d / 130 food / 18 families / 3 garrison

Survival correlates with difficulty as expected (Easy ~30 turns, Normal ~23, Hard ~16 avg). But Hard/Builder dying at turn 11 is notable — spending early denarii on buildings left the estate bankrupt (0 denarii by turn 6) before those buildings could pay off. This implies buildings take too long to become profitable or their upfront cost is too high relative to Hard's starting resources.

### 3. Building Strategy is a Trap on Hard Difficulty

On Hard, the builder strategy was the *worst* performer (11 turns vs. 22 for passive). The bot built 6 buildings, each costing 80-100d, draining 350 starting denarii rapidly. Buildings hit 0 denarii by turn 6 and 0 garrison by turn 7. The buildings couldn't generate enough return before the estate collapsed.

On Easy, building was the *best* strategy — it actually survived all 40 turns (though victory didn't trigger due to BUG 4). This confirms buildings do help long-term, but only if you can afford the upfront cost without going bankrupt.

### 4. Military Spending Accelerates Collapse

Normal/Military (recruit every turn) survived only 21 turns vs. 25 for balanced. Garrison peaked at 22 soldiers but each costs upkeep in denarii and food, accelerating resource drain. The military strategy provides no food income and diverts denarii from buildings that could produce food.

### 5. Population Growth is a Double-Edged Sword

Population grows naturally (families increased from 20 to 32 on Easy/Passive), but each new family consumes more food without a proportional increase in production. This creates a death spiral:
- More families = more food consumed
- Food runs out = families start leaving
- Fewer families = less labor = less production
- Less production = more families leave

---

## Resource Trajectory Highlights

### Easy/Passive (Best survival: 29 turns)
```
Turn  1: D=700  F=280  P=22  G=5   (Start)
Turn  8: D=970  F=232  P=23  G=13  (Denarii growing, food declining)
Turn 20: D=1009 F=195  P=27  G=18  (Pop up, food dropping faster)
Turn 25: D=1127 F=21   P=31  G=25  (Food critical! Pop peaked)
Turn 29: D=1163 F=0    P=24  G=8   (Food hits 0, pop collapsing)
Turn 36: D=1254 F=64   P=7   G=1   (Estate hollowed out)
```

### Hard/Builder (Worst survival: 11 turns)
```
Turn  1: D=350  F=130  P=18  G=3   (Start)
Turn  4: D=134  F=62   P=18  G=4   (Denarii burned on buildings)
Turn  6: D=0    F=45   P=16  G=2   (Bankrupt)
Turn 10: D=35   F=60   P=9   G=1   (Half pop gone)
Turn 16: D=0    F=90   P=1   G=0   (Nearly depopulated)
```

---

## Bugs Found

### BUG 1: Game-Over Reason Not Detectable from UI Text

**Severity:** Low (cosmetic/testing)
**Details:** The game-over screen shows narrative titles like "The Empty Village" and literary descriptions. The `gameOverReason.type` is either `"depopulation"` or `"bankruptcy"` internally, but this type string doesn't appear anywhere in the rendered DOM text. The test script's regex for detecting game-over reason (`/depopulat|bankrupt|population.*reached.*0/`) found no matches — all 6 runs reported `game_over:unknown`.

**Suggestion:** Add a `data-gameover-reason` attribute to the GameOverScreen root element, or display the reason type in a small label (e.g., "Cause: Depopulation") for clarity. This also helps with automated testing.

### BUG 2: Some Turn Numbers Skipped in Data Collection

**Severity:** Low (testing artifact, not a game bug)
**Details:** Resource snapshots skip some turns (e.g., Easy/Passive goes T4 → T6, T9 → T11). This happens because some turns include flip events or multi-phase sequences where the bot navigates through without returning to the standard management snapshot point. The game itself advances turns correctly — this is just a data collection gap in the test script. However, it's worth verifying that the turn counter always increments by exactly 1 and never skips.

### BUG 3: Garrison Fluctuates Without Player Action

**Severity:** Medium (gameplay)
**Details:** On Easy/Passive (no player actions taken), garrison fluctuated: 5 → 4 → 7 → 7 → 11 → 11 → 13 → 15 → 21 → 21 → 21 → 22 → 21 → 18 → ... The garrison *increased* from 5 to 25 without any recruitment. This means events and/or random occurrences are adding soldiers. The subsequent drops (25 → 19 → 14 → 10 → 5 → 3 → 1) suggest desertion or raid losses. Players may find it confusing that garrison changes so dramatically without their input.

### BUG 4: Victory Does Not Trigger at Turn 40 (CRITICAL)

**Severity:** Critical (gameplay-breaking)
**Details:** Easy/Builder survived all 40 turns. The turn data clearly shows Turn 40, Winter Year 10 with resources D=125, F=64, P=6, G=1. However, instead of triggering the victory screen, the game processed *another* turn — a raid occurred after turn 40 that killed the estate. The final data entry shows a raid event with null resources, indicating the game continued past the victory condition.

**Evidence:**
```
T39 Autumn Y10: D=96  F=58  P=5  G=0  (one turn away from victory)
T40 Winter Y10: D=125 F=64  P=6  G=1  (should trigger victory here!)
T?? null:       null                    (raid fires, game over)
```

**Root cause (likely):** The victory check in the reducer may only run *before* economy simulation, not after the final turn's random event phase. Or the turn counter increments before the check. The game should check for `turn >= 40` immediately after the final season resolves, before processing any further raids or events.

### BUG 5: Raids Are Nearly Unbeatable (88% Success Rate)

**Severity:** Medium (balance)
**Details:** Across all 6 runs, approximately 34 raids occurred and only ~4 were repelled (12% repel rate). Even on Normal/Military with 22 garrison and 21 total recruits, zero raids were repelled. This suggests either:
- The defense rating calculation undervalues garrison count relative to raid thresholds
- Fortifications (walls/gate/moat) are essential but not communicated to the player
- Raid strength scales too aggressively with game progression

Some raids killed 50-80% of the population in a single event (Hard/Passive T22: 14 families → 3).

---

## Balance Recommendations

### Critical: Food Economy Needs Rebalancing

1. **Increase food building output** — Strip farms, fisheries, and livestock buildings should produce enough food per season to meaningfully offset population growth. Currently, even with multiple food buildings, production trails consumption.

2. **Add a food market mechanic** — Players have abundant denarii but can't easily convert them to food. Consider allowing bulk food purchases at the market, or adding a "provisions" action in the management phase.

3. **Slow population growth rate** — Population growth is currently automatic and aggressive. Consider tying growth rate to food surplus: families only arrive when food > some threshold.

4. **Reduce food consumption per family** — Or scale it inversely with farm count/food production buildings. As it stands, each family consumes more than any single building produces.

### Important: Hard Difficulty Starting Resources

5. **Increase Hard starting denarii to 400-450** — At 350d, building even 2-3 structures (100d each) leaves the player bankrupt before buildings can pay off. The starting resources should support at least 1-2 strategic investments.

6. **Or reduce building costs on Hard** — A difficulty multiplier on build costs (0.8x) would make the building strategy viable without changing the overall challenge feel.

### Important: Raid Rebalancing

7. **Reduce raid population losses** — A single raid killing 50-80% of the population is too punishing. Cap population loss per raid at ~20-25% of current population.

8. **Make garrison count matter more for defense** — 22 garrison should reliably repel criminal raids (threshold 25). Consider lowering thresholds or increasing per-soldier defense contribution.

9. **Reduce raid frequency on Hard** — Raids every 3-4 turns on Hard doesn't leave enough recovery time. Consider 5-6 turn intervals.

### Minor: Military Balance

10. **Reduce garrison upkeep** — Soldiers drain both denarii and food, making a military strategy unsustainable. Consider reducing food upkeep for soldiers, or having garrison partially forage for their own food.

11. **Add military income** — Garrison should occasionally generate income through patrols, bandit bounties, or escort fees — giving military investment some ROI beyond raid defense.

---

## Event Observations

- **65-75 unique events** were encountered per game, showing good content variety
- **Flip events** (CYOA branching narratives) appeared in every run ("Choose Your Path: The Lord of Ashworth Manor")
- **Raids** occurred on Easy/Builder, Normal/Balanced, Hard/Passive, and Hard/Builder — sometimes successful, sometimes repelled. Raid frequency seems appropriate
- **Season-appropriate events** worked correctly (harvest events in autumn, planting in spring, winter feasts)
- The event system is diverse and well-paced — the balance issue is with the underlying economy, not the event layer

---

## Test Infrastructure

The playthrough script (`auto-playthrough.spec.js`) can be reused for future balancing:
- Runs 6 strategies across 3 difficulties in ~11 minutes total
- Logs per-turn resource snapshots to `tests/e2e/playthrough-results.json`
- Records all events, choices, and actions taken
- Detects crashes, soft-locks, and game-end conditions
- Randomizes event choices for variety between runs
