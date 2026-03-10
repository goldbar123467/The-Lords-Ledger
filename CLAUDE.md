# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

The Lord's Ledger is a medieval economic simulation game for 6th graders. Players inherit a feudal estate and manage it for 28 turns (7 years x 4 seasons). Built with React 19 + Vite 7 + Tailwind CSS 4, pure JavaScript (no TypeScript).

## Commands

```bash
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # Production build → dist/
npm run lint      # ESLint (flat config, React hooks + refresh rules)
npm run preview   # Preview production build
```

No test framework is configured.

## Architecture

### State Machine (useReducer)

All game state lives in a single `useReducer` in `App.jsx`. The reducer (`src/engine/gameReducer.js`) is the source of truth for every state transition.

**Phase flow:**
```
title → management → seasonal_action → seasonal_resolve → random_event → random_resolve → management (next turn)
                                                                                          ↗
game_over (population = 0, or bankrupt 3 turns)
victory (survived 28 turns)
```

During `management`, the player browses tabs (Estate, Trade, Military, People) and makes decisions (build, trade, set tax rate). Clicking "Simulate Season" runs the economy engine then fires events.

### Engine Layer (`src/engine/`)

All engine files export **pure functions only** — no side effects, no I/O, no DOM access. Math.random() is the only exception (intentional RNG for event selection).

- **gameReducer.js** — 20+ action types. Event data is injected via action payloads, not imported directly. Resource-based state (no abstract meters).
- **economyEngine.js** — `simulateEconomy(state)` runs: production → consumption → upkeep → tax (Autumn only) → passive income → population growth. Returns updated resource values.
- **meterUtils.js** — Despite the legacy name, this now contains resource utilities: `translateEffects()` converts old meter-format event effects to resource deltas, `applyResourceEffects()` applies them, `checkGameOver()` checks population/bankruptcy.
- **eventSelector.js** — Simple event selection. `requiresMeter` gates converted to turn-based gates (military events after turn 3, faith events after turn 5).

### Resource System (replaces meters)

The game uses concrete resources instead of abstract meters:
- **Denarii** — money for building, trading, paying soldiers
- **Food** — grain + livestock + fish in inventory, consumed by population each season
- **Population** — families on the estate, grow with food surplus, leave during famine/high taxes
- **Garrison** — soldiers, cost upkeep and food, desert if unpaid/unfed

Game over: population = 0 (depopulation) or denarii = 0 for 3+ consecutive turns (bankruptcy).

Events still use old effect format `{ treasury: N, people: N }` which gets translated to resource deltas via `translateEffects()` in meterUtils.js.

### Tab Unlock

All tabs available from turn 1.

### Data Layer (`src/data/`)

- **buildings.js** — 12 buildings. Basic producers have `produces` only. Converters (fulling_mill, brewery) also have `consumes`. Max 2 of basic, 1 of advanced. Some require prerequisites.
- **economy.js** — Resource types, base sell/buy prices, `generateMarketPrices()` (±20% fluctuation), tax rates, castle levels, defense upgrades, constants.
- **seasonalEvents.js** — Object keyed by season (`{ spring: [...], summer: [...] }`). Flattened to array in App.jsx.
- **randomEvents.js** — Flat array. Each event has optional `requiresMeter` gate (used for turn-based filtering).
- **endings.js** — `failureNarratives.depopulation|bankruptcy`, `victoryTitles`, `getVictoryTitle(state)`, `victorySummary(state)`.

### Component Layer (`src/components/`)

- **Dashboard.jsx** — Sticky top bar. Row 1: four resource stats (denarii, food, families, garrison) with deltas. Row 2: season/year info. Warning banners for critical resources.
- **TabBar.jsx** — Horizontal tabs below dashboard. All tabs unlocked from turn 1.
- **EstateTab.jsx** — Economy overview box + inventory display + building card grid (3-col on desktop).
- **TradeTab.jsx** — Sell panel (from inventory) + buy panel (market goods). Quantity buttons: 1, 5, All.
- **Chronicle.jsx** — Reverse-chronological scrolling log. Entry types: action (gold), event (purple), system (brown italic).
- **EventCard.jsx** — Shows event title/description/options with indicator pills showing resource effects (translated from old meter format).

ResourceBar.jsx and SeasonHeader.jsx are V1 components superseded by Dashboard.jsx but still in the repo.

## Key Conventions

**State immutability:** Reducer always returns `{ ...state, field: newValue }`. Never mutate in place.

**Action shape:** `{ type: "SCREAMING_SNAKE", payload: { ... } }`. Event data arrays passed via payload, not imported by reducer.

**Chronicle entries:** `{ text, season, year, turn, type: "system"|"action"|"event" }`.

**Building demolish:** Refunds half the original cost.

**Market prices:** Regenerated via `generateMarketPrices()` at each turn advance.

**Theming:** Medieval parchment aesthetic. Custom CSS variables in `src/index.css` via Tailwind's `@theme`. Fonts: Cinzel (headings), Crimson Text (body) from Google Fonts.

**Styling approach:** Inline `style={{}}` for theme colors, Tailwind utility classes for layout. This is intentional — the custom parchment palette doesn't map cleanly to Tailwind color utilities.

## Adding Features

1. Add data definitions to `src/data/` (buildings, events, constants)
2. Add pure logic to `src/engine/` (economy calculations, validation)
3. Add reducer action case to `gameReducer.js`
4. Add or update component in `src/components/`
5. Wire dispatch handler in `App.jsx`

## Current Status

Resource-based architecture complete (meters removed). All core systems functional:
- Estate tab: building management with economy engine
- Trade tab: buy/sell with market price fluctuation
- Military tab: garrison recruit/dismiss, castle upgrades, defense installations
- People tab: tax rate + church donations (faith → economic benefit)
- Events: old meter effects auto-translated to resource effects via `translateEffects()`
- Game over: population = 0 or 3 consecutive bankrupt turns
- Victory: scored by wealth, population, garrison, buildings
- Full 28-turn playthrough testing needed
