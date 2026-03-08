/**
 * gameReducer.js
 *
 * useReducer-compatible reducer for The Lord's Ledger.
 *
 * V2 additions:
 *  - `management` phase: player browses tabs, builds, trades, etc.
 *  - `SIMULATE_SEASON` action: runs economic engine, then fires events
 *  - `BUILD_BUILDING` / `DEMOLISH_BUILDING`: estate management
 *  - `SET_TAB`: switch active tab
 *  - `SELL_RESOURCE` / `BUY_RESOURCE`: trade tab
 *  - Economy state: denarii, food, population, inventory, buildings, garrison, etc.
 *
 * State is plain-serializable JS — no class instances, no functions, no closures.
 * All transitions are pure: same action + same state = same result (modulo the
 * stochastic event selection, which intentionally uses Math.random()).
 */

import {
  applyEffects,
  checkGameOver,
} from "./meterUtils.js";

import {
  selectSeasonalEvent,
  selectRandomEvent,
} from "./eventSelector.js";

import { simulateEconomy, canBuildBuilding, getTotalFood } from "./economyEngine.js";
import BUILDINGS from "../data/buildings.js";
import {
  EMPTY_INVENTORY, generateMarketPrices, DIFFICULTY_CONFIGS,
  CASTLE_LEVELS, CASTLE_LEVELS_EASY,
  DEFENSE_UPGRADES, DEFENSE_UPGRADES_EASY,
  RECRUIT_COST, MAX_GARRISON,
} from "../data/economy.js";
import { PERSPECTIVE_FLIPS } from "../data/perspectiveFlips.js";
import { checkFlipTriggers, getInitialFlipStats, resolveFlipOption, computeFlipConsequences } from "./flipEngine.js";
import { checkSynergies, getSynergyTradePriceBonus, getSynergyWoolSellBonus } from "./synergyEngine.js";
import { SYNERGY_TIER_MAP } from "../data/synergies.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEASONS = ["spring", "summer", "autumn", "winter"];

const MILITARY_UNLOCK_TURN = 3;
const FAITH_UNLOCK_TURN = 5;

/** Turn at which each tab unlocks */
const TAB_UNLOCK = {
  estate: 1,
  chronicle: 1,
  people: 1,
  trade: 3,
  military: 5,
};

const MAX_TURNS = 28;
const MAX_CAUSE_CHAIN = 4;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const initialState = {
  phase: "title",
  difficulty: "normal",
  turn: 1,
  season: "spring",
  year: 1,

  // Core meters (unchanged from V1)
  meters: {
    treasury: 40,
    people: 50,
    military: 30,
    faith: 45,
  },
  meterDeltas: {
    treasury: 0,
    people: 0,
    military: 0,
    faith: 0,
  },

  // V2: Economy state
  denarii: 500,
  food: 200,
  population: 20,
  inventory: { ...EMPTY_INVENTORY, grain: 150, livestock: 30, fish: 20 },
  inventoryCapacity: 300,
  buildings: [],       // Array of building IDs (e.g., ["strip_farm", "pasture"])
  garrison: 5,
  castleLevel: 1,
  castleUpgradeProgress: 0,
  castleUpgrading: false,
  taxRate: "medium",
  laborAllocation: { demesne: 40, peasant: 40, construction: 20 },
  marketPrices: generateMarketPrices(),
  defenseUpgrades: [],
  churchDonation: 0,

  // V2: UI state
  activeTab: "estate",

  // V2: Season report (economic summary lines shown in chronicle)
  seasonReport: [],

  // Event system (unchanged from V1)
  chronicle: [],
  currentEvent: null,
  currentRandomEvent: null,
  scribesNote: null,
  usedSeasonalIds: [],
  usedRandomIds: [],
  causeChain: [],
  activeMeterCount: 2,
  gameOverReason: null,

  // V3: Perspective flip state
  perspectiveFlips: { serf_week: false, merchant_day: false, noble_dilemma: false, knight_gamble: false },
  tradeCount: 0,
  militaryEventEverFired: false,
  currentFlipId: null,
  currentFlipStats: null,
  currentDecisionIndex: 0,
  flipConsequenceFlags: [],
  currentFlipOutcome: null,

  // V3b: Synergy system state
  synergies: {
    activated: [],
    tradeTypes: [],
    woolTrades: 0,
    spicePurchases: 0,
    lowTaxTurns: 0,
    highPeopleTurns: 0,
    highFaithTurns: 0,
    foodSurplusTurns: 0,
    revoltTriggered: false,
  },
  pendingSynergyNotifications: [],
};

// ---------------------------------------------------------------------------
// Internal helpers (all preserved from V1)
// ---------------------------------------------------------------------------

function turnToSeasonYear(turn) {
  const zeroIndexed = turn - 1;
  const seasonIndex = zeroIndexed % 4;
  const year = Math.floor(zeroIndexed / 4) + 1;
  return { season: SEASONS[seasonIndex], year };
}

function activeMeterCountForTurn(turn) {
  if (turn >= FAITH_UNLOCK_TURN) return 4;
  if (turn >= MILITARY_UNLOCK_TURN) return 3;
  return 2;
}

