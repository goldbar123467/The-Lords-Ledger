# The Lord's Ledger — Playwright Playtest Report
> Generated: 2026-04-14 | Games: 6 | Method: Headless Playwright + 6th-grader personas

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total games | 6 |
| Victories | 1 (17%) |
| Game Overs | 3 (50%) |
| Stuck/Crashed | 2 |
| Avg turns survived | 16.3/40 |
| Avg playthrough time | 201.1s |

## Per-Persona Results

| Persona | Difficulty | Outcome | Turns | Buildings | Trades | Flips | Synergies | Time |
|---------|-----------|---------|-------|-----------|--------|-------|-----------|------|
| Impulsive Builder | normal | LOSS | 16 | 0 | 0 | Yes | 3 | 73.6s |
| War Kid | normal | STUCK | 7 | 0 | 0 | Yes | 1 | 328.2s |
| Cautious Explorer | easy | WIN | 35 | 0 | 0 | Yes | 3 | 278.0s |
| Random Clicker | normal | LOSS | 18 | 0 | 0 | Yes | 1 | 78.5s |
| Trader Kid | normal | STUCK | 6 | 0 | 0 | Yes | 1 | 384.7s |
| Speedrunner | hard | LOSS | 16 | 0 | 0 | Yes | 1 | 63.3s |

## Game Over Analysis

### Death Causes

- **famine — The Great Famine**: 3x

### Death Details

- **Impulsive Builder** (normal): Died at turn 16
  - Reason: famine — The Great Famine
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?
- **Random Clicker** (normal): Died at turn 18
  - Reason: famine — The Great Famine
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?
- **Speedrunner** (hard): Died at turn 16
  - Reason: famine — The Great Famine
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?

## Victory Analysis

- **Cautious Explorer** (easy): Won at turn 35
  - Final resources: Denarii:? Food:? Pop:? Garrison:? Morale:?
  - Buildings built: 0, Trades: 0

## UX Friction Points

Moments where a 6th grader would get confused, frustrated, or stuck.

### Meter Critically Low (danger zone)
- **Occurrences**: 7
- **Personas affected**: Impulsive Builder, Cautious Explorer, Random Clicker, Speedrunner
- **Meters affected**:
  - food: 7x

### game_timeout
- **Occurrences**: 2
- **Personas affected**: War Kid, Trader Kid

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
| 2 | 433 | 203 | 21 | 8 | 94 |
| 3 | 336 | 195 | 21 | 10 | 100 |
| 4 | 420 | 193 | 21 | 13 | 100 |
| 6 | 413 | 231 | 24 | 16 | 100 |
| 7 | 319 | 212 | 24 | 17 | 100 |
| 8 | 598 | 160 | 24 | 17 | 100 |
| 9 | 654 | 116 | 27 | 20 | 100 |
| 11 | 587 | 156 | 28 | 21 | 100 |
| 13 | 889 | 108 | 28 | 23 | 100 |
| 15 | 958 | 75 | 29 | 24 | 100 |
| 17 | 1219 | 66 | 30 | 25 | 100 |
| 18 | 1202 | 56 | 35 | 25 | 100 |
| 19 | 1380 | 26 | 35 | 25 | 92 |
| 20 | 1568 | 0 | 35 | 22 | 86 |
| 21 | 1457 | 0 | 26 | 22 | 100 |

### War Kid (normal)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 500 | 200 | 20 | 5 | 50 |
| 2 | 363 | 212 | 20 | 5 | 58 |
| 3 | 386 | 206 | 20 | 5 | 66 |
| 4 | 551 | 179 | 21 | 5 | 74 |
| 6 | 484 | 204 | 21 | 6 | 97 |
| 7 | 367 | 165 | 21 | 15 | 100 |
| 8 | 706 | 111 | 21 | 15 | 100 |

