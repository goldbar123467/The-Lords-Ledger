/**
 * meterUtils.js
 *
 * Pure utility functions for meter management in The Lord's Ledger.
 * No side effects, no I/O. All functions are deterministic.
 */

// The canonical order and unlock progression for meters.
// Turns 1-2: treasury + people only
// Turns 3-4: + military
// Turns 5+:  + faith
const METER_ORDER = ["treasury", "people", "military", "faith"];

/**
 * Returns the array of currently active meter names given the tutorial count.
 *
 * @param {number} activeMeterCount - 2, 3, or 4
 * @returns {string[]}
 */
export function getActiveMeterNames(activeMeterCount) {
  return METER_ORDER.slice(0, activeMeterCount);
}

/**
 * Applies a set of numeric effects to meters, clamping each result to [0, 100].
 * Effects for meters that are not yet active are silently ignored.
 *
 * @param {{ treasury: number, people: number, military: number, faith: number }} meters
 * @param {{ treasury?: number, people?: number, military?: number, faith?: number }} effects
 * @param {number} activeMeterCount
 * @returns {{ treasury: number, people: number, military: number, faith: number }}
 */
export function applyEffects(meters, effects, activeMeterCount) {
  const activeNames = getActiveMeterNames(activeMeterCount);
  const next = { ...meters };

  for (const name of activeNames) {
    if (effects[name] !== undefined) {
      next[name] = Math.min(100, Math.max(0, next[name] + effects[name]));
    }
  }

  return next;
}

/**
 * Checks whether any active meter has reached 0 (depletion) or 100 (overflow crisis).
 * Returns the first such violation found, or null if all is well.
 *
 * @param {{ treasury: number, people: number, military: number, faith: number }} meters
 * @param {number} activeMeterCount
 * @returns {{ meter: string, value: number, type: "depleted" | "overflow" } | null}
 */
export function checkGameOver(meters, activeMeterCount) {
  const activeNames = getActiveMeterNames(activeMeterCount);

  for (const name of activeNames) {
    const value = meters[name];
    if (value <= 0) {
      return { meter: name, value: 0, type: "depleted" };
    }
    if (value >= 100) {
      return { meter: name, value: 100, type: "overflow" };
    }
  }

  return null;
}

/**
 * Returns a descriptive status string for a single meter value.
 *
 * Thresholds (tuned for the 0-100 scale):
 *   critical  — value < 20  (imminent collapse)
 *   danger    — value > 80  (runaway excess, crisis risk)
 *   warning   — value < 30 OR value > 70  (approaching extremes)
 *   normal    — everything else
 *
 * Note: "danger" is checked before "warning" so >80 always returns "danger",
 * not "warning".
 *
 * @param {number} value
 * @returns {"critical" | "danger" | "warning" | "normal"}
 */
export function getMeterStatus(value) {
  if (value < 20) return "critical";
  if (value > 80) return "danger";
  if (value < 30 || value > 70) return "warning";
  return "normal";
}
