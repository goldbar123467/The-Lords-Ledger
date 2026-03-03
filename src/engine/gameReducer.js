/**
 * gameReducer.js
 *
 * useReducer-compatible reducer for The Lord's Ledger.
 *
 * State is plain-serializable JS — no class instances, no functions, no closures.
 * All transitions are pure: same action + same state = same result (modulo the
 * stochastic event selection, which intentionally uses Math.random()).
 *
 * Imports
 * -------
 * This module imports from ./meterUtils and ./eventSelector so those files must
 * be present. It does NOT import event data directly — callers inject event
 * arrays via actions (or the data can be imported at the call site and passed
 * through START_GAME / ADVANCE_TURN). For clean separation, the reducer receives
 * event collections through the action payload when they are needed.
 *
 * The typical wiring in a React component:
 *
 *   import seasonalEvents from "@/data/seasonalEvents";
 *   import randomEvents   from "@/data/randomEvents";
 *
 *   const [state, dispatch] = useReducer(gameReducer, initialState);
 *
 *   // Start:
 *   dispatch({ type: "START_GAME", payload: { seasonalEvents, randomEvents } });
 *
 *   // Player chooses an option:
 *   dispatch({ type: "SELECT_SEASONAL_ACTION", payload: { optionIndex: 1, randomEvents } });
 *
 *   // After resolve screen:
 *   dispatch({ type: "CONTINUE_TO_RANDOM" }); // random event picked internally from state cache
 *
 *   // Random response:
 *   dispatch({ type: "SELECT_RANDOM_RESPONSE", payload: { optionIndex: 0 } });
 *
 *   // After random resolve:
 *   dispatch({ type: "ADVANCE_TURN", payload: { seasonalEvents, randomEvents } });
 */

import {
  applyEffects,
  checkGameOver,
  getActiveMeterNames,
} from "./meterUtils.js";

import {
  selectSeasonalEvent,
  selectRandomEvent,
} from "./eventSelector.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEASONS = ["spring", "summer", "autumn", "winter"];

/**
 * The turn number at which each meter unlocks.
 * Treasury and people are always active (start at turn 1).
 */
const MILITARY_UNLOCK_TURN = 3;
const FAITH_UNLOCK_TURN = 5;

