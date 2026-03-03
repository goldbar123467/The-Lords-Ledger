# The Lord's Ledger

A medieval economic simulation game for 6th graders. Inherit a feudal estate and manage it for 28 turns (7 years x 4 seasons). Balance four competing meters — Treasury, People, Military, and Faith — while building your manor, trading goods, and navigating narrative events inspired by real medieval history.

## Play

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS 4
- Pure JavaScript (no TypeScript)
- Zero runtime dependencies beyond React

## Features

**Core Simulation**
- 12 buildings with production chains (basic producers + converters)
- Dynamic market with fluctuating prices (+-20% per season)
- Population growth/decline tied to food surplus and approval
- Tax system with 4 rates affecting People vs Treasury tradeoff
- Full economic engine: production, consumption, upkeep, passive income

**Narrative Layer**
- 20+ seasonal events with branching choices and real medieval history notes
- 20+ random events gated by tutorial progression
- 4 perspective flip mini-sequences (Serf, Merchant, Noble, Knight) that let you see your manor through another character's eyes

**Hidden Synergy System (v3.0)**
- 7 strategy paths x 3 tiers each (21 total synergies)
- Wool Baron, Breadbasket, Fortress, Pious Lord, Market King, People's Lord, Iron Lord
- Tier 3 synergies unlock unique victory titles
- Conditions are declarative and checked automatically each turn

**Tutorial Progression**
- Turns 1-2: Treasury + People only
- Turn 3: Military meter unlocks
- Turn 5: Faith meter unlocks
- Tabs unlock progressively (Estate/People/Chronicle -> Trade -> Military)

## Architecture

All game state lives in a single `useReducer`. The engine layer (`src/engine/`) is pure functions only — no side effects, no DOM access. Data definitions live in `src/data/`. See `CLAUDE.md` for full architecture docs.

## Automated Playtest

A headless playtest script exercises the game reducer directly (no React/DOM):

```bash
node playtest.js        # 20 games (default)
node playtest.js 100    # custom run count
```

Runs full 28-turn games across 6 strategy profiles (passive, builder, trader, military, pious, random). Checks 11 per-turn invariants, tracks balance metrics, and prints a summary table with win rates, death causes, and synergy activation frequency.

## Commands

```bash
npm run dev       # Dev server
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```
