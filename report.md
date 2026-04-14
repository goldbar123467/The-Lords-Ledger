# The Lord's Ledger — Playwright Playtest Report
> Generated: 2026-04-14 | Games: 6 | Method: Headless Playwright + 6th-grader personas

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total games | 6 |
| Victories | 2 (33%) |
| Game Overs | 2 (33%) |
| Stuck/Crashed | 2 |
| Avg turns survived | 22.7/40 |
| Avg playthrough time | 225.1s |

## Per-Persona Results

| Persona | Difficulty | Outcome | Turns | Buildings | Trades | Flips | Synergies | Time |
|---------|-----------|---------|-------|-----------|--------|-------|-----------|------|
| Impulsive Builder | normal | WIN | 35 | 0 | 0 | Yes | 3 | 148.6s |
| War Kid | normal | STUCK | 7 | 0 | 0 | Yes | 1 | 328.1s |
| Cautious Explorer | easy | WIN | 35 | 0 | 0 | Yes | 3 | 278.4s |
| Random Clicker | normal | LOSS | 29 | 0 | 0 | Yes | 2 | 124.1s |
| Trader Kid | normal | STUCK | 6 | 0 | 0 | Yes | 1 | 383.4s |
| Speedrunner | hard | LOSS | 24 | 0 | 0 | Yes | 1 | 88.3s |

## Game Over Analysis

### Death Causes

- **famine — The Great Famine**: 2x

### Death Details

- **Random Clicker** (normal): Died at turn 29
  - Reason: famine — The Great Famine
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?
- **Speedrunner** (hard): Died at turn 24
  - Reason: famine — The Great Famine
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?

## Victory Analysis

- **Impulsive Builder** (normal): Won at turn 35
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?
  - Buildings built: 0, Trades: 0
- **Cautious Explorer** (easy): Won at turn 35
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?
  - Buildings built: 0, Trades: 0

## UX Friction Points

Moments where a 6th grader would get confused, frustrated, or stuck.

### game_timeout
- **Occurrences**: 2
- **Personas affected**: War Kid, Trader Kid

### Meter Critically Low (danger zone)
- **Occurrences**: 1
- **Personas affected**: Speedrunner
- **Meters affected**:
  - food: 1x

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
| 2 | 403 | 200 | 21 | 6 | 67 |
| 3 | 266 | 243 | 21 | 6 | 75 |
| 4 | 300 | 274 | 21 | 6 | 83 |
| 6 | 493 | 262 | 21 | 6 | 91 |
| 7 | 436 | 272 | 21 | 6 | 99 |
| 8 | 485 | 264 | 21 | 6 | 100 |
| 9 | 433 | 240 | 25 | 10 | 100 |
| 10 | 633 | 220 | 26 | 10 | 100 |
| 11 | 574 | 248 | 27 | 10 | 100 |
| 13 | 791 | 269 | 28 | 11 | 100 |
| 14 | 785 | 252 | 29 | 14 | 100 |
| 16 | 1014 | 241 | 30 | 15 | 100 |
| 17 | 897 | 254 | 28 | 14 | 80 |
| 18 | 834 | 249 | 29 | 14 | 88 |
| 20 | 866 | 193 | 29 | 16 | 100 |
| 22 | 923 | 174 | 33 | 20 | 100 |
| 23 | 818 | 172 | 34 | 23 | 100 |
| 24 | 986 | 178 | 34 | 24 | 100 |
| 25 | 938 | 162 | 34 | 25 | 100 |
| 26 | 955 | 141 | 34 | 25 | 100 |
| 27 | 1107 | 121 | 34 | 25 | 100 |
| 28 | 1315 | 133 | 35 | 25 | 100 |
| 29 | 1408 | 93 | 36 | 25 | 100 |
| 30 | 1487 | 69 | 36 | 25 | 100 |
| 31 | 1491 | 49 | 36 | 25 | 100 |
| 32 | 1674 | 35 | 36 | 25 | 92 |
| 33 | 1613 | 15 | 41 | 25 | 100 |
| 34 | 1503 | 15 | 38 | 23 | 100 |
| 35 | 1423 | 33 | 38 | 21 | 100 |
| 36 | 1560 | 20 | 38 | 22 | 100 |
| 37 | 1550 | 39 | 38 | 16 | 76 |
| 38 | 1680 | 25 | 38 | 16 | 71 |
| 39 | 1740 | 37 | 38 | 18 | 96 |
| 40 | 2062 | 19 | 38 | 19 | 97 |