### Cautious Explorer (easy)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 700 | 280 | 22 | 5 | 50 |
| 2 | 614 | 322 | 22 | 5 | 58 |
| 3 | 508 | 370 | 23 | 5 | 66 |
| 4 | 657 | 316 | 26 | 6 | 86 |
| 6 | 719 | 315 | 29 | 10 | 100 |
| 7 | 599 | 314 | 29 | 11 | 100 |
| 8 | 585 | 306 | 32 | 14 | 100 |
| 9 | 657 | 268 | 35 | 17 | 100 |
| 11 | 702 | 232 | 36 | 19 | 100 |
| 13 | 1049 | 205 | 39 | 19 | 100 |
| 15 | 985 | 205 | 40 | 24 | 100 |
| 17 | 1103 | 189 | 42 | 25 | 100 |
| 18 | 1402 | 169 | 48 | 25 | 100 |
| 19 | 1437 | 141 | 49 | 25 | 100 |
| 20 | 1675 | 86 | 52 | 25 | 100 |
| 21 | 1663 | 70 | 55 | 25 | 100 |
| 22 | 1769 | 63 | 55 | 25 | 92 |
| 23 | 1685 | 80 | 55 | 25 | 100 |
| 24 | 1939 | 61 | 57 | 25 | 98 |
| 25 | 2056 | 89 | 62 | 25 | 100 |
| 26 | 1978 | 88 | 62 | 25 | 97 |
| 27 | 1930 | 93 | 62 | 25 | 100 |
| 28 | 2134 | 80 | 64 | 25 | 97 |
| 29 | 2403 | 76 | 64 | 24 | 83 |
| 30 | 2377 | 69 | 64 | 24 | 78 |
| 31 | 2431 | 48 | 64 | 25 | 100 |
| 32 | 2585 | 38 | 66 | 25 | 92 |
| 33 | 2590 | 40 | 69 | 25 | 100 |
| 34 | 2678 | 55 | 69 | 25 | 92 |
| 35 | 2606 | 54 | 69 | 25 | 100 |
| 36 | 2964 | 50 | 71 | 25 | 92 |
| 37 | 3089 | 13 | 71 | 25 | 96 |
| 38 | 3111 | 0 | 67 | 23 | 90 |
| 39 | 3143 | 0 | 57 | 20 | 78 |
| 40 | 3525 | 0 | 49 | 18 | 66 |

### Random Clicker (normal)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 500 | 200 | 20 | 5 | 50 |
| 2 | 543 | 221 | 20 | 4 | 49 |
| 3 | 426 | 239 | 21 | 4 | 57 |
| 4 | 711 | 226 | 19 | 2 | 41 |
| 6 | 820 | 193 | 18 | 2 | 29 |
| 7 | 910 | 165 | 18 | 3 | 43 |
| 8 | 981 | 152 | 20 | 3 | 42 |
| 9 | 925 | 133 | 19 | 3 | 30 |
| 11 | 886 | 140 | 20 | 5 | 38 |
| 13 | 827 | 139 | 23 | 10 | 100 |
| 14 | 787 | 114 | 23 | 11 | 100 |
| 16 | 732 | 103 | 23 | 12 | 100 |
| 17 | 793 | 62 | 20 | 11 | 80 |
| 18 | 761 | 48 | 21 | 11 | 80 |
| 19 | 674 | 45 | 21 | 13 | 100 |
| 20 | 733 | 24 | 21 | 13 | 97 |
| 21 | 851 | 12 | 23 | 11 | 85 |
| 22 | 790 | 0 | 17 | 11 | 100 |

### Trader Kid (normal)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 500 | 200 | 20 | 5 | 50 |
| 2 | 528 | 134 | 20 | 6 | 67 |
| 3 | 411 | 121 | 20 | 8 | 100 |
| 4 | 591 | 54 | 20 | 9 | 100 |
| 6 | 829 | 42 | 20 | 10 | 100 |
| 7 | 702 | 38 | 20 | 12 | 100 |

### Speedrunner (hard)

| Turn | Denarii | Food | Population | Garrison | Morale |
|------|---------|------|------------|----------|--------|
| 1 | 400 | 130 | 18 | 3 | 50 |
| 2 | 500 | 120 | 19 | 3 | 58 |
| 3 | 371 | 118 | 19 | 5 | 96 |
| 4 | 606 | 131 | 19 | 5 | 100 |
| 6 | 637 | 157 | 20 | 6 | 100 |
| 7 | 560 | 153 | 20 | 6 | 100 |
| 8 | 810 | 128 | 20 | 6 | 100 |
| 9 | 894 | 118 | 15 | 5 | 80 |
| 11 | 1012 | 105 | 15 | 7 | 100 |
| 13 | 1058 | 85 | 15 | 10 | 100 |
| 14 | 946 | 113 | 15 | 10 | 100 |
| 16 | 864 | 90 | 16 | 13 | 100 |
| 17 | 888 | 52 | 17 | 13 | 100 |
| 19 | 887 | 30 | 17 | 16 | 100 |
| 20 | 1012 | 9 | 17 | 19 | 100 |
| 21 | 1142 | 0 | 15 | 16 | 100 |

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
- Total actions: 17
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 2
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
- Friction points: 3
- Console errors: 4
- Disabled clicks: 0

### Random Clicker
- Total actions: 28
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 1
- Console errors: 12
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
- Total actions: 17
- Buildings built: 0
- Trades made: 0
- Events faced: 0
- Friction points: 1
- Console errors: 2
- Disabled clicks: 0
