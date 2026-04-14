# The Lord's Ledger — Playwright Playtest Report
> Generated: 2026-04-14 | Games: 6 | Method: Headless Playwright + 6th-grader personas

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total games | 6 |
| Victories | 1 (17%) |
| Game Overs | 2 (33%) |
| Stuck/Crashed | 3 |
| Avg turns survived | 16.5/40 |
| Avg playthrough time | 145.5s |

## Per-Persona Results

| Persona | Difficulty | Outcome | Turns | Buildings | Trades | Flips | Synergies | Time |
|---------|-----------|---------|-------|-----------|--------|-------|-----------|------|
| Impulsive Builder | normal | WIN | 33 | 0 | 0 | Yes | 2 | 143.1s |
| War Kid | normal | STUCK | 5 | 0 | 0 | Yes | 1 | 200.6s |
| Cautious Explorer | easy | STUCK | 22 | 0 | 0 | Yes | 3 | 180.5s |
| Random Clicker | normal | LOSS | 22 | 0 | 0 | Yes | 0 | 99.9s |
| Trader Kid | normal | STUCK | 4 | 0 | 0 | No | 0 | 194.3s |
| Speedrunner | hard | LOSS | 13 | 0 | 0 | Yes | 2 | 54.6s |

## Game Over Analysis

### Death Causes

- **famine — The Great Famine**: 2x

### Death Details

- **Random Clicker** (normal): Died at turn 22
  - Reason: famine — The Great Famine
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?
- **Speedrunner** (hard): Died at turn 13
  - Reason: famine — The Great Famine
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?

## Victory Analysis

- **Impulsive Builder** (normal): Won at turn 33
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?
  - Buildings built: 0, Trades: 0

## UX Friction Points

Moments where a 6th grader would get confused, frustrated, or stuck.

### Meter Critically Low (danger zone)
- **Occurrences**: 17
- **Personas affected**: Impulsive Builder, Random Clicker, Speedrunner
- **Meters affected**:
  - morale: 8x
  - food: 6x
  - population: 3x

### game_timeout
- **Occurrences**: 3
- **Personas affected**: War Kid, Cautious Explorer, Trader Kid

## Console Errors

- `Failed to load resource: the server responded with a status of 407 (Proxy Authentication Required)`
- `%s a style property during rerender (%s) when a conflicting property is set (%s) can lead to styling bugs. To avoid this, don't mix shorthand and non-shorthand properties for the same value; instead, `

## Event & Decision Analysis

### Events Encountered

No events were encountered (games may have ended before events fired).

## Building Activity

No buildings were constructed across all playthroughs.

## Tab Usage

| Tab | Games Used |
|-----|------------|
| Estate | 5/6 |
| Military | 3/6 |
| People | 2/6 |
| Chronicle | 1/6 |
| Trade | 0/6 |

## Meter Trajectories

