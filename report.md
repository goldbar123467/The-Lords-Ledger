# The Lord's Ledger — Playwright Playtest Report
> Generated: 2026-04-14 | Games: 6 | Method: Headless Playwright + 6th-grader personas

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total games | 6 |
| Victories | 2 (33%) |
| Game Overs | 1 (17%) |
| Stuck/Crashed | 3 |
| Avg turns survived | 24.3/40 |
| Avg playthrough time | 246.4s |

## Per-Persona Results

| Persona | Difficulty | Outcome | Turns | Buildings | Trades | Flips | Synergies | Time |
|---------|-----------|---------|-------|-----------|--------|-------|-----------|------|
| Impulsive Builder | normal | WIN | 40 | 0 | 0 | Yes | 6 | 181.6s |
| War Kid | normal | STUCK | 7 | 0 | 0 | Yes | 5 | 336.6s |
| Cautious Explorer | easy | STUCK | 36 | 0 | 0 | Yes | 6 | 300.2s |
| Random Clicker | normal | WIN | 40 | 0 | 0 | Yes | 6 | 191.9s |
| Trader Kid | normal | STUCK | 6 | 0 | 0 | Yes | 4 | 390.6s |
| Speedrunner | hard | LOSS | 17 | 0 | 0 | Yes | 6 | 77.2s |

## Game Over Analysis

### Death Causes

- **famine — The Great Famine**: 1x

### Death Details

- **Speedrunner** (hard): Died at turn 17
  - Reason: famine — The Great Famine
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?

## Victory Analysis

- **Impulsive Builder** (normal): Won at turn 40
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?
  - Buildings built: 0, Trades: 0
- **Random Clicker** (normal): Won at turn 40
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?
  - Buildings built: 0, Trades: 0

## UX Friction Points

Moments where a 6th grader would get confused, frustrated, or stuck.

### game_timeout
- **Occurrences**: 3
- **Personas affected**: War Kid, Cautious Explorer, Trader Kid

## Console Errors

- `Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID`
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
| 1 | 500 | 365 | 20 | 5 | 50 |
| 2 | 370 | 381 | 20 | 8 | 94 |
| 3 | 240 | 423 | 20 | 8 | 100 |
| 4 | 440 | 408 | 21 | 8 | 100 |
| 5 | 531 | 369 | 22 | 10 | 100 |
| 6 | 583 | 339 | 22 | 10 | 100 |
| 7 | 720 | 315 | 22 | 11 | 100 |
| 8 | 855 | 305 | 22 | 14 | 100 |
| 9 | 967 | 271 | 22 | 14 | 100 |
| 10 | 944 | 276 | 22 | 15 | 100 |
| 11 | 946 | 290 | 22 | 15 | 100 |
| 12 | 931 | 283 | 23 | 17 | 100 |
| 13 | 899 | 266 | 26 | 23 | 100 |
| 14 | 1139 | 243 | 26 | 23 | 100 |
| 15 | 1049 | 265 | 27 | 23 | 100 |
| 16 | 1286 | 256 | 27 | 23 | 100 |
| 17 | 1336 | 244 | 33 | 25 | 100 |
| 18 | 1476 | 258 | 34 | 25 | 100 |
| 19 | 1511 | 235 | 34 | 25 | 100 |
| 20 | 1684 | 259 | 34 | 25 | 100 |
| 21 | 1819 | 234 | 37 | 25 | 91 |
| 22 | 1827 | 210 | 37 | 25 | 100 |
| 23 | 1785 | 209 | 37 | 25 | 100 |
| 24 | 1947 | 198 | 38 | 25 | 100 |
| 25 | 1931 | 173 | 39 | 25 | 100 |
| 26 | 1881 | 165 | 39 | 25 | 100 |
| 27 | 2046 | 131 | 40 | 25 | 100 |
| 28 | 2492 | 89 | 40 | 25 | 100 |
| 29 | 2418 | 143 | 43 | 25 | 100 |
| 30 | 2342 | 147 | 43 | 25 | 100 |
| 31 | 2376 | 153 | 43 | 25 | 100 |
| 32 | 2752 | 163 | 44 | 25 | 100 |
| 33 | 2707 | 124 | 45 | 25 | 100 |
| 34 | 2823 | 138 | 45 | 25 | 100 |
| 35 | 2864 | 100 | 46 | 25 | 100 |
| 36 | 3189 | 96 | 46 | 25 | 100 |
| 37 | 3106 | 108 | 46 | 25 | 100 |
| 38 | 3073 | 101 | 46 | 25 | 97 |
| 39 | 3150 | 114 | 47 | 25 | 100 |
| 40 | 3479 | 75 | 47 | 25 | 100 |

