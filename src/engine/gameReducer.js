/**
 * gameReducer.js
 *
 * useReducer-compatible reducer for The Lord's Ledger.
 *
 * Resource-based architecture: no abstract meters (treasury/people/military/faith).
 * All game state is expressed through concrete resources:
 *   denarii, food, population, garrison, inventory, buildings, castle, etc.
 *
 * State is plain-serializable JS — no class instances, no functions, no closures.
 * All transitions are pure: same action + same state = same result (modulo RNG).
 */

import {
  translateEffects,
  applyResourceEffects,
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

  // Resources (replaces abstract meters)
  denarii: 500,
  food: 200,
  population: 20,
  inventory: { ...EMPTY_INVENTORY, grain: 150, livestock: 30, fish: 20 },
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

  // Resource deltas (for dashboard display)
  resourceDeltas: { denarii: 0, food: 0, population: 0, garrison: 0 },

  // Bankruptcy tracking (3 consecutive turns at 0 denarii = game over)
  bankruptcyTurns: 0,

  // UI state
  activeTab: "estate",
  seasonReport: [],

  // Event system
  chronicle: [],
  currentEvent: null,
  currentRandomEvent: null,
  scribesNote: null,
  usedSeasonalIds: [],
  usedRandomIds: [],
  causeChain: [],
  gameOverReason: null,

  // Perspective flip state
  perspectiveFlips: { serf_week: false, merchant_day: false, noble_dilemma: false, knight_gamble: false },
  tradeCount: 0,
  militaryEventEverFired: false,
  currentFlipId: null,
  currentFlipStats: null,
  currentDecisionIndex: 0,
  flipConsequenceFlags: [],
  currentFlipOutcome: null,

  // Synergy system state (simplified — no meter-based tracking)
  synergies: {
    activated: [],
    tradeTypes: [],
    woolTrades: 0,
    spicePurchases: 0,
    lowTaxTurns: 0,
    foodSurplusTurns: 0,
  },
  pendingSynergyNotifications: [],

  // Tavern state
  tavern: {
    gambitRoundsThisSeason: 0,
    gambitLastChoice: null,
    gambitTotalWins: 0,
    gambitTotalLosses: 0,
    gambitNetEarnings: 0,
    ratsPlayedThisSeason: false,
    ratsBestScore: 0,
    bardRiddlesSolved: 0,
    wallStashFound: false,
    strangerAppearedThisSeason: false,
    totalVisits: 0,
    gambitScribesNoteSeen: false,
    ratsScribesNoteSeen: false,
  },
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function turnToSeasonYear(turn) {
  const zeroIndexed = turn - 1;
  const seasonIndex = zeroIndexed % 4;
  const year = Math.floor(zeroIndexed / 4) + 1;
  return { season: SEASONS[seasonIndex], year };
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

function computeResourceDeltas(before, after) {
  return {
    denarii: after.denarii - before.denarii,
    food: after.food - before.food,
    population: after.population - before.population,
    garrison: after.garrison - before.garrison,
  };
}

function pickSeasonalEvent(season, usedSeasonalIds, turn, allSeasonalEvents) {
  const event = selectSeasonalEvent(season, usedSeasonalIds, turn, allSeasonalEvents);
  if (!event) return { event: null, usedSeasonalIds };

  const forSeason = (allSeasonalEvents || []).filter((e) => e.season === season);
  const allUsed = forSeason.every((e) => usedSeasonalIds.includes(e.id));
  const nextUsed = allUsed
    ? [event.id]
    : [...usedSeasonalIds.filter((id) => id !== event.id), event.id];

  return { event, usedSeasonalIds: nextUsed };
}

function pickRandomEvent(usedRandomIds, turn, allRandomEvents) {
  const event = selectRandomEvent(usedRandomIds, turn, allRandomEvents);
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

/**
 * Apply an event choice: translate effects to resources, apply them, check game over.
 */
function applyChoice(state, event, optionIndex, chronicleType) {
  const { chronicle, causeChain, turn, season, year } = state;

  const effects = getOptionEffects(event, optionIndex);
  const resourceEffects = translateEffects(effects);
  const applied = applyResourceEffects(state, resourceEffects, MAX_GARRISON);
  const scribesNote = getScribesNote(event, optionIndex);

  const option = event.options?.[optionIndex];
  const chronicleText = option?.chronicle ?? option?.resultText ?? option?.text ?? event.title ?? "A decision was made.";

  const newChronicle = addChronicle(chronicle, chronicleText, season, year, turn, chronicleType);

  const summary = buildCauseChainSummary(event, optionIndex);
  const newCauseChain = addCauseChain(causeChain, turn, season, year, summary);

  const newState = {
    ...state,
    denarii: applied.denarii,
    population: applied.population,
    garrison: applied.garrison,
    inventory: applied.inventory,
    food: applied.food,
  };
  const gameOverReason = checkGameOver(newState);

  const resourceDeltas = {
    denarii: applied.denarii - state.denarii,
    food: applied.food - state.food,
    population: applied.population - state.population,
    garrison: applied.garrison - state.garrison,
  };

  return {
    denarii: applied.denarii,
    population: applied.population,
    garrison: applied.garrison,
    inventory: applied.inventory,
    food: applied.food,
    resourceDeltas,
    chronicle: newChronicle,
    causeChain: newCauseChain,
    scribesNote,
    gameOverReason,
  };
}

/**
 * Returns which tabs are unlocked for a given turn.
 * All tabs unlocked from turn 1 in resource-based mode.
 */
export function getUnlockedTabs() {
  return ["estate", "map", "trade", "military", "people", "chronicle"];
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function gameReducer(state, action) {
  switch (action.type) {

    // -----------------------------------------------------------------------
    // START / RESTART
    // -----------------------------------------------------------------------
    case "START_GAME":
    case "PLAY_AGAIN": {
      const difficulty = action.payload?.difficulty || state.difficulty || "normal";
      const config = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.normal;
      const startInventory = { ...EMPTY_INVENTORY, ...config.startingInventory };

      const startTurn = 1;
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
        currentEvent: null,
        usedSeasonalIds: [],
        usedRandomIds: [],
        chronicle,
        denarii: config.startingDenarii,
        food: getTotalFood(startInventory),
        population: config.startingPopulation,
        garrison: config.startingGarrison ?? 5,
        inventory: startInventory,
        inventoryCapacity: 300,
        buildings: [],
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
        resourceDeltas: { denarii: 0, food: 0, population: 0, garrison: 0 },
        bankruptcyTurns: 0,
        synergies: {
          activated: [], tradeTypes: [], woolTrades: 0, spicePurchases: 0,
          lowTaxTurns: 0, foodSurplusTurns: 0,
        },
        pendingSynergyNotifications: [],
        tavern: {
          gambitRoundsThisSeason: 0,
          gambitLastChoice: null,
          gambitTotalWins: 0,
          gambitTotalLosses: 0,
          gambitNetEarnings: 0,
          ratsPlayedThisSeason: false,
          ratsBestScore: 0,
          bardRiddlesSolved: 0,
          wallStashFound: false,
          strangerAppearedThisSeason: false,
          totalVisits: 0,
          gambitScribesNoteSeen: false,
          ratsScribesNoteSeen: false,
        },
      };
    }

    // -----------------------------------------------------------------------
    // SET_TAB
    // -----------------------------------------------------------------------
    case "SET_TAB": {
      const { tab } = action.payload ?? {};
      if (!tab) return state;
      return { ...state, activeTab: tab };
    }

    // -----------------------------------------------------------------------
    // BUILD_BUILDING
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
    // DEMOLISH_BUILDING
    // -----------------------------------------------------------------------
    case "DEMOLISH_BUILDING": {
      const { buildingIndex } = action.payload ?? {};
      if (state.phase !== "management") return state;
      if (buildingIndex < 0 || buildingIndex >= state.buildings.length) return state;

      const newBuildings = [...state.buildings];
      newBuildings.splice(buildingIndex, 1);

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
    // SELL_RESOURCE
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
    // BUY_RESOURCE
    // -----------------------------------------------------------------------
    case "BUY_RESOURCE": {
      const { resource, quantity } = action.payload ?? {};
      if (state.phase !== "management") return state;

      const price = state.marketPrices.buy?.[resource] || 0;
      if (price <= 0 || quantity <= 0) return state;

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
    // SET_TAX_RATE
    // -----------------------------------------------------------------------
    case "SET_TAX_RATE": {
      const { rate } = action.payload ?? {};
      if (state.phase !== "management") return state;
      if (!["low", "medium", "high", "crushing"].includes(rate)) return state;
      return { ...state, taxRate: rate };
    }

    // -----------------------------------------------------------------------
    // RECRUIT_SOLDIERS
    // -----------------------------------------------------------------------
    case "RECRUIT_SOLDIERS": {
      const { count } = action.payload ?? {};
      if (state.phase !== "management") return state;
      if (!count || count <= 0) return state;

      const maxCanAfford = Math.floor(state.denarii / RECRUIT_COST);
      const maxByLimit = MAX_GARRISON - state.garrison;
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
    // DISMISS_SOLDIERS
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
    // UPGRADE_CASTLE
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
    // INSTALL_DEFENSE
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
    // DONATE_TO_CHURCH
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
    // SIMULATE_SEASON
    // -----------------------------------------------------------------------
    case "SIMULATE_SEASON": {
      if (state.phase !== "management") return state;

      const { seasonalEvents = [] } = action.payload ?? {};
      const { turn, season, year, usedSeasonalIds } = state;

      // Snapshot before economy
      const before = { denarii: state.denarii, food: state.food, population: state.population, garrison: state.garrison };

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
        turn,
        difficulty: state.difficulty,
        defenseUpgrades: state.defenseUpgrades,
        churchDonation: state.churchDonation ?? 0,
        synergies: state.synergies,
      });

      // 2. Track bankruptcy
      let bankruptcyTurns = state.bankruptcyTurns || 0;
      if (econResult.denarii <= 0) {
        bankruptcyTurns += 1;
      } else {
        bankruptcyTurns = 0;
      }

      // 3. Add economic report to chronicle
      let nextChronicle = state.chronicle;
      for (const line of econResult.report) {
        nextChronicle = addChronicle(nextChronicle, line, season, year, turn, "system");
      }

      // 4. Check game over from economy
      const afterState = {
        population: econResult.population,
        bankruptcyTurns,
      };
      const econGameOver = checkGameOver(afterState);
      if (econGameOver) {
        return {
          ...state,
          denarii: econResult.denarii,
          food: econResult.food,
          population: econResult.population,
          garrison: econResult.garrison,
          inventory: econResult.inventory,
          chronicle: nextChronicle,
          seasonReport: econResult.report,
          resourceDeltas: computeResourceDeltas(before, {
            denarii: econResult.denarii,
            food: econResult.food,
            population: econResult.population,
            garrison: econResult.garrison,
          }),
          bankruptcyTurns,
          phase: "game_over",
          gameOverReason: econGameOver,
          currentEvent: null,
          currentRandomEvent: null,
          churchDonation: 0,
        };
      }

      // 5. Pick the seasonal event
      const { event: seasonalEvent, usedSeasonalIds: nextUsedSeasonalIds } = pickSeasonalEvent(
        season,
        usedSeasonalIds,
        turn,
        seasonalEvents,
      );

      // Reset tavern seasonal limits
      const tavernSeasonReset = {
        ...state.tavern,
        gambitRoundsThisSeason: 0,
        ratsPlayedThisSeason: false,
        strangerAppearedThisSeason: false,
      };

      return {
        ...state,
        denarii: econResult.denarii,
        food: econResult.food,
        population: econResult.population,
        garrison: econResult.garrison,
        inventory: econResult.inventory,
        chronicle: nextChronicle,
        seasonReport: econResult.report,
        resourceDeltas: computeResourceDeltas(before, {
          denarii: econResult.denarii,
          food: econResult.food,
          population: econResult.population,
          garrison: econResult.garrison,
        }),
        bankruptcyTurns,
        phase: "seasonal_action",
        currentEvent: seasonalEvent,
        usedSeasonalIds: nextUsedSeasonalIds,
        activeTab: "chronicle",
        churchDonation: 0,
        tavern: tavernSeasonReset,
      };
    }

    // -----------------------------------------------------------------------
    // SELECT_SEASONAL_ACTION
    // -----------------------------------------------------------------------
    case "SELECT_SEASONAL_ACTION": {
      const { optionIndex } = action.payload ?? {};
      const { currentEvent, phase } = state;

      if (phase !== "seasonal_action" || !currentEvent) return state;

      const partial = applyChoice(state, currentEvent, optionIndex, "action");

      if (partial.gameOverReason) {
        return {
          ...state,
          ...partial,
          phase: "game_over",
          currentEvent: null,
        };
      }

      return {
        ...state,
        ...partial,
        phase: "seasonal_resolve",
      };
    }

    // -----------------------------------------------------------------------
    // CONTINUE_TO_RANDOM
    // -----------------------------------------------------------------------
    case "CONTINUE_TO_RANDOM": {
      const { phase, usedRandomIds, turn } = state;
      const { randomEvents = [] } = action.payload ?? {};

      if (phase !== "seasonal_resolve") return state;

      const { event: randomEvent, usedRandomIds: nextUsedRandomIds } = pickRandomEvent(
        usedRandomIds,
        turn,
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
    // SELECT_RANDOM_RESPONSE
    // -----------------------------------------------------------------------
    case "SELECT_RANDOM_RESPONSE": {
      const { optionIndex } = action.payload ?? {};
      const { currentRandomEvent, phase } = state;

      if (phase !== "random_event" || !currentRandomEvent) return state;

      const partial = applyChoice(state, currentRandomEvent, optionIndex, "event");

      if (partial.gameOverReason) {
        return {
          ...state,
          ...partial,
          phase: "game_over",
          currentRandomEvent: null,
        };
      }

      return {
        ...state,
        ...partial,
        phase: "random_resolve",
        militaryEventEverFired: state.militaryEventEverFired || (currentRandomEvent?.requiresMeter === "military"),
      };
    }

    // -----------------------------------------------------------------------
    // ADVANCE_TURN
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

      let nextChronicle = chronicle;

      // Generate new market prices for the new season
      const newMarketPrices = generateMarketPrices();

      const zeroDeltas = { denarii: 0, food: 0, population: 0, garrison: 0 };

      // --- Synergy consecutive counters ---
      const prevSyn = state.synergies ?? {};
      const taxIsLow = state.taxRate === "low" || state.taxRate === "medium";
      const newLowTaxTurns = taxIsLow ? (prevSyn.lowTaxTurns ?? 0) + 1 : 0;
      const newFoodSurplusTurns = (state.food ?? 0) > 100
        ? (prevSyn.foodSurplusTurns ?? 0) + 1 : 0;

      const updatedSynergies = {
        ...prevSyn,
        lowTaxTurns: newLowTaxTurns,
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
      });

      if (triggeredFlipId) {
        return {
          ...state,
          phase: "flip_intro",
          turn: nextTurn,
          season: nextSeason,
          year: nextYear,
          chronicle: synChronicle,
          marketPrices: newMarketPrices,
          resourceDeltas: zeroDeltas,
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
        currentEvent: null,
        currentRandomEvent: null,
        scribesNote: null,
        chronicle: synChronicle,
        resourceDeltas: zeroDeltas,
        marketPrices: newMarketPrices,
        activeTab: "estate",
        seasonReport: [],
        synergies: synergiesAfterCheck,
        pendingSynergyNotifications: synNotifications,
      };
    }

    // -----------------------------------------------------------------------
    // DISMISS_SCRIBES_NOTE
    // -----------------------------------------------------------------------
    case "DISMISS_SCRIBES_NOTE": {
      return { ...state, scribesNote: null };
    }

    // -----------------------------------------------------------------------
    // Perspective Flip actions
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

      const { currentFlipId, flipConsequenceFlags, turn, chronicle } = state;
      const flip = PERSPECTIVE_FLIPS[currentFlipId];
      if (!flip) return state;

      // Compute consequences and translate to resource effects
      const consequences = computeFlipConsequences(currentFlipId, flipConsequenceFlags);
      const resourceEffects = translateEffects(consequences);
      const applied = applyResourceEffects(state, resourceEffects, MAX_GARRISON);

      const newState = {
        ...state,
        denarii: applied.denarii,
        population: applied.population,
        garrison: applied.garrison,
        inventory: applied.inventory,
        food: applied.food,
      };
      const gameOverReason = checkGameOver(newState);

      // Chronicle entry
      const { season: flipSeason, year: flipYear } = turnToSeasonYear(turn);
      const chronicleText = `You experienced life as ${flip.character} and saw your manor through their eyes.`;
      let nextChronicle = addChronicle(chronicle, chronicleText, flipSeason, flipYear, turn, "event");

      // Mark flip as fired
      const nextPerspectiveFlips = { ...state.perspectiveFlips, [currentFlipId]: true };

      if (gameOverReason) {
        return {
          ...state,
          ...newState,
          phase: "game_over",
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

      // Victory check
      if (turn >= MAX_TURNS) {
        const victoryText =
          "Seven years have passed. Your reign has endured through war, famine, and feast. " +
          "The chronicles will remember your name.";
        return {
          ...state,
          ...newState,
          phase: "victory",
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

      return {
        ...state,
        ...newState,
        phase: "management",
        turn: advanceTurn,
        season: nextSeason,
        year: nextYear,
        chronicle: nextChronicle,
        marketPrices: generateMarketPrices(),
        perspectiveFlips: nextPerspectiveFlips,
        activeTab: "estate",
        seasonReport: [],
        currentEvent: null,
        currentRandomEvent: null,
        scribesNote: null,
        currentFlipId: null,
        currentFlipStats: null,
        currentDecisionIndex: 0,
        flipConsequenceFlags: [],
        currentFlipOutcome: null,
      };
    }

    // -----------------------------------------------------------------------
    // Dismiss synergy notification
    // -----------------------------------------------------------------------
    case "DISMISS_SYNERGY_NOTIFICATION": {
      const queue = state.pendingSynergyNotifications ?? [];
      return {
        ...state,
        pendingSynergyNotifications: queue.slice(1),
      };
    }

    // -----------------------------------------------------------------------
    // TAVERN ACTIONS
    // -----------------------------------------------------------------------

    case "TAVERN_VISIT": {
      if (state.phase !== "management") return state;
      const prevTavern = state.tavern ?? {};
      return {
        ...state,
        tavern: {
          ...prevTavern,
          totalVisits: (prevTavern.totalVisits ?? 0) + 1,
        },
        chronicle: addChronicle(state.chronicle, "You visited the Boar\u2019s Head Tavern.", state.season, state.year, state.turn, "action"),
      };
    }

    case "TAVERN_GAMBIT_RESULT": {
      if (state.phase !== "management") return state;
      const { result, wager } = action.payload ?? {};
      // result: "win" | "lose" | "draw"
      const prevT = state.tavern ?? {};
      const net = result === "win" ? wager : result === "lose" ? -wager : 0;
      const newDenarii = Math.max(0, state.denarii + net);

      const label = result === "win" ? "won" : result === "lose" ? "lost" : "drew at";
      const absNet = Math.abs(net);

      return {
        ...state,
        denarii: newDenarii,
        tavern: {
          ...prevT,
          gambitRoundsThisSeason: (prevT.gambitRoundsThisSeason ?? 0) + 1,
          gambitTotalWins: (prevT.gambitTotalWins ?? 0) + (result === "win" ? 1 : 0),
          gambitTotalLosses: (prevT.gambitTotalLosses ?? 0) + (result === "lose" ? 1 : 0),
          gambitNetEarnings: (prevT.gambitNetEarnings ?? 0) + net,
        },
        chronicle: addChronicle(
          state.chronicle,
          result === "draw"
            ? `You ${label} Knight\u2019s Gambit. No coins changed hands.`
            : `You ${label} ${absNet}d at Knight\u2019s Gambit.`,
          state.season, state.year, state.turn, "action",
        ),
      };
    }

    case "TAVERN_GAMBIT_SET_LAST": {
      const { choice } = action.payload ?? {};
      return {
        ...state,
        tavern: { ...state.tavern, gambitLastChoice: choice },
      };
    }

    case "TAVERN_GAMBIT_SCRIBES_NOTE_SEEN": {
      return {
        ...state,
        tavern: { ...state.tavern, gambitScribesNoteSeen: true },
      };
    }

    case "TAVERN_RATS_RESULT": {
      if (state.phase !== "management") return state;
      const { caught, foodLost, reward } = action.payload ?? {};
      const prevTav = state.tavern ?? {};
      const newFood = Math.max(0, state.food - foodLost);
      const newDen = state.denarii + (reward ?? 0);

      // Apply food loss to inventory (remove from grain first, then livestock, then fish)
      let remainingLoss = foodLost;
      const newInv = { ...state.inventory };
      for (const key of ["grain", "livestock", "fish"]) {
        if (remainingLoss <= 0) break;
        const available = newInv[key] || 0;
        const take = Math.min(available, remainingLoss);
        newInv[key] = available - take;
        remainingLoss -= take;
      }

      return {
        ...state,
        denarii: newDen,
        food: newFood,
        inventory: newInv,
        tavern: {
          ...prevTav,
          ratsPlayedThisSeason: true,
          ratsBestScore: Math.max(prevTav.ratsBestScore ?? 0, caught),
        },
        chronicle: addChronicle(
          state.chronicle,
          `You cleared ${caught} rats from the cellar. ${foodLost > 0 ? `${foodLost} food was lost to vermin.` : "No food was lost!"}${reward > 0 ? ` Earned ${reward}d for your efforts.` : ""}`,
          state.season, state.year, state.turn, "action",
        ),
      };
    }

    case "TAVERN_RATS_SCRIBES_NOTE_SEEN": {
      return {
        ...state,
        tavern: { ...state.tavern, ratsScribesNoteSeen: true },
      };
    }

    case "TAVERN_BARD_RIDDLE_SOLVED": {
      if (state.phase !== "management") return state;
      const prevTvn = state.tavern ?? {};
      return {
        ...state,
        denarii: state.denarii + 10,
        tavern: {
          ...prevTvn,
          bardRiddlesSolved: (prevTvn.bardRiddlesSolved ?? 0) + 1,
        },
        chronicle: addChronicle(state.chronicle, "The bard\u2019s riddle earned you 10d.", state.season, state.year, state.turn, "action"),
      };
    }

    case "TAVERN_WALL_STASH": {
      if (state.phase !== "management") return state;
      const prevTv = state.tavern ?? {};
      if (prevTv.wallStashFound) return state;
      return {
        ...state,
        denarii: state.denarii + 25,
        tavern: { ...prevTv, wallStashFound: true },
        chronicle: addChronicle(state.chronicle, "You found a hidden coin purse in the tavern wall! +25d.", state.season, state.year, state.turn, "action"),
      };
    }

    case "TAVERN_STRANGER_TRADE": {
      if (state.phase !== "management") return state;
      const { cost, foodReward } = action.payload ?? {};
      if (state.denarii < cost) return state;
      const prevTa = state.tavern ?? {};

      const newInvStr = { ...state.inventory };
      newInvStr.grain = (newInvStr.grain || 0) + (foodReward ?? 0);

      return {
        ...state,
        denarii: state.denarii - cost,
        inventory: newInvStr,
        food: getTotalFood(newInvStr),
        tavern: { ...prevTa, strangerAppearedThisSeason: true },
        chronicle: addChronicle(state.chronicle, "A mysterious stranger sold you provisions.", state.season, state.year, state.turn, "action"),
      };
    }

    case "TAVERN_STRANGER_DISMISS": {
      const prevTab = state.tavern ?? {};
      return {
        ...state,
        tavern: { ...prevTab, strangerAppearedThisSeason: true },
        chronicle: addChronicle(state.chronicle, "A mysterious stranger offered you counsel.", state.season, state.year, state.turn, "action"),
      };
    }

    // -----------------------------------------------------------------------
    default:
      return state;
  }
}

export default gameReducer;