const MAX_TURNS = 28;
const MAX_CAUSE_CHAIN = 4;

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const initialState = {
  phase: "title",
  turn: 1,
  season: "spring",
  year: 1,
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
  chronicle: [],
  currentEvent: null,
  currentRandomEvent: null,
  scribesNote: null,
  usedSeasonalIds: [],
  usedRandomIds: [],
  causeChain: [],
  activeMeterCount: 2,
  gameOverReason: null,
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Computes which season and year correspond to a given turn number (1-based).
 *
 * Turn 1  → spring, year 1
 * Turn 4  → winter, year 1
 * Turn 5  → spring, year 2
 * …
 *
 * @param {number} turn
 * @returns {{ season: string, year: number }}
 */
function turnToSeasonYear(turn) {
  const zeroIndexed = turn - 1;
  const seasonIndex = zeroIndexed % 4;
  const year = Math.floor(zeroIndexed / 4) + 1;
  return { season: SEASONS[seasonIndex], year };
}

/**
 * Determines the activeMeterCount for a given turn.
 *
 * @param {number} turn
 * @returns {number} 2, 3, or 4
 */
function activeMeterCountForTurn(turn) {
  if (turn >= FAITH_UNLOCK_TURN) return 4;
  if (turn >= MILITARY_UNLOCK_TURN) return 3;
  return 2;
}

/**
 * Appends an entry to the chronicle array (immutably).
 *
 * @param {Array} chronicle
 * @param {string} text
 * @param {string} season
 * @param {number} year
 * @param {number} turn
 * @param {"action"|"event"|"system"} type
 * @returns {Array}
 */
function addChronicle(chronicle, text, season, year, turn, type = "system") {
  return [
    ...chronicle,
    { text, season, year, turn, type },
  ];
}

/**
 * Appends a cause-chain entry (keeps last MAX_CAUSE_CHAIN entries).
 *
 * @param {Array} causeChain
 * @param {number} turn
 * @param {string} season
 * @param {number} year
 * @param {string} summary
 * @returns {Array}
 */
function addCauseChain(causeChain, turn, season, year, summary) {
  const entry = { turn, season, year, summary };
  const next = [...causeChain, entry];
  return next.slice(-MAX_CAUSE_CHAIN);
}

/**
 * Computes a meterDeltas object showing how much each meter changed.
 *
 * @param {{ treasury: number, people: number, military: number, faith: number }} before
 * @param {{ treasury: number, people: number, military: number, faith: number }} after
 * @returns {{ treasury: number, people: number, military: number, faith: number }}
 */
function computeDeltas(before, after) {
  return {
    treasury: after.treasury - before.treasury,
    people: after.people - before.people,
    military: after.military - before.military,
    faith: after.faith - before.faith,
  };
}

/**
 * Picks a seasonal event and returns an updated usedSeasonalIds array.
 * If usedIds would cover every event for the season (or all events), resets them.
 *
 * @param {string} season
 * @param {string[]} usedSeasonalIds
 * @param {number} activeMeterCount
 * @param {Array} allSeasonalEvents
 * @returns {{ event: object|null, usedSeasonalIds: string[] }}
 */
function pickSeasonalEvent(season, usedSeasonalIds, activeMeterCount, allSeasonalEvents) {
  const event = selectSeasonalEvent(season, usedSeasonalIds, activeMeterCount, allSeasonalEvents);
  if (!event) return { event: null, usedSeasonalIds };

  // If selectSeasonalEvent returned something from the full pool (after reset),
  // we need to figure out whether to reset usedSeasonalIds or just append.
  const forSeason = (allSeasonalEvents || []).filter((e) => e.season === season);
  const allUsed = forSeason.every((e) => usedSeasonalIds.includes(e.id));
  const nextUsed = allUsed
    ? [event.id]
    : [...usedSeasonalIds.filter((id) => id !== event.id), event.id];

  return { event, usedSeasonalIds: nextUsed };
}

/**
 * Picks a random event and returns an updated usedRandomIds array.
 *
 * @param {string[]} usedRandomIds
 * @param {number} activeMeterCount
 * @param {Array} allRandomEvents
 * @returns {{ event: object|null, usedRandomIds: string[] }}
 */
function pickRandomEvent(usedRandomIds, activeMeterCount, allRandomEvents) {
  const event = selectRandomEvent(usedRandomIds, activeMeterCount, allRandomEvents);
  if (!event) return { event: null, usedRandomIds };

  const allUsed = (allRandomEvents || []).every((e) => usedRandomIds.includes(e.id));
  const nextUsed = allUsed
    ? [event.id]
    : [...usedRandomIds.filter((id) => id !== event.id), event.id];

  return { event, usedRandomIds: nextUsed };
}

/**
 * Extracts the effects for a given option index from an event.
 * Events may store effects at the option level, the event root level, or both.
 * Option-level effects take precedence; root-level effects are the fallback.
 *
 * @param {object} event
 * @param {number} optionIndex
 * @returns {{ treasury?: number, people?: number, military?: number, faith?: number }}
 */
function getOptionEffects(event, optionIndex) {
  const option = event.options?.[optionIndex];
  if (!option) return {};
  if (option.effects) return option.effects;
  // Some event designs store a single effect set at the root level. In that
  // case the option choice changes the narrative but applies the same numbers.
  return event.effects ?? {};
}

/**
 * Returns the scribesNote text for a chosen option, or null if none.
 *
 * @param {object} event
 * @param {number} optionIndex
 * @returns {string|null}
 */
function getScribesNote(event, optionIndex) {
  const option = event.options?.[optionIndex];
  return option?.scribesNote ?? event.scribesNote ?? null;
}

/**
 * Builds a concise cause-chain summary string for a player choice.
 *
 * @param {object} event
 * @param {number} optionIndex
 * @returns {string}
 */
function buildCauseChainSummary(event, optionIndex) {
  const option = event.options?.[optionIndex];
  if (option?.causeChainSummary) return option.causeChainSummary;
  if (option?.text) return option.text.slice(0, 80);
  if (event.title) return event.title.slice(0, 80);
  return `Turn choice at event ${event.id}`;
}

/**
 * Handles the shared logic of applying effects, computing deltas, checking
 * game over, and updating the cause chain after any player choice.
 *
 * Returns an object with the next partial state fields.
 *
 * @param {object} state        - Current full state
 * @param {object} event        - The event whose option was chosen
 * @param {number} optionIndex  - Index into event.options
 * @param {"action"|"event"} chronicleType
 * @returns {object}            - Partial state to merge
 */
function applyChoice(state, event, optionIndex, chronicleType) {
  const { meters, activeMeterCount, chronicle, causeChain, turn, season, year } = state;

  const effects = getOptionEffects(event, optionIndex);
  const newMeters = applyEffects(meters, effects, activeMeterCount);
  const deltas = computeDeltas(meters, newMeters);
  const gameOverReason = checkGameOver(newMeters, activeMeterCount);
  const scribesNote = getScribesNote(event, optionIndex);

  // Chronicle entry: prefer the option's result text, then the option text.
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

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * The main game reducer. Handles all state transitions.
 *
 * @param {object} state
 * @param {{ type: string, payload?: object }} action
 * @returns {object} Next state
 */
export function gameReducer(state, action) {
  switch (action.type) {

    // -----------------------------------------------------------------------
    case "START_GAME":
    case "PLAY_AGAIN": {
      const { seasonalEvents = [], randomEvents = [] } = action.payload ?? {};

      const startTurn = 1;
      const startActiveMeterCount = activeMeterCountForTurn(startTurn);
      const { season: startSeason, year: startYear } = turnToSeasonYear(startTurn);

      const { event: firstEvent, usedSeasonalIds } = pickSeasonalEvent(
        startSeason,
        [],
        startActiveMeterCount,
        seasonalEvents,
      );

      // Opening chronicle entry.
      const openingText =
        "The old lord has passed. You have inherited the estate. " +
        "The spring air carries both promise and uncertainty. Manage your treasury and your people wisely.";

      const chronicle = addChronicle([], openingText, startSeason, startYear, startTurn, "system");

      return {
        ...initialState,
        phase: "seasonal_action",
        turn: startTurn,
        season: startSeason,
        year: startYear,
        activeMeterCount: startActiveMeterCount,
        currentEvent: firstEvent,
        usedSeasonalIds,
        usedRandomIds: [],
        chronicle,
        // Preserve initial meter values from initialState — do not spread over them.
        meters: { ...initialState.meters },
        meterDeltas: { ...initialState.meterDeltas },
      };
    }

    // -----------------------------------------------------------------------
    case "SELECT_SEASONAL_ACTION": {
      const { optionIndex } = action.payload ?? {};
      const { currentEvent, phase } = state;

      // Guard: only valid during seasonal_action.
      if (phase !== "seasonal_action" || !currentEvent) return state;

      const partial = applyChoice(state, currentEvent, optionIndex, "action");

      // If game over, transition immediately.
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
    case "CONTINUE_TO_RANDOM": {
      const { phase, usedRandomIds, activeMeterCount } = state;
      const { randomEvents = [] } = action.payload ?? {};

      if (phase !== "seasonal_resolve") return state;

      // Pick a random event. If none eligible, skip straight to a waiting state
      // that the UI can immediately resolve by dispatching ADVANCE_TURN.
      const { event: randomEvent, usedRandomIds: nextUsedRandomIds } = pickRandomEvent(
        usedRandomIds,
        activeMeterCount,
        randomEvents,
      );

      if (!randomEvent) {
        // No eligible random event — move to a pseudo-resolve phase so the UI
        // can call ADVANCE_TURN without a player choice.
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
      };
    }

    // -----------------------------------------------------------------------
    case "ADVANCE_TURN": {
      const { phase, turn, usedSeasonalIds, usedRandomIds, chronicle, meters } = state;
      const { seasonalEvents = [], randomEvents = [] } = action.payload ?? {};

      // Accept advance from random_resolve or (if no random event) from seasonal_resolve.
      if (phase !== "random_resolve" && phase !== "seasonal_resolve") return state;

      // Victory: if the player just completed turn 28, they win.
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

      // Build any tutorial-unlock chronicle entries for newly activated meters.
      let nextChronicle = chronicle;

      if (nextTurn === MILITARY_UNLOCK_TURN) {
        nextChronicle = addChronicle(
          nextChronicle,
          "Raiders have been spotted near your borders. You must now manage your military forces.",
          nextSeason,
          nextYear,
          nextTurn,
          "system",
        );
      }

      if (nextTurn === FAITH_UNLOCK_TURN) {
        nextChronicle = addChronicle(
          nextChronicle,
          "The bishop arrives to inspect your chapel. The faith of your people now rests in your hands.",
          nextSeason,
          nextYear,
          nextTurn,
          "system",
        );
      }

      // Passive seasonal income: the estate collects rents and produces food
      // each season. This is historically accurate — lords had baseline revenue
      // from demesne land and tenant rents — and keeps the game survivable.
      const passiveEffects = { treasury: 3, people: -1 };
      const metersAfterPassive = applyEffects(meters, passiveEffects, nextActiveMeterCount);

      // Check game over from passive changes (very unlikely but handle it).
      const passiveGameOver = checkGameOver(metersAfterPassive, nextActiveMeterCount);
      if (passiveGameOver) {
        return {
          ...state,
          meters: metersAfterPassive,
          phase: "game_over",
          gameOverReason: passiveGameOver,
          chronicle: nextChronicle,
          currentEvent: null,
          currentRandomEvent: null,
        };
      }

      // Select next seasonal event.
      const { event: nextEvent, usedSeasonalIds: nextUsedSeasonalIds } = pickSeasonalEvent(
        nextSeason,
        usedSeasonalIds,
        nextActiveMeterCount,
        seasonalEvents,
      );

      // Reset meterDeltas for the new turn so arrows clear.
      const zeroDeltas = { treasury: 0, people: 0, military: 0, faith: 0 };

      return {
        ...state,
        phase: "seasonal_action",
        turn: nextTurn,
        season: nextSeason,
        year: nextYear,
        meters: metersAfterPassive,
        activeMeterCount: nextActiveMeterCount,
        currentEvent: nextEvent,
        currentRandomEvent: null,
        scribesNote: null,
        chronicle: nextChronicle,
        usedSeasonalIds: nextUsedSeasonalIds,
        meterDeltas: zeroDeltas,
      };
    }

    // -----------------------------------------------------------------------
    case "DISMISS_SCRIBES_NOTE": {
      return {
        ...state,
        scribesNote: null,
      };
    }

    // -----------------------------------------------------------------------
    default:
      return state;
  }
}

export default gameReducer;