### War Kid (normal)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 500 | 365 | 20 | 5 | 50 |
| 2 | 660 | 333 | 21 | 5 | 58 |
| 3 | 686 | 319 | 21 | 5 | 66 |
| 4 | 951 | 317 | 21 | 5 | 74 |
| 5 | 1057 | 354 | 24 | 6 | 88 |
| 6 | 1121 | 351 | 25 | 14 | 96 |
| 7 | 1005 | 372 | 26 | 17 | 100 |

### Cautious Explorer (easy)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 700 | 480 | 22 | 5 | 50 |
| 2 | 827 | 477 | 22 | 5 | 58 |
| 3 | 904 | 468 | 22 | 5 | 66 |
| 4 | 1026 | 429 | 24 | 6 | 80 |
| 5 | 1060 | 464 | 24 | 7 | 100 |
| 6 | 1114 | 458 | 24 | 7 | 100 |
| 7 | 1038 | 464 | 25 | 7 | 100 |
| 8 | 982 | 504 | 27 | 8 | 100 |
| 9 | 896 | 463 | 26 | 10 | 100 |
| 10 | 1076 | 448 | 26 | 11 | 100 |
| 11 | 1241 | 423 | 27 | 11 | 100 |
| 12 | 1431 | 394 | 30 | 11 | 100 |
| 13 | 1487 | 417 | 30 | 11 | 100 |
| 14 | 1423 | 399 | 31 | 14 | 100 |
| 15 | 1335 | 370 | 31 | 17 | 100 |
| 16 | 1509 | 398 | 34 | 17 | 100 |
| 17 | 1719 | 379 | 35 | 17 | 100 |
| 18 | 1635 | 388 | 35 | 17 | 100 |
| 19 | 1681 | 416 | 36 | 18 | 100 |
| 20 | 1943 | 441 | 38 | 18 | 100 |
| 21 | 1852 | 500 | 38 | 18 | 100 |
| 22 | 1811 | 473 | 39 | 21 | 100 |
| 23 | 1721 | 459 | 39 | 25 | 100 |
| 24 | 1881 | 478 | 42 | 25 | 100 |
| 25 | 1964 | 473 | 47 | 25 | 100 |
| 26 | 2041 | 459 | 47 | 25 | 100 |
| 27 | 1948 | 472 | 47 | 25 | 100 |
| 28 | 2270 | 426 | 49 | 25 | 100 |
| 29 | 2385 | 393 | 52 | 25 | 100 |
| 30 | 2428 | 404 | 52 | 25 | 100 |
| 31 | 2371 | 448 | 53 | 25 | 100 |
| 32 | 2399 | 500 | 55 | 25 | 100 |
| 33 | 2444 | 468 | 55 | 25 | 100 |
| 34 | 2614 | 452 | 55 | 25 | 100 |
| 35 | 2689 | 494 | 56 | 25 | 100 |
| 36 | 2865 | 530 | 58 | 25 | 100 |

