# The Lord's Ledger

A medieval economic simulation game for 6th graders. Inherit a feudal estate and manage it for 40 turns (10 years x 4 seasons). Make real economic decisions — build your manor, recruit soldiers, trade goods, hold court, and navigate narrative events inspired by real medieval history.

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
- Resource-based economy: denarii, food (grain/livestock/fish), population, garrison
- 12+ buildings with production chains, condition degradation, and synergy bonuses
- Land plot system with seasonal farm multipliers and building upgrades
- Dynamic market with fluctuating prices, haggling, merchant reputation, and foreign traders
- Tax system with 4 rates affecting population retention vs treasury income
- Full economic engine: production, consumption, upkeep, passive income, levy labor penalties

**Military System**
- Three soldier types: Levy Peasants (cheap, weak), Men-at-Arms (professional), Knights (elite, expensive)
- Three fortification tracks: Walls (palisade to concentric), Gate (wooden to barbican), Moat (ditch to drawbridge)
- Morale system affecting defense effectiveness and desertion risk
- Defense rating breakdown showing how garrison, fortifications, and morale combine
- SVG castle visualization that grows with upgrades
- Raid defense against criminal outlaws and Scottish raiders

**Great Hall**
- Dispute resolution (16 cases) with consequence-driven rulings
- Audience chamber (20 encounters) for petitioners and visitors
- Decree desk with active policy slots
- Council chamber for advisory discussions
- Feast hall for morale and reputation building
- Steward Edmund: context-aware dialogue, trust mechanic, mood system
- Reputation tracking across 6 tracks (merciful, stern, wealthy, pious, militant, balanced)

**Narrative Layer**
- 20+ seasonal events with branching choices and real medieval history notes
- 20+ random events gated by progression
- 4 perspective flip mini-sequences (Serf, Merchant, Noble, Knight)
- Scribe's Notes: educational tooltips explaining medieval vocabulary and concepts

**Additional Systems**
- Blacksmith forge with NPC Godric and crafting mechanics
- Chapel with tithe system and faith-based economic benefits
- Watchtower for threat scanning and captain briefings
- Boar's Head Tavern with bard, knight, and cellar encounters
- Map view of the estate and surrounding region
- Hidden synergy system: 7 strategy paths x 3 tiers (21 total synergies)

## Architecture

All game state lives in a single `useReducer` in `App.jsx`. The engine layer (`src/engine/`) is pure functions only — no side effects, no DOM access. Data definitions live in `src/data/`. Components in `src/components/`. See `CLAUDE.md` for full architecture docs.

## Commands

```bash
npm run dev       # Dev server at localhost:5173
npm run build     # Production build -> dist/
npm run lint      # ESLint (flat config)
npm run preview   # Preview production build
```
