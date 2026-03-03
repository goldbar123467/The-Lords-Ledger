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
game_over (any meter hits 0 or 100)
victory (survived 28 turns)
```

During `management`, the player browses tabs (Estate, Trade, Military, People) and makes decisions (build, trade, set tax rate). Clicking "Simulate Season" runs the economy engine then fires events.

### Engine Layer (`src/engine/`)

All engine files export **pure functions only** — no side effects, no I/O, no DOM access. Math.random() is the only exception (intentional RNG for event selection).

- **gameReducer.js** — 20+ action types. Event data is injected via action payloads, not imported directly.
- **economyEngine.js** — `simulateEconomy(state)` runs: production → consumption → upkeep → tax (Autumn only) → passive income → meter adjustments → population growth. `canBuildBuilding()` validates cost/prerequisites/limits.
- **meterUtils.js** — `applyEffects()` clamps meters to [0,100] and ignores locked meters. `checkGameOver()` returns the first meter at 0 or 100.
- **eventSelector.js** — Tutorial safety filtering: events in turns 1-4 must only reference unlocked meters. `requiresMeter` gate prevents military/faith events before those meters activate.

### Tutorial Meter Unlock

Turns 1-2: treasury + people only. Turn 3: +military. Turn 5: +faith. Events and effects for locked meters are silently filtered/ignored.

### Tab Unlock

Estate, People, Chronicle: turn 1. Trade: turn 3. Military: turn 5.

### Data Layer (`src/data/`)

- **buildings.js** — 12 buildings. Basic producers have `produces` only. Converters (fulling_mill, brewery) also have `consumes`. Max 2 of basic, 1 of advanced. Some require prerequisites.
- **economy.js** — Resource types, base sell/buy prices, `generateMarketPrices()` (±20% fluctuation), tax rates, castle levels, defense upgrades, constants.
- **seasonalEvents.js** — Object keyed by season (`{ spring: [...], summer: [...] }`). Flattened to array in App.jsx.
- **randomEvents.js** — Flat array. Each event has optional `requiresMeter` gate.
- **endings.js** — `failureNarratives[meter][zero|hundred]`, `victoryTitles[meter|balanced]`, `victorySummary(meters)`.

### Component Layer (`src/components/`)

- **Dashboard.jsx** — Sticky top bar. Row 1: four core meters with flash animations. Row 2: denarii, food, population, season/year.
- **TabBar.jsx** — Horizontal tabs below dashboard. Locked tabs shown grayed out.
- **EstateTab.jsx** — Economy overview box + inventory display + building card grid (3-col on desktop).
- **TradeTab.jsx** — Sell panel (from inventory) + buy panel (market goods). Quantity buttons: 1, 5, All.
- **Chronicle.jsx** — Reverse-chronological scrolling log. Entry types: action (gold), event (purple), system (brown italic).
- **EventCard.jsx** — Shows event title/description/options with indicator pills showing meter effects.

ResourceBar.jsx and SeasonHeader.jsx are V1 components superseded by Dashboard.jsx but still in the repo.

## Key Conventions

**State immutability:** Reducer always returns `{ ...state, field: newValue }`. Never mutate in place.

**Action shape:** `{ type: "SCREAMING_SNAKE", payload: { ... } }`. Event data arrays passed via payload, not imported by reducer.

**Chronicle entries:** `{ text, season, year, turn, type: "system"|"action"|"event" }`.

**Building demolish:** Refunds half the original cost.

**Market prices:** Regenerated via `generateMarketPrices()` at each turn advance.

**Theming:** Medieval parchment aesthetic. Custom CSS variables in `src/index.css` via Tailwind's `@theme`. Fonts: Cinzel (headings), Crimson Text (body) from Google Fonts. Meter colors: treasury=#b8860b, people=#2d5a27, military=#8b1a1a, faith=#4a1a6b.

**Styling approach:** Inline `style={{}}` for theme colors, Tailwind utility classes for layout. This is intentional — the custom parchment palette doesn't map cleanly to Tailwind color utilities.

## Adding Features

1. Add data definitions to `src/data/` (buildings, events, constants)
2. Add pure logic to `src/engine/` (economy calculations, validation)
3. Add reducer action case to `gameReducer.js`
4. Add or update component in `src/components/`
5. Wire dispatch handler in `App.jsx`

## V2 Expansion Status

Steps 1-3 of the build order are complete (tabbed layout, chronicle migration, estate tab with economy engine). Remaining:
- Trade tab: functional buy/sell UI is built
- Military tab: display-only (garrison recruit/dismiss, castle upgrades not wired)
- People tab: tax rate works, labor allocation is a stub
- Full 28-turn playthrough testing needed