function addChronicle(chronicle, text, season, year, turn, type = "system") {
  return [
    ...chronicle,
    { text, season, year, turn, type },
  ];
}

function addCauseChain(causeChain, turn, season, year, summary) {
  const entry = { turn, season, year, summary };
  const next = [...causeChain, entry];
  return next.slice(-MAX_CAUSE_CHAIN);
}

function computeDeltas(before, after) {
  return {
    treasury: after.treasury - before.treasury,
    people: after.people - before.people,
    military: after.military - before.military,
    faith: after.faith - before.faith,
  };
}

function pickSeasonalEvent(season, usedSeasonalIds, activeMeterCount, allSeasonalEvents) {
  const event = selectSeasonalEvent(season, usedSeasonalIds, activeMeterCount, allSeasonalEvents);
  if (!event) return { event: null, usedSeasonalIds };

  const forSeason = (allSeasonalEvents || []).filter((e) => e.season === season);
  const allUsed = forSeason.every((e) => usedSeasonalIds.includes(e.id));
  const nextUsed = allUsed
    ? [event.id]
    : [...usedSeasonalIds.filter((id) => id !== event.id), event.id];

  return { event, usedSeasonalIds: nextUsed };
}

function pickRandomEvent(usedRandomIds, activeMeterCount, allRandomEvents) {
  const event = selectRandomEvent(usedRandomIds, activeMeterCount, allRandomEvents);
  if (!event) return { event: null, usedRandomIds };

  const allUsed = (allRandomEvents || []).every((e) => usedRandomIds.includes(e.id));
  const nextUsed = allUsed
    ? [event.id]
    : [...usedRandomIds.filter((id) => id !== event.id), event.id];

  return { event, usedRandomIds: nextUsed };
}

function getOptionEffects(event, optionIndex) {
  const option = event.options?.[optionIndex];
  if (!option) return {};
  if (option.effects) return option.effects;
  return event.effects ?? {};
}

function getScribesNote(event, optionIndex) {
  const option = event.options?.[optionIndex];
  return option?.scribesNote ?? event.scribesNote ?? null;
}

function buildCauseChainSummary(event, optionIndex) {
  const option = event.options?.[optionIndex];
  if (option?.causeChainSummary) return option.causeChainSummary;
  if (option?.text) return option.text.slice(0, 80);
  if (event.title) return event.title.slice(0, 80);
  return `Turn choice at event ${event.id}`;
}

function applyChoice(state, event, optionIndex, chronicleType) {
  const { meters, activeMeterCount, chronicle, causeChain, turn, season, year } = state;

  const effects = getOptionEffects(event, optionIndex);
  const newMeters = applyEffects(meters, effects, activeMeterCount);
  const deltas = computeDeltas(meters, newMeters);
  const gameOverReason = checkGameOver(newMeters, activeMeterCount);
  const scribesNote = getScribesNote(event, optionIndex);

  const option = event.options?.[optionIndex];
  const chronicleText = option?.chronicle ?? option?.resultText ?? option?.text ?? event.title ?? "A decision was made.";

  const newChronicle = addChronicle(chronicle, chronicleText, season, year, turn, chronicleType);

  const summary = buildCauseChainSummary(event, optionIndex);
  const newCauseChain = addCauseChain(causeChain, turn, season, year, summary);

  return {
    meters: newMeters,
    meterDeltas: deltas,
    chronicle: newChronicle,
    causeChain: newCauseChain,
    scribesNote,
    gameOverReason,
  };
}

/**
 * Returns which tabs are unlocked for a given turn.
 */
