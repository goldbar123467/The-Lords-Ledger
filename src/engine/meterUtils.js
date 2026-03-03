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
      let raw = next[name] + effects[name];

      // Regression to mean: extreme values resist further movement away from center.
      // Positive effects dampened above 80; negative effects dampened below 20.
      // 70% of excess/deficit sticks — enough to slow runaway while still
      // allowing game over at 0 or 100 from sustained mismanagement.
      if (raw > 80 && effects[name] > 0) {
        const excess = raw - 80;
        raw = 80 + Math.round(excess * 0.7);
      }
      if (raw < 20 && effects[name] < 0) {
        const deficit = 20 - raw;
        raw = 20 - Math.round(deficit * 0.7);
      }

      next[name] = Math.min(100, Math.max(0, raw));
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
 *   critical  — value < 15  (imminent collapse)
 *   danger    — value > 90  (runaway excess, crisis risk)
 *   warning   — value < 25 OR value > 80  (approaching extremes)
 *   normal    — everything else
 *
 * High-end thresholds raised so meters hovering 80-90 from regression
 * show a caution state, not the alarming pulse reserved for 90+.
 *
 * @param {number} value
 * @returns {"critical" | "danger" | "warning" | "normal"}
 */
export function getMeterStatus(value) {
  if (value < 15) return "critical";
  if (value > 90) return "danger";
  if (value < 25 || value > 80) return "warning";
  return "normal";
}