### War Kid (normal)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 500 | 200 | 20 | 5 | 50 |
| 2 | 723 | 185 | 20 | 5 | 58 |
| 3 | 711 | 170 | 21 | 5 | 66 |
| 4 | 725 | 190 | 22 | 7 | 100 |
| 6 | 769 | 184 | 23 | 8 | 100 |
| 7 | 649 | 194 | 23 | 15 | 100 |
| 8 | 933 | 136 | 24 | 15 | 100 |

### Cautious Explorer (easy)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 700 | 280 | 22 | 5 | 50 |
| 2 | 674 | 262 | 23 | 6 | 67 |
| 3 | 729 | 285 | 24 | 6 | 75 |
| 4 | 711 | 288 | 27 | 7 | 98 |
| 6 | 895 | 276 | 30 | 10 | 100 |
| 7 | 891 | 266 | 31 | 10 | 100 |
| 8 | 927 | 245 | 34 | 13 | 100 |
| 9 | 1016 | 253 | 32 | 12 | 71 |
| 11 | 1048 | 247 | 33 | 14 | 85 |
| 13 | 1242 | 208 | 35 | 19 | 100 |
| 15 | 1365 | 208 | 35 | 21 | 100 |
| 17 | 1519 | 231 | 37 | 22 | 100 |
| 18 | 1468 | 245 | 38 | 22 | 100 |
| 19 | 1443 | 216 | 39 | 24 | 100 |
| 20 | 1578 | 259 | 42 | 24 | 100 |
| 21 | 1692 | 264 | 45 | 25 | 100 |
| 22 | 1588 | 265 | 46 | 25 | 100 |
| 23 | 1750 | 253 | 47 | 25 | 100 |
| 24 | 1937 | 273 | 50 | 25 | 100 |
| 25 | 2168 | 255 | 53 | 25 | 100 |
| 26 | 2291 | 224 | 53 | 25 | 100 |
| 27 | 2394 | 211 | 53 | 25 | 100 |
| 28 | 2468 | 221 | 55 | 25 | 100 |
| 29 | 2569 | 201 | 56 | 25 | 100 |
| 30 | 2546 | 204 | 56 | 25 | 100 |
| 31 | 2463 | 252 | 57 | 25 | 100 |
| 32 | 2583 | 267 | 60 | 25 | 100 |
| 33 | 2614 | 278 | 60 | 25 | 100 |
| 34 | 2625 | 287 | 61 | 25 | 100 |
| 35 | 2951 | 292 | 62 | 25 | 100 |
| 36 | 3060 | 306 | 65 | 25 | 100 |
| 37 | 3049 | 299 | 65 | 25 | 100 |
| 38 | 2963 | 300 | 66 | 25 | 100 |
| 39 | 3003 | 294 | 66 | 25 | 100 |
| 40 | 3313 | 292 | 68 | 25 | 100 |