export function getUnlockedTabs(turn) {
  return Object.entries(TAB_UNLOCK)
    .filter(([, unlockTurn]) => turn >= unlockTurn)
    .map(([tab]) => tab);
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function gameReducer(state, action) {
  switch (action.type) {

    // -----------------------------------------------------------------------
    // START / RESTART — V2: go to management phase, not seasonal_action
    // -----------------------------------------------------------------------
    case "START_GAME":
    case "PLAY_AGAIN": {
      const difficulty = action.payload?.difficulty || state.difficulty || "normal";
      const config = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.normal;
      const startInventory = { ...EMPTY_INVENTORY, ...config.startingInventory };

      const startTurn = 1;
      const startActiveMeterCount = activeMeterCountForTurn(startTurn);
      const { season: startSeason, year: startYear } = turnToSeasonYear(startTurn);

      const openingText =
        "The old lord has passed. You have inherited the estate. " +
        "The spring air carries both promise and uncertainty. " +
        "Build your manor, manage your resources, then simulate the season to see what unfolds.";

      const chronicle = addChronicle([], openingText, startSeason, startYear, startTurn, "system");

      return {
        ...initialState,
        phase: "management",
        difficulty,
        turn: startTurn,
        season: startSeason,
        year: startYear,
        activeMeterCount: startActiveMeterCount,
        currentEvent: null,
        usedSeasonalIds: [],
        usedRandomIds: [],
        chronicle,
        meters: { ...config.startingMeters },
        meterDeltas: { ...initialState.meterDeltas },
        denarii: config.startingDenarii,
        food: getTotalFood(startInventory),
        population: config.startingPopulation,
        inventory: startInventory,
        inventoryCapacity: 300,
        buildings: [],
        garrison: 5,
        castleLevel: 1,
        castleUpgradeProgress: 0,
        castleUpgrading: false,
        taxRate: "medium",
        laborAllocation: { demesne: 40, peasant: 40, construction: 20 },
        marketPrices: generateMarketPrices(),
        defenseUpgrades: [],
        churchDonation: 0,
        activeTab: "estate",
        seasonReport: [],
        synergies: {
          activated: [], tradeTypes: [], woolTrades: 0, spicePurchases: 0,
          lowTaxTurns: 0, highPeopleTurns: 0, highFaithTurns: 0,
          foodSurplusTurns: 0, revoltTriggered: false,
        },
        pendingSynergyNotifications: [],
      };
    }

    // -----------------------------------------------------------------------
    // SET_TAB — Switch active tab during management phase
    // -----------------------------------------------------------------------
    case "SET_TAB": {
      const { tab } = action.payload ?? {};
      if (!tab) return state;
      return { ...state, activeTab: tab };
    }

    // -----------------------------------------------------------------------
    // BUILD_BUILDING — Construct a building on the estate
    // -----------------------------------------------------------------------
    case "BUILD_BUILDING": {
      const { buildingId } = action.payload ?? {};
      if (state.phase !== "management") return state;

      const def = BUILDINGS[buildingId];
      if (!def) return state;

      const check = canBuildBuilding(buildingId, state);
      if (!check.canBuild) return state;

      return {
        ...state,
        denarii: state.denarii - def.cost,
        buildings: [...state.buildings, buildingId],
        chronicle: addChronicle(state.chronicle, `Built a ${def.name} for ${def.cost}d.`, state.season, state.year, state.turn, "action"),
      };
    }

    // -----------------------------------------------------------------------
    // DEMOLISH_BUILDING — Remove a building (by index in buildings array)
    // -----------------------------------------------------------------------
    case "DEMOLISH_BUILDING": {
      const { buildingIndex } = action.payload ?? {};
      if (state.phase !== "management") return state;
      if (buildingIndex < 0 || buildingIndex >= state.buildings.length) return state;

      const newBuildings = [...state.buildings];
      newBuildings.splice(buildingIndex, 1);

      // Refund half the cost
      const removedId = state.buildings[buildingIndex];
      const def = BUILDINGS[removedId];
      const refund = def ? Math.floor(def.cost / 2) : 0;

      return {
        ...state,
        buildings: newBuildings,
        denarii: state.denarii + refund,
        chronicle: addChronicle(state.chronicle, `Demolished a ${def?.name || "building"}. Refunded ${refund}d.`, state.season, state.year, state.turn, "action"),
      };
    }

    // -----------------------------------------------------------------------
    // SELL_RESOURCE — Sell from inventory at market price
    // -----------------------------------------------------------------------
    case "SELL_RESOURCE": {
      const { resource, quantity } = action.payload ?? {};
      if (state.phase !== "management") return state;
      const available = state.inventory[resource] || 0;
      if (available <= 0 || quantity <= 0) return state;

      const sellQty = Math.min(quantity, available);
      const activated = state.synergies?.activated ?? [];
      const basePrice = state.marketPrices.sell?.[resource] || 0;
      const tradeBonus = getSynergyTradePriceBonus(activated);
      const isWoolish = resource === "wool" || resource === "cloth";
      const woolBonus = isWoolish ? getSynergyWoolSellBonus(activated) : 0;
      const price = basePrice + tradeBonus + woolBonus;
      const income = sellQty * price;
      const newInventory = { ...state.inventory, [resource]: available - sellQty };

      const prevSynergies = state.synergies ?? {};
      const newWoolTrades = prevSynergies.woolTrades + (isWoolish ? sellQty : 0);
      const newTradeTypes = prevSynergies.tradeTypes.includes(resource)
        ? prevSynergies.tradeTypes
        : [...prevSynergies.tradeTypes, resource];

      const sellCfg = { grain: "Grain", livestock: "Livestock", fish: "Fish", timber: "Timber", clay: "Clay", iron: "Iron", stone: "Stone", wool: "Wool", cloth: "Cloth", honey: "Honey", herbs: "Herbs", ale: "Ale" };
      return {
        ...state,
        inventory: newInventory,
        denarii: state.denarii + income,
        food: getTotalFood(newInventory),
        tradeCount: (state.tradeCount || 0) + 1,
        synergies: { ...prevSynergies, woolTrades: newWoolTrades, tradeTypes: newTradeTypes },
        chronicle: addChronicle(state.chronicle, `Sold ${sellQty} ${sellCfg[resource] || resource} for ${income}d.`, state.season, state.year, state.turn, "action"),
      };
    }

    // -----------------------------------------------------------------------
    // BUY_RESOURCE — Buy from market into inventory
    // -----------------------------------------------------------------------
    case "BUY_RESOURCE": {
      const { resource, quantity } = action.payload ?? {};
      if (state.phase !== "management") return state;

      const price = state.marketPrices.buy?.[resource] || 0;
      if (price <= 0 || quantity <= 0) return state;

      // Cap purchase quantity by what the player can afford
      const maxAfford = Math.floor(state.denarii / price);
      const buyQty = Math.min(quantity, maxAfford);
      if (buyQty <= 0) return state;

      const totalCost = price * buyQty;
      const currentQty = state.inventory[resource] || 0;
      const newInventory = { ...state.inventory, [resource]: currentQty + buyQty };

      const prevSynergies = state.synergies ?? {};
      const newSpicePurchases = prevSynergies.spicePurchases + (resource === "spices" ? buyQty : 0);
      const newTradeTypes = prevSynergies.tradeTypes.includes(resource)
        ? prevSynergies.tradeTypes
        : [...prevSynergies.tradeTypes, resource];

      const buyCfg = { grain: "Grain", livestock: "Livestock", fish: "Fish", timber: "Timber", clay: "Clay", iron: "Iron", stone: "Stone", salt: "Salt", tools: "Tools", spices: "Spices" };
      return {
        ...state,
        denarii: state.denarii - totalCost,
        inventory: newInventory,
        food: getTotalFood(newInventory),
        tradeCount: (state.tradeCount || 0) + 1,
        synergies: { ...prevSynergies, spicePurchases: newSpicePurchases, tradeTypes: newTradeTypes },
        chronicle: addChronicle(state.chronicle, `Bought ${buyQty} ${buyCfg[resource] || resource} for ${totalCost}d.`, state.season, state.year, state.turn, "action"),
      };
    }

    // -----------------------------------------------------------------------
    // SET_TAX_RATE — Change tax rate during management
    // -----------------------------------------------------------------------
    case "SET_TAX_RATE": {
      const { rate } = action.payload ?? {};
      if (state.phase !== "management") return state;
      if (!["low", "medium", "high", "crushing"].includes(rate)) return state;
      return { ...state, taxRate: rate };
    }

    // -----------------------------------------------------------------------
    // RECRUIT_SOLDIERS — Pay denarii to add soldiers to garrison
    // -----------------------------------------------------------------------
    case "RECRUIT_SOLDIERS": {
      const { count } = action.payload ?? {};
      if (state.phase !== "management") return state;
      if (!count || count <= 0) return state;

      const maxCanAfford = Math.floor(state.denarii / RECRUIT_COST);
      const maxByLimit = MAX_GARRISON - state.garrison;
      // Can't recruit more than 60% of population — the rest must work the fields
      const maxByPop = Math.floor(state.population * 0.6) - state.garrison;
      const actual = Math.min(count, maxCanAfford, maxByLimit, maxByPop);
      if (actual <= 0) return state;

      return {
        ...state,
        denarii: state.denarii - (actual * RECRUIT_COST),
        garrison: state.garrison + actual,
        chronicle: addChronicle(state.chronicle, `Recruited ${actual} ${actual === 1 ? "soldier" : "soldiers"} for ${actual * RECRUIT_COST}d.`, state.season, state.year, state.turn, "action"),
      };
    }

    // -----------------------------------------------------------------------
    // DISMISS_SOLDIERS — Remove soldiers to save upkeep
    // -----------------------------------------------------------------------
    case "DISMISS_SOLDIERS": {
      const { count } = action.payload ?? {};
      if (state.phase !== "management") return state;
      if (!count || count <= 0) return state;

      const actual = Math.min(count, state.garrison);
      if (actual <= 0) return state;

      return {
        ...state,
        garrison: state.garrison - actual,
        chronicle: addChronicle(state.chronicle, `Dismissed ${actual} ${actual === 1 ? "soldier" : "soldiers"}.`, state.season, state.year, state.turn, "action"),
      };
    }

    // -----------------------------------------------------------------------
    // UPGRADE_CASTLE — Pay denarii + resources to upgrade castle level
    // -----------------------------------------------------------------------
    case "UPGRADE_CASTLE": {
      if (state.phase !== "management") return state;
      const castleLevels = state.difficulty === "easy" ? CASTLE_LEVELS_EASY : CASTLE_LEVELS;
      const nextLevel = state.castleLevel + 1;
      const nextCastle = castleLevels[nextLevel];
      if (!nextCastle) return state;

      if (state.denarii < nextCastle.cost) return state;
      if ((state.inventory.stone || 0) < nextCastle.stone) return state;
      if ((state.inventory.timber || 0) < nextCastle.timber) return state;
      if ((state.inventory.iron || 0) < nextCastle.iron) return state;

      const newInventory = {
        ...state.inventory,
        stone: (state.inventory.stone || 0) - nextCastle.stone,
        timber: (state.inventory.timber || 0) - nextCastle.timber,
        iron: (state.inventory.iron || 0) - nextCastle.iron,
      };

      return {
        ...state,
        denarii: state.denarii - nextCastle.cost,
        castleLevel: nextLevel,
        inventory: newInventory,
        food: getTotalFood(newInventory),
        chronicle: addChronicle(state.chronicle, `Upgraded castle to ${nextCastle.name} for ${nextCastle.cost}d.`, state.season, state.year, state.turn, "action"),
      };
    }

    // -----------------------------------------------------------------------
    // INSTALL_DEFENSE — Buy and install a defense upgrade
    // -----------------------------------------------------------------------
    case "INSTALL_DEFENSE": {
      const { upgradeId } = action.payload ?? {};
      if (state.phase !== "management") return state;

      const defenseTable = state.difficulty === "easy" ? DEFENSE_UPGRADES_EASY : DEFENSE_UPGRADES;
      const upgrade = defenseTable[upgradeId];
      if (!upgrade) return state;
      if (state.defenseUpgrades.includes(upgradeId)) return state;

      if (state.denarii < upgrade.cost) return state;
      if ((state.inventory.stone || 0) < upgrade.stone) return state;
      if ((state.inventory.iron || 0) < upgrade.iron) return state;
      if ((state.inventory.timber || 0) < upgrade.timber) return state;

      const newInventory = {
        ...state.inventory,
        stone: (state.inventory.stone || 0) - upgrade.stone,
        iron: (state.inventory.iron || 0) - upgrade.iron,
        timber: (state.inventory.timber || 0) - upgrade.timber,
      };

      return {
        ...state,
        denarii: state.denarii - upgrade.cost,
        defenseUpgrades: [...state.defenseUpgrades, upgradeId],
        inventory: newInventory,
        food: getTotalFood(newInventory),
        chronicle: addChronicle(state.chronicle, `Installed ${upgrade.name} for ${upgrade.cost}d.`, state.season, state.year, state.turn, "action"),
      };
    }

    // -----------------------------------------------------------------------
    // DONATE_TO_CHURCH — Donate denarii for faith boost at season resolve
    // -----------------------------------------------------------------------
    case "DONATE_TO_CHURCH": {
      const { amount } = action.payload ?? {};
      if (state.phase !== "management") return state;
      if (!amount || amount <= 0) return state;
      if (state.denarii < amount) return state;

      return {
        ...state,
        denarii: state.denarii - amount,
        churchDonation: (state.churchDonation || 0) + amount,
        chronicle: addChronicle(state.chronicle, `Donated ${amount}d to the Church.`, state.season, state.year, state.turn, "action"),
      };
    }

    // -----------------------------------------------------------------------
    // SIMULATE_SEASON — Run economic engine, then fire seasonal event
    // -----------------------------------------------------------------------
    case "SIMULATE_SEASON": {
      if (state.phase !== "management") return state;

      const { seasonalEvents = [] } = action.payload ?? {};
      const { turn, season, year, usedSeasonalIds, activeMeterCount, meters } = state;

      // 1. Run the full economic simulation
      const econResult = simulateEconomy({
        denarii: state.denarii,
        population: state.population,
        inventory: state.inventory,
        inventoryCapacity: state.inventoryCapacity,
        buildings: state.buildings,
        garrison: state.garrison,
        castleLevel: state.castleLevel,
        taxRate: state.taxRate,
        season,
        meters,
        activeMeterCount,
        turn,
        difficulty: state.difficulty,
        defenseUpgrades: state.defenseUpgrades,
        churchDonation: state.churchDonation ?? 0,
      });

      // 2. Apply meter effects from economy
      const metersBeforeEcon = { ...meters };
      const metersAfterEcon = applyEffects(meters, econResult.meterEffects, activeMeterCount);

      // 3. Castle upgrade progress
      let castleUpgradeProgress = state.castleUpgradeProgress;
      let castleUpgrading = state.castleUpgrading;
      let castleLevel = state.castleLevel;
      if (castleUpgrading) {
        castleUpgradeProgress += 1;
        // Check completion (we'll implement full castle upgrades in Military tab)
      }

      // 4. Add economic report to chronicle
      let nextChronicle = state.chronicle;
      for (const line of econResult.report) {
        nextChronicle = addChronicle(nextChronicle, line, season, year, turn, "system");
      }

      // 5. Check game over from economic effects
      const econGameOver = checkGameOver(metersAfterEcon, activeMeterCount);
      if (econGameOver) {
        return {
          ...state,
          meters: metersAfterEcon,
          meterDeltas: computeDeltas(metersBeforeEcon, metersAfterEcon),
          denarii: econResult.denarii,
          food: econResult.food,
          population: econResult.population,
          inventory: econResult.inventory,
          chronicle: nextChronicle,
          seasonReport: econResult.report,
          castleUpgradeProgress,
          castleUpgrading,
          castleLevel,
          phase: "game_over",
          gameOverReason: econGameOver,
          currentEvent: null,
          currentRandomEvent: null,
          churchDonation: 0,
        };
      }

      // 6. Pick the seasonal event
      const { event: seasonalEvent, usedSeasonalIds: nextUsedSeasonalIds } = pickSeasonalEvent(
        season,
        usedSeasonalIds,
        activeMeterCount,
        seasonalEvents,
      );

      return {
        ...state,
        meters: metersAfterEcon,
        meterDeltas: computeDeltas(metersBeforeEcon, metersAfterEcon),
        denarii: econResult.denarii,
        food: econResult.food,
        population: econResult.population,
        inventory: econResult.inventory,
        chronicle: nextChronicle,
        seasonReport: econResult.report,
        castleUpgradeProgress,
        castleUpgrading,
        castleLevel,
        phase: "seasonal_action",
        currentEvent: seasonalEvent,
        usedSeasonalIds: nextUsedSeasonalIds,
        activeTab: "chronicle",
        churchDonation: 0,
      };
    }

    // -----------------------------------------------------------------------
    // SELECT_SEASONAL_ACTION (unchanged from V1)
    // -----------------------------------------------------------------------
    case "SELECT_SEASONAL_ACTION": {
      const { optionIndex } = action.payload ?? {};
      const { currentEvent, phase } = state;

      if (phase !== "seasonal_action" || !currentEvent) return state;

      const partial = applyChoice(state, currentEvent, optionIndex, "action");

      // Revolt tracking: if People meter drops to <=15
      let synergiesAfterAction = state.synergies;
      if (partial.meters.people <= 15 && partial.meters.people < state.meters.people) {
        synergiesAfterAction = { ...synergiesAfterAction, revoltTriggered: true };
      }

      if (partial.gameOverReason) {
        return {
          ...state,
          ...partial,
          phase: "game_over",
          currentEvent: null,
          synergies: synergiesAfterAction,
        };
      }

      return {
        ...state,
        ...partial,
        phase: "seasonal_resolve",
        synergies: synergiesAfterAction,
      };
    }

    // -----------------------------------------------------------------------
    // CONTINUE_TO_RANDOM (unchanged from V1)
    // -----------------------------------------------------------------------
    case "CONTINUE_TO_RANDOM": {
      const { phase, usedRandomIds, activeMeterCount } = state;
      const { randomEvents = [] } = action.payload ?? {};

      if (phase !== "seasonal_resolve") return state;

      const { event: randomEvent, usedRandomIds: nextUsedRandomIds } = pickRandomEvent(
        usedRandomIds,
        activeMeterCount,
        randomEvents,
      );

      if (!randomEvent) {
        return {
          ...state,
          phase: "random_resolve",
          currentRandomEvent: null,
          usedRandomIds: nextUsedRandomIds,
        };
      }

      return {
        ...state,
        phase: "random_event",
        currentRandomEvent: randomEvent,
        usedRandomIds: nextUsedRandomIds,
      };
    }

    // -----------------------------------------------------------------------
    // SELECT_RANDOM_RESPONSE (unchanged from V1)
    // -----------------------------------------------------------------------
    case "SELECT_RANDOM_RESPONSE": {
      const { optionIndex } = action.payload ?? {};
      const { currentRandomEvent, phase } = state;

      if (phase !== "random_event" || !currentRandomEvent) return state;

      const partial = applyChoice(state, currentRandomEvent, optionIndex, "event");

      // Revolt tracking: if People meter drops to <=15
      let synergiesAfterRandom = state.synergies;
      if (partial.meters.people <= 15 && partial.meters.people < state.meters.people) {
        synergiesAfterRandom = { ...synergiesAfterRandom, revoltTriggered: true };
      }

      if (partial.gameOverReason) {
        return {
          ...state,
          ...partial,
          phase: "game_over",
          currentRandomEvent: null,
          synergies: synergiesAfterRandom,
        };
      }

      return {
        ...state,
        ...partial,
        phase: "random_resolve",
        militaryEventEverFired: state.militaryEventEverFired || (currentRandomEvent?.requiresMeter === "military"),
        synergies: synergiesAfterRandom,
      };
    }

    // -----------------------------------------------------------------------
    // ADVANCE_TURN — V2: go to management phase, no passive effects
    //   (passive effects are now handled by SIMULATE_SEASON's economy engine)
    // -----------------------------------------------------------------------
    case "ADVANCE_TURN": {
      const { phase, turn, chronicle } = state;

      if (phase !== "random_resolve" && phase !== "seasonal_resolve") return state;

      // Victory check
      if (turn >= MAX_TURNS) {
        const victoryText =
          "Seven years have passed. Your reign has endured through war, famine, and feast. " +
          "The chronicles will remember your name.";
        const { season, year } = turnToSeasonYear(turn);
        return {
          ...state,
          phase: "victory",
          chronicle: addChronicle(chronicle, victoryText, season, year, turn, "system"),
          currentEvent: null,
          currentRandomEvent: null,
          scribesNote: null,
        };
      }

      const nextTurn = turn + 1;
      const { season: nextSeason, year: nextYear } = turnToSeasonYear(nextTurn);
      const nextActiveMeterCount = activeMeterCountForTurn(nextTurn);

      // Tutorial-unlock chronicle entries
      let nextChronicle = chronicle;

      if (nextTurn === MILITARY_UNLOCK_TURN) {
        nextChronicle = addChronicle(
          nextChronicle,
          "Raiders have been spotted near your borders. You must now manage your military forces.",
          nextSeason, nextYear, nextTurn, "system",
        );
      }

      if (nextTurn === FAITH_UNLOCK_TURN) {
        nextChronicle = addChronicle(
          nextChronicle,
          "The bishop arrives to inspect your chapel. The faith of your people now rests in your hands.",
          nextSeason, nextYear, nextTurn, "system",
        );
      }

      // Generate new market prices for the new season
      const newMarketPrices = generateMarketPrices();

      const zeroDeltas = { treasury: 0, people: 0, military: 0, faith: 0 };

      // --- Synergy consecutive counters ---
      const prevSyn = state.synergies ?? {};
      const taxIsLow = state.taxRate === "low" || state.taxRate === "medium";
      const newLowTaxTurns = taxIsLow ? (prevSyn.lowTaxTurns ?? 0) + 1 : 0;
      const newHighPeopleTurns = (state.meters.people ?? 0) > 60
        ? (prevSyn.highPeopleTurns ?? 0) + 1 : 0;
      const newHighFaithTurns = (state.meters.faith ?? 0) > 70
        ? (prevSyn.highFaithTurns ?? 0) + 1 : 0;
      const newFoodSurplusTurns = (state.food ?? 0) > 100
        ? (prevSyn.foodSurplusTurns ?? 0) + 1 : 0;

      const updatedSynergies = {
        ...prevSyn,
        lowTaxTurns: newLowTaxTurns,
        highPeopleTurns: newHighPeopleTurns,
        highFaithTurns: newHighFaithTurns,
        foodSurplusTurns: newFoodSurplusTurns,
      };

      // Check for newly activated synergies
      const stateForSynergyCheck = { ...state, synergies: updatedSynergies };
      const newSynergyIds = checkSynergies(stateForSynergyCheck);

      let synergiesAfterCheck = updatedSynergies;
      let synChronicle = nextChronicle;
      let synNotifications = [];

      if (newSynergyIds.length > 0) {
        synergiesAfterCheck = {
          ...updatedSynergies,
          activated: [...(updatedSynergies.activated ?? []), ...newSynergyIds],
        };
        for (const tierId of newSynergyIds) {
          const entry = SYNERGY_TIER_MAP[tierId];
          if (entry?.tier.chronicle) {
            synChronicle = addChronicle(
              synChronicle, entry.tier.chronicle, nextSeason, nextYear, nextTurn, "event",
            );
          }
          synNotifications.push({
            tierId,
            tier: entry?.tier.tier ?? 1,
            title: entry?.tier.title ?? "",
            description: entry?.tier.description ?? "",
            pathName: entry?.path.name ?? "",
            pathIcon: entry?.path.icon ?? "",
            pathColor: entry?.path.color ?? "#b8860b",
            scribesNote: entry?.tier.scribesNote ?? null,
          });
        }
      }

      // Check if a perspective flip should trigger this turn
      const triggeredFlipId = checkFlipTriggers({
        ...state,
        turn: nextTurn,
        activeMeterCount: nextActiveMeterCount,
      });

      if (triggeredFlipId) {
        return {
          ...state,
          phase: "flip_intro",
          turn: nextTurn,
          season: nextSeason,
          year: nextYear,
          activeMeterCount: nextActiveMeterCount,
          chronicle: synChronicle,
          marketPrices: newMarketPrices,
          meterDeltas: zeroDeltas,
          currentEvent: null,
          currentRandomEvent: null,
          scribesNote: null,
          seasonReport: [],
          synergies: synergiesAfterCheck,
          pendingSynergyNotifications: synNotifications,
          // Flip state
          currentFlipId: triggeredFlipId,
          currentFlipStats: getInitialFlipStats(triggeredFlipId),
          currentDecisionIndex: 0,
          flipConsequenceFlags: [],
          currentFlipOutcome: null,
        };
      }

      return {
        ...state,
        phase: "management",
        turn: nextTurn,
        season: nextSeason,
        year: nextYear,
        activeMeterCount: nextActiveMeterCount,
        currentEvent: null,
        currentRandomEvent: null,
        scribesNote: null,
        chronicle: synChronicle,
        meterDeltas: zeroDeltas,
        marketPrices: newMarketPrices,
        activeTab: "estate",
        seasonReport: [],
        synergies: synergiesAfterCheck,
        pendingSynergyNotifications: synNotifications,
      };
    }

    // -----------------------------------------------------------------------
    // DISMISS_SCRIBES_NOTE (unchanged from V1)
    // -----------------------------------------------------------------------
    case "DISMISS_SCRIBES_NOTE": {
      return { ...state, scribesNote: null };
    }

    // -----------------------------------------------------------------------
    // V3: Perspective Flip actions
    // -----------------------------------------------------------------------
    case "DISMISS_FLIP_INTRO": {
      if (state.phase !== "flip_intro") return state;
      return { ...state, phase: "flip_decision" };
    }

    case "SELECT_FLIP_OPTION": {
      if (state.phase !== "flip_decision") return state;
      const { optionIndex } = action.payload ?? {};
      const flip = PERSPECTIVE_FLIPS[state.currentFlipId];
      if (!flip) return state;

      const decision = flip.decisions[state.currentDecisionIndex];
      if (!decision) return state;

      const option = decision.options[optionIndex];
      if (!option) return state;

      const { nextStats, consequenceFlags, outcome, wasSuccess } = resolveFlipOption(
        option,
        state.currentFlipStats,
      );

      return {
        ...state,
        phase: "flip_outcome",
        currentFlipStats: nextStats,
        flipConsequenceFlags: [...state.flipConsequenceFlags, ...consequenceFlags],
        currentFlipOutcome: outcome,
        flipOutcomeWasSuccess: wasSuccess,
      };
    }

    case "CONTINUE_FLIP": {
      if (state.phase !== "flip_outcome") return state;
      const flip = PERSPECTIVE_FLIPS[state.currentFlipId];
      if (!flip) return state;

      const nextIndex = state.currentDecisionIndex + 1;

      if (nextIndex >= flip.decisions.length) {
        return {
          ...state,
          phase: "flip_summary",
          currentFlipOutcome: null,
        };
      }

      return {
        ...state,
        phase: "flip_decision",
        currentDecisionIndex: nextIndex,
        currentFlipOutcome: null,
      };
    }

    case "DISMISS_FLIP_SUMMARY": {
      if (state.phase !== "flip_summary") return state;

      const { currentFlipId, flipConsequenceFlags, turn, meters, activeMeterCount, chronicle } = state;
      const flip = PERSPECTIVE_FLIPS[currentFlipId];
      if (!flip) return state;

      // Compute lord-meter consequences
      const consequences = computeFlipConsequences(currentFlipId, flipConsequenceFlags);
      const newMeters = applyEffects(meters, consequences, activeMeterCount);
      const deltas = computeDeltas(meters, newMeters);
      const gameOverReason = checkGameOver(newMeters, activeMeterCount);

      // Chronicle entry
      const { season: flipSeason, year: flipYear } = turnToSeasonYear(turn);
      const chronicleText = `You experienced life as ${flip.character} and saw your manor through their eyes.`;
      let nextChronicle = addChronicle(chronicle, chronicleText, flipSeason, flipYear, turn, "event");

      // Mark flip as fired
      const nextPerspectiveFlips = { ...state.perspectiveFlips, [currentFlipId]: true };

      if (gameOverReason) {
        return {
          ...state,
          phase: "game_over",
          meters: newMeters,
          meterDeltas: deltas,
          chronicle: nextChronicle,
          gameOverReason,
          perspectiveFlips: nextPerspectiveFlips,
          currentFlipId: null,
          currentFlipStats: null,
          currentDecisionIndex: 0,
          flipConsequenceFlags: [],
          currentFlipOutcome: null,
        };
      }

      // Advance to next turn's management phase
      const advanceTurn = turn + 1;

      // Victory check (the flip consumed a turn)
      if (turn >= MAX_TURNS) {
        const victoryText =
          "Seven years have passed. Your reign has endured through war, famine, and feast. " +
          "The chronicles will remember your name.";
        return {
          ...state,
          phase: "victory",
          meters: newMeters,
          meterDeltas: deltas,
          chronicle: addChronicle(nextChronicle, victoryText, flipSeason, flipYear, turn, "system"),
          perspectiveFlips: nextPerspectiveFlips,
          currentFlipId: null,
          currentFlipStats: null,
          currentDecisionIndex: 0,
          flipConsequenceFlags: [],
          currentFlipOutcome: null,
          currentEvent: null,
          currentRandomEvent: null,
          scribesNote: null,
        };
      }

      const { season: nextSeason, year: nextYear } = turnToSeasonYear(advanceTurn);
      const nextActiveMeterCount = activeMeterCountForTurn(advanceTurn);

      // Tutorial-unlock chronicle entries for the new turn
      if (advanceTurn === MILITARY_UNLOCK_TURN) {
        nextChronicle = addChronicle(
          nextChronicle,
          "Raiders have been spotted near your borders. You must now manage your military forces.",
          nextSeason, nextYear, advanceTurn, "system",
        );
      }
      if (advanceTurn === FAITH_UNLOCK_TURN) {
        nextChronicle = addChronicle(
          nextChronicle,
          "The bishop arrives to inspect your chapel. The faith of your people now rests in your hands.",
          nextSeason, nextYear, advanceTurn, "system",
        );
      }

      return {
        ...state,
        phase: "management",
        turn: advanceTurn,
        season: nextSeason,
        year: nextYear,
        activeMeterCount: nextActiveMeterCount,
        meters: newMeters,
        meterDeltas: deltas,
        chronicle: nextChronicle,
        marketPrices: generateMarketPrices(),
        perspectiveFlips: nextPerspectiveFlips,
        activeTab: "estate",
        seasonReport: [],
        currentEvent: null,
        currentRandomEvent: null,
        scribesNote: null,
        // Reset flip state
        currentFlipId: null,
        currentFlipStats: null,
        currentDecisionIndex: 0,
        flipConsequenceFlags: [],
        currentFlipOutcome: null,
      };
    }

    // -----------------------------------------------------------------------
    // V3b: Dismiss synergy notification (pop first from queue)
    // -----------------------------------------------------------------------
    case "DISMISS_SYNERGY_NOTIFICATION": {
      const queue = state.pendingSynergyNotifications ?? [];
      return {
        ...state,
        pendingSynergyNotifications: queue.slice(1),
      };
    }

    // -----------------------------------------------------------------------
    default:
      return state;
  }
}

export default gameReducer;