### Impulsive Builder (normal)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 500 | 200 | 20 | 5 | 50 |
| 2 | 443 | 233 | 20 | 5 | 55 |
| 3 | 591 | 239 | 21 | 5 | 63 |
| 4 | 875 | 238 | 21 | 5 | 71 |
| 6 | 918 | 212 | 22 | 9 | 100 |
| 7 | 902 | 218 | 22 | 9 | 100 |
| 8 | 1181 | 164 | 23 | 9 | 100 |
| 9 | 1226 | 122 | 24 | 9 | 100 |
| 11 | 1152 | 132 | 25 | 10 | 100 |
| 13 | 1324 | 120 | 26 | 11 | 100 |
| 14 | 1400 | 125 | 27 | 11 | 100 |
| 16 | 1443 | 118 | 27 | 13 | 100 |
| 17 | 1354 | 81 | 25 | 15 | 100 |
| 19 | 1344 | 50 | 26 | 19 | 100 |
| 20 | 1431 | 39 | 26 | 21 | 100 |
| 21 | 1497 | 30 | 26 | 22 | 100 |
| 22 | 1568 | 42 | 26 | 22 | 85 |
| 23 | 1524 | 30 | 26 | 22 | 80 |
| 24 | 1586 | 36 | 26 | 23 | 83 |
| 25 | 1567 | 13 | 25 | 23 | 58 |
| 26 | 1596 | 0 | 18 | 19 | 55 |
| 28 | 1485 | 63 | 13 | 17 | 73 |
| 29 | 1639 | 51 | 13 | 16 | 64 |
| 30 | 1668 | 19 | 13 | 19 | 100 |
| 31 | 1557 | 17 | 13 | 23 | 100 |
| 32 | 1717 | 0 | 13 | 22 | 85 |
| 34 | 1583 | 81 | 9 | 17 | 70 |
| 35 | 1439 | 128 | 10 | 17 | 73 |
| 36 | 1470 | 129 | 11 | 17 | 78 |
| 37 | 1528 | 120 | 12 | 18 | 92 |
| 38 | 1692 | 80 | 12 | 19 | 100 |
| 39 | 1561 | 82 | 12 | 22 | 100 |
| 40 | 1537 | 98 | 13 | 24 | 100 |

### War Kid (normal)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 500 | 200 | 20 | 5 | 50 |
| 2 | 433 | 185 | 20 | 6 | 64 |
| 3 | 401 | 169 | 20 | 7 | 75 |
| 4 | 701 | 135 | 20 | 7 | 80 |
| 6 | 894 | 120 | 21 | 7 | 85 |

### Cautious Explorer (easy)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 700 | 280 | 22 | 5 | 50 |
| 2 | 809 | 271 | 23 | 5 | 58 |
| 3 | 754 | 292 | 24 | 5 | 66 |
| 4 | 696 | 301 | 26 | 8 | 100 |
| 6 | 783 | 306 | 26 | 10 | 100 |
| 7 | 650 | 323 | 26 | 10 | 100 |
| 8 | 733 | 289 | 28 | 10 | 100 |
| 9 | 732 | 297 | 32 | 11 | 91 |
| 11 | 829 | 313 | 33 | 12 | 99 |
| 13 | 1013 | 338 | 36 | 12 | 100 |
| 14 | 1197 | 291 | 37 | 13 | 100 |
| 16 | 1221 | 256 | 38 | 16 | 100 |
| 18 | 1466 | 226 | 38 | 19 | 89 |
| 19 | 1556 | 199 | 38 | 20 | 100 |
| 20 | 1669 | 196 | 41 | 21 | 100 |
| 21 | 1827 | 168 | 44 | 23 | 100 |
| 22 | 1843 | 164 | 45 | 23 | 100 |
| 23 | 1789 | 163 | 45 | 23 | 100 |
| 24 | 1991 | 135 | 48 | 25 | 100 |
| 25 | 2051 | 124 | 53 | 25 | 100 |
| 26 | 1964 | 156 | 53 | 25 | 100 |
| 27 | 2002 | 143 | 53 | 25 | 100 |

### Random Clicker (normal)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 500 | 200 | 20 | 5 | 50 |
| 2 | 498 | 179 | 21 | 5 | 55 |
| 3 | 581 | 175 | 22 | 6 | 72 |
| 4 | 653 | 184 | 20 | 6 | 77 |
| 6 | 706 | 118 | 21 | 7 | 94 |
| 7 | 729 | 107 | 21 | 7 | 97 |
| 9 | 1014 | 96 | 20 | 7 | 100 |
| 11 | 1022 | 65 | 21 | 7 | 100 |
| 13 | 1307 | 45 | 19 | 6 | 88 |
| 14 | 1353 | 39 | 19 | 6 | 68 |
| 16 | 1424 | 48 | 19 | 6 | 54 |
| 17 | 1314 | 39 | 14 | 5 | 29 |
| 19 | 1296 | 27 | 15 | 6 | 35 |
| 20 | 1400 | 10 | 13 | 6 | 30 |
| 21 | 1390 | 15 | 6 | 0 | 0 |
| 22 | 1339 | 33 | 6 | 0 | 2 |
| 23 | 1353 | 48 | 6 | 0 | 0 |
| 24 | 1502 | 48 | 4 | 0 | 2 |
| 25 | 1499 | 24 | 3 | 0 | 0 |
| 26 | 1496 | 0 | 4 | 2 | 20 |
| 27 | 1488 | 0 | 3 | 0 | 0 |
| 28 | 1410 | 0 | 1 | 0 | 2 |