### Random Clicker (normal)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 500 | 200 | 20 | 5 | 50 |
| 2 | 523 | 179 | 21 | 5 | 58 |
| 3 | 526 | 160 | 22 | 6 | 78 |
| 4 | 593 | 157 | 25 | 6 | 86 |
| 6 | 639 | 133 | 25 | 8 | 100 |
| 7 | 685 | 113 | 25 | 7 | 85 |
| 9 | 1027 | 133 | 24 | 7 | 90 |
| 11 | 1073 | 123 | 25 | 9 | 100 |
| 13 | 1220 | 95 | 23 | 11 | 100 |
| 14 | 1265 | 50 | 23 | 11 | 100 |
| 16 | 1265 | 69 | 23 | 12 | 88 |
| 17 | 1244 | 35 | 20 | 11 | 74 |
| 18 | 1227 | 24 | 20 | 11 | 69 |
| 19 | 1165 | 49 | 20 | 12 | 64 |
| 20 | 1171 | 53 | 22 | 12 | 64 |
| 21 | 1085 | 43 | 22 | 13 | 76 |
| 22 | 1044 | 45 | 22 | 13 | 71 |
| 23 | 1123 | 17 | 22 | 13 | 71 |
| 24 | 1195 | 40 | 24 | 13 | 66 |
| 25 | 1161 | 33 | 24 | 13 | 61 |
| 26 | 1162 | 25 | 24 | 13 | 59 |
| 27 | 1068 | 35 | 24 | 15 | 84 |
| 28 | 1295 | 1 | 26 | 15 | 79 |
| 29 | 1355 | 39 | 19 | 12 | 67 |
| 30 | 1260 | 38 | 19 | 13 | 82 |
| 31 | 1285 | 18 | 19 | 13 | 82 |
| 32 | 1349 | 22 | 19 | 13 | 77 |
| 33 | 1354 | 9 | 22 | 13 | 95 |
| 34 | 1347 | 15 | 16 | 11 | 98 |

### Trader Kid (normal)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 500 | 200 | 20 | 5 | 50 |
| 2 | 443 | 236 | 21 | 5 | 58 |
| 3 | 376 | 265 | 22 | 5 | 66 |
| 4 | 760 | 260 | 22 | 5 | 74 |
| 6 | 804 | 276 | 22 | 6 | 91 |
| 7 | 738 | 258 | 23 | 8 | 100 |

### Speedrunner (hard)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 400 | 130 | 18 | 3 | 50 |
| 2 | 455 | 117 | 19 | 3 | 58 |
| 3 | 431 | 87 | 20 | 6 | 100 |
| 4 | 486 | 62 | 20 | 7 | 100 |
| 6 | 679 | 57 | 21 | 7 | 97 |
| 7 | 807 | 58 | 21 | 7 | 97 |
| 8 | 971 | 45 | 22 | 9 | 100 |
| 9 | 1065 | 51 | 22 | 8 | 83 |
| 11 | 1024 | 42 | 22 | 12 | 100 |
| 13 | 1268 | 44 | 22 | 12 | 97 |
| 14 | 1142 | 58 | 22 | 12 | 97 |
| 16 | 1086 | 75 | 23 | 13 | 97 |
| 17 | 1010 | 72 | 21 | 13 | 80 |
| 18 | 1163 | 42 | 22 | 13 | 83 |
| 19 | 1027 | 86 | 22 | 13 | 83 |
| 20 | 1166 | 88 | 22 | 13 | 88 |
| 21 | 1190 | 75 | 23 | 14 | 100 |
| 22 | 1315 | 44 | 24 | 14 | 100 |
| 23 | 1466 | 18 | 24 | 14 | 97 |
| 24 | 1445 | 52 | 24 | 15 | 100 |
| 25 | 1557 | 39 | 22 | 14 | 72 |
| 26 | 1531 | 25 | 22 | 15 | 76 |
| 28 | 1460 | 1 | 22 | 18 | 100 |
| 29 | 1344 | 0 | 19 | 19 | 100 |

## Recommendations for Gameplay Fixes & Additions

Based on the playtest data, here are prioritized suggestions:

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
- Total actions: 36
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 0
- Console errors: 2
- Disabled clicks: 0

### War Kid
- Total actions: 17
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 1
- Console errors: 2
- Disabled clicks: 0

### Cautious Explorer
- Total actions: 71
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 0
- Console errors: 4
- Disabled clicks: 0

### Random Clicker
- Total actions: 45
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 0
- Console errors: 14
- Disabled clicks: 0

### Trader Kid
- Total actions: 7
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 1
- Console errors: 2
- Disabled clicks: 0

### Speedrunner
- Total actions: 25
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 1
- Console errors: 2
- Disabled clicks: 0
