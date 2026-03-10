/**
 * greatHall.js — Data constants for the Great Hall tab
 *
 * Phase 1: Ambient atmosphere, steward dialogue, queue placeholders.
 * Phase 2+: Dispute database, audience encounters, decrees, council topics.
 */

// Atmospheric text that cycles in the hall footer (8-second rotation)
export const AMBIENT_TEXTS = [
  "Smoke from the hearth drifts toward the vaulted ceiling.",
  "A dog gnaws a bone beneath the long table.",
  "Servants whisper near the kitchen passage.",
  "Rain drums against the high windows.",
  "The herald clears his throat by the entrance.",
  "Dust motes dance in the pale light from the clerestory windows.",
  "The crackle of the fire fills the silence between petitions.",
  "A cold draft stirs the tapestries along the north wall.",
  "The smell of beeswax candles mixes with wood smoke.",
  "Someone coughs in the gallery above. The sound echoes.",
  "The steward's quill scratches against parchment.",
  "Footsteps echo on the flagstone floor as a guard changes post.",
];

// Edmund's greeting lines (randomly selected once per tab visit)
export const EDMUND_GREETINGS = [
  "The hall awaits your command, my lord.",
  "A quiet morning — which usually means trouble is on its way.",
  "Three petitions await your judgment today.",
  "The people are watching, my lord. They always are.",
  "I have prepared the day's ledger. Shall we begin?",
  "Another season turns. The hall stands ready.",
  "The fire is lit and the seats are filled. Your court awaits.",
  "Your steward stands ready, my lord. What is your will?",
];

// Placeholder queue items for the throne room (replaced by real disputes in Phase 2)
export const QUEUE_ITEMS = [
  { title: "A dispute over trampled crops", category: "property", urgency: "pending" },
  { title: "A widow requests an audience", category: "audience", urgency: "waiting" },
  { title: "The blacksmith complains of an apprentice", category: "trade", urgency: "waiting" },
];

// Meter configuration for the four Great Hall approval gauges
export const METER_CONFIG = [
  { key: "people", label: "People", color: "#2d5a2d" },
  { key: "treasury", label: "Treasury", color: "#c4a24a" },
  { key: "church", label: "Church", color: "#6a4a8a" },
  { key: "military", label: "Military", color: "#8b2020" },
];

// Default meter values (used when greatHall state hasn't been initialized)
export const DEFAULT_METERS = { people: 50, treasury: 50, church: 50, military: 50 };