### Random Clicker (normal)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 500 | 365 | 20 | 5 | 50 |
| 2 | 500 | 342 | 21 | 5 | 58 |
| 3 | 531 | 328 | 22 | 5 | 66 |
| 4 | 546 | 311 | 23 | 8 | 100 |
| 5 | 499 | 290 | 24 | 6 | 82 |
| 6 | 658 | 312 | 24 | 6 | 81 |
| 7 | 697 | 274 | 24 | 6 | 89 |
| 8 | 731 | 299 | 25 | 7 | 94 |
| 9 | 705 | 269 | 26 | 7 | 100 |
| 10 | 655 | 261 | 26 | 6 | 100 |
| 11 | 695 | 238 | 26 | 6 | 100 |
| 12 | 968 | 255 | 25 | 7 | 100 |
| 13 | 1092 | 240 | 29 | 11 | 100 |
| 14 | 1110 | 232 | 30 | 13 | 100 |
| 15 | 1178 | 222 | 30 | 11 | 82 |
| 16 | 1463 | 231 | 29 | 11 | 81 |
| 17 | 1420 | 198 | 27 | 9 | 60 |
| 18 | 1605 | 184 | 28 | 10 | 68 |
| 19 | 1587 | 219 | 28 | 10 | 67 |
| 20 | 1734 | 228 | 26 | 11 | 84 |
| 21 | 1674 | 230 | 26 | 11 | 92 |
| 22 | 1659 | 206 | 27 | 12 | 100 |
| 23 | 1864 | 174 | 28 | 11 | 85 |
| 24 | 2101 | 140 | 29 | 11 | 93 |
| 25 | 2017 | 107 | 27 | 11 | 90 |
| 26 | 2152 | 83 | 28 | 12 | 93 |
| 27 | 2164 | 96 | 28 | 13 | 96 |
| 28 | 2361 | 125 | 29 | 13 | 99 |
| 29 | 2359 | 119 | 33 | 19 | 100 |
| 30 | 2424 | 125 | 34 | 19 | 100 |
| 31 | 2484 | 106 | 35 | 21 | 100 |
| 32 | 2582 | 100 | 35 | 23 | 100 |
| 33 | 2618 | 143 | 41 | 25 | 91 |
| 34 | 2880 | 102 | 42 | 25 | 94 |
| 35 | 2953 | 93 | 42 | 23 | 79 |
| 36 | 3074 | 84 | 42 | 24 | 94 |
| 37 | 3127 | 81 | 42 | 25 | 100 |
| 38 | 3165 | 79 | 42 | 24 | 88 |
| 39 | 3078 | 97 | 43 | 24 | 88 |
| 40 | 3289 | 58 | 46 | 23 | 79 |

### Trader Kid (normal)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 500 | 365 | 20 | 5 | 50 |
| 2 | 570 | 375 | 21 | 5 | 58 |
| 3 | 461 | 364 | 22 | 7 | 96 |
| 4 | 686 | 340 | 23 | 7 | 100 |
| 5 | 784 | 325 | 23 | 8 | 100 |
| 6 | 1022 | 302 | 23 | 8 | 100 |

### Speedrunner (hard)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 400 | 255 | 18 | 3 | 50 |
| 2 | 428 | 204 | 19 | 4 | 67 |
| 3 | 337 | 203 | 19 | 6 | 100 |
| 4 | 477 | 144 | 19 | 9 | 100 |
| 5 | 566 | 172 | 20 | 9 | 100 |
| 6 | 566 | 150 | 21 | 12 | 100 |
| 7 | 492 | 103 | 21 | 14 | 100 |
| 8 | 462 | 128 | 22 | 15 | 100 |
| 9 | 424 | 120 | 26 | 20 | 100 |
| 10 | 564 | 88 | 26 | 22 | 100 |
| 11 | 604 | 106 | 26 | 22 | 100 |
| 12 | 772 | 95 | 27 | 22 | 100 |
| 13 | 912 | 79 | 30 | 25 | 100 |
| 14 | 1098 | 44 | 31 | 25 | 97 |
| 15 | 1255 | 31 | 31 | 25 | 92 |
| 16 | 1414 | 28 | 31 | 25 | 100 |
| 17 | 1434 | 21 | 24 | 16 | 56 |

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
- Total actions: 41
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
- Total actions: 73
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 1
- Console errors: 4
- Disabled clicks: 0

### Random Clicker
- Total actions: 61
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 0
- Console errors: 8
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
- Total actions: 18
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 0
- Console errors: 2
- Disabled clicks: 0
