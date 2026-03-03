/**
 * eventSelector.js
 *
 * Pure event-selection functions for The Lord's Ledger.
 * No side effects, no I/O. All randomness comes from Math.random() calls
 * that are intentionally not seeded — gameplay is non-deterministic by design,
 * but given the same inputs + rng outcome the result is deterministic.
 *
 * Terminology
 * -----------
 * "active meters" — meters unlocked at this tutorial stage:
 *   activeMeterCount 2 → treasury, people
 *   activeMeterCount 3 → treasury, people, military
 *   activeMeterCount 4 → treasury, people, military, faith  (all)
 *
 * Event shape (expected from data files)
 * ---------------------------------------
 * Seasonal event:
 *   { id, season, tutorialSafe?, effects: { treasury?, people?, military?, faith? }, options: [...] }
 *
 * Random event:
 *   { id, requiresMeter?: string, effects: { treasury?, people?, military?, faith? }, options: [...] }
 *
 * "requiresMeter" on a random event means the event should only appear once
 * that meter is active (e.g. a military raid event requires "military").
 */

const ACTIVE_METER_NAMES = {
  2: ["treasury", "people"],
  3: ["treasury", "people", "military"],
  4: ["treasury", "people", "military", "faith"],
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if every effect key in the event only touches currently active
 * meters. Events with no effects object (pure narrative) are always safe.
 *
 * @param {{ effects?: object }} event
 * @param {number} activeMeterCount
 * @returns {boolean}
 */
export function isEventSafeForTutorial(event, activeMeterCount) {
  const activeNames = ACTIVE_METER_NAMES[activeMeterCount] ?? ACTIVE_METER_NAMES[4];

  // Check root-level effects if present.
  if (event.effects) {
    const rootEffectKeys = Object.keys(event.effects);
    if (rootEffectKeys.some((k) => !activeNames.includes(k))) return false;
  }

  // Check per-option effects — this is where most events store their effects.
  if (Array.isArray(event.options)) {
    for (const option of event.options) {
      if (option.effects) {
        const optionKeys = Object.keys(option.effects);
        if (optionKeys.some((k) => !activeNames.includes(k))) return false;
      }
    }
  }

  return true;
}

/**
 * Picks one item at random from an array.
 * Returns null if the array is empty.
 *
 * @template T
 * @param {T[]} arr
 * @returns {T | null}
 */
function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Filters an event list to those not yet used.
 * If all events are used, returns the full list (resets used tracking implicitly).
 *
 * @template T
 * @param {T[]} events
 * @param {string[]} usedIds
 * @returns {T[]}
 */
function filterUnused(events, usedIds) {
  const unused = events.filter((e) => !usedIds.includes(e.id));
  // If every event has been used, treat the pool as fresh again so gameplay
  // continues. The caller is responsible for updating usedIds after selection.
  return unused.length > 0 ? unused : events;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Selects a seasonal event for the current season.
 *
 * Priority:
 *   1. Unused events that are safe for the current tutorial stage.
 *   2. All safe events (if all have been used).
 *   3. Any event for the season (last resort, if no safe ones exist).
 *
 * Returns null only when allSeasonalEvents is empty.
 *
 * @param {string} season - "spring" | "summer" | "autumn" | "winter"
 * @param {string[]} usedSeasonalIds
 * @param {number} activeMeterCount
 * @param {Array<object>} allSeasonalEvents
 * @returns {object | null}
 */
export function selectSeasonalEvent(season, usedSeasonalIds, activeMeterCount, allSeasonalEvents) {
  if (!allSeasonalEvents || allSeasonalEvents.length === 0) return null;

  // Narrow to the current season.
  const forSeason = allSeasonalEvents.filter((e) => e.season === season);
  if (forSeason.length === 0) {
    // Fallback: pick any event if there are none tagged for this season.
    return pickRandom(allSeasonalEvents);
  }

  // During tutorial, further filter to events that only touch active meters.
  const isTutorial = activeMeterCount < 4;
  const safeForTutorial = isTutorial
    ? forSeason.filter((e) => isEventSafeForTutorial(e, activeMeterCount))
    : forSeason;

  // If filtering left nothing, fall back to the full season pool.
  const candidates = safeForTutorial.length > 0 ? safeForTutorial : forSeason;

  // Prefer unused events; reset implicitly if all have been used.
  const unusedCandidates = filterUnused(candidates, usedSeasonalIds);

  return pickRandom(unusedCandidates);
}

/**
 * Selects a random (non-seasonal) event to follow a seasonal resolution.
 *
 * Returns null when:
 *   - No events are available.
 *   - The event pool (after filtering) is empty and there is nothing to show.
 *
 * Filtering rules:
 *   - If an event has `requiresMeter`, that meter must be active.
 *   - During tutorial (activeMeterCount < 4), event effects must only touch
 *     active meters.
 *
 * @param {string[]} usedRandomIds
 * @param {number} activeMeterCount
 * @param {Array<object>} allRandomEvents
 * @returns {object | null}
 */
export function selectRandomEvent(usedRandomIds, activeMeterCount, allRandomEvents) {
  if (!allRandomEvents || allRandomEvents.length === 0) return null;

  const activeNames = ACTIVE_METER_NAMES[activeMeterCount] ?? ACTIVE_METER_NAMES[4];

  // Filter by requiresMeter gate.
  const meterGated = allRandomEvents.filter((e) => {
    if (!e.requiresMeter) return true;
    return activeNames.includes(e.requiresMeter);
  });

  if (meterGated.length === 0) return null;

  // Apply tutorial safety filter.
  const isTutorial = activeMeterCount < 4;
  const safeForTutorial = isTutorial
    ? meterGated.filter((e) => isEventSafeForTutorial(e, activeMeterCount))
    : meterGated;

  const candidates = safeForTutorial.length > 0 ? safeForTutorial : meterGated;

  // Prefer unused.
  const unusedCandidates = filterUnused(candidates, usedRandomIds);

  return pickRandom(unusedCandidates);
}