### Trader Kid (normal)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 500 | 200 | 20 | 5 | 50 |
| 2 | 558 | 167 | 20 | 8 | 91 |
| 3 | 836 | 157 | 20 | 8 | 96 |
| 4 | 986 | 135 | 20 | 10 | 100 |

### Speedrunner (hard)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 400 | 130 | 18 | 3 | 50 |
| 2 | 260 | 150 | 19 | 6 | 91 |
| 3 | 326 | 117 | 19 | 8 | 100 |
| 4 | 591 | 66 | 20 | 8 | 100 |
| 6 | 649 | 96 | 24 | 10 | 100 |
| 7 | 515 | 91 | 24 | 13 | 100 |
| 8 | 604 | 103 | 25 | 13 | 100 |
| 9 | 766 | 68 | 23 | 14 | 95 |
| 11 | 865 | 90 | 24 | 15 | 95 |
| 13 | 1148 | 30 | 24 | 16 | 100 |
| 15 | 1103 | 29 | 24 | 16 | 92 |
| 17 | 1181 | 28 | 24 | 19 | 100 |
| 18 | 1231 | 0 | 24 | 20 | 100 |

## Recommendations for Gameplay Fixes & Additions

Based on the playtest data, here are prioritized suggestions:

### [MEDIUM] Balance: Low win rate for target audience

Only 17% won. Consider gentler penalties or a "story mode".

### [MEDIUM] UX: Better meter danger warnings

Meters hit critical zones without guidance. Add contextual hints: "Your faith is low! Donate to the Church or buy spices on Trade tab."

### [MEDIUM] Engagement: Trade tab never used

No persona visited the trade tab. Consider: tutorial prompt directing there, auto-switching when it unlocks, or making it visually prominent.

### [MEDIUM] UX: Add contextual "What should I do?" hints

6th graders need guidance. A hint button per tab ("Try building a Strip Farm!") would reduce confusion.

### [MEDIUM] Engagement: Add a "quick tips" loading screen between seasons

Show tips like "Sell goods on the Trade tab to earn more denarii!" during the season transition.

### [LOW] Engagement: Add achievements/milestones

Badges like "First Trade!", "Castle Upgraded!", "Survived 14 Turns!" give tangible goals and dopamine hits.

### [LOW] UX: Add undo/confirmation for costly actions

Kids misclick. Confirm expensive purchases (>200d) or irreversible actions (demolish).

### [LOW] Balance: Consider an auto-save / checkpoint system

If a game-over feels unfair, let kids rewind 1-2 turns. Reduces frustration without removing consequences.

## Appendix: Action Log Summary

### Impulsive Builder
- Total actions: 34
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 2
- Console errors: 2
- Disabled clicks: 0

### War Kid
- Total actions: 9
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 1
- Console errors: 2
- Disabled clicks: 0

### Cautious Explorer
- Total actions: 45
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 1
- Console errors: 4
- Disabled clicks: 0

### Random Clicker
- Total actions: 33
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 14
- Console errors: 6
- Disabled clicks: 0

### Trader Kid
- Total actions: 5
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 1
- Console errors: 2
- Disabled clicks: 0

### Speedrunner
- Total actions: 14
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 1
- Console errors: 2
- Disabled clicks: 0
