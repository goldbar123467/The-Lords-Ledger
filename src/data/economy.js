/**
 * economy.js
 *
 * Resource definitions, market prices, and economic constants.
 */

/** Resources that count as food (consumed by population) */
export const FOOD_RESOURCES = ["grain", "livestock", "fish"];

/** Resources that are raw materials (used for building) */
export const RAW_MATERIALS = ["timber", "clay", "iron", "stone"];

/** Resources that are trade goods (sold for denarii) */
export const TRADE_GOODS = ["wool", "cloth", "honey", "herbs", "ale"];

/** All resource types that can appear in inventory */
export const ALL_RESOURCES = [
  "grain", "livestock", "fish",
  "timber", "clay", "iron", "stone",
  "wool", "cloth", "honey", "herbs", "ale",
];

/** Resource display config — no emoji, Unicode symbols only */
export const RESOURCE_CONFIG = {
  grain:     { icon: "\u2727", label: "Grain",     category: "food" },
  livestock: { icon: "\u2042", label: "Livestock",  category: "food" },
  fish:      { icon: "\u2248", label: "Fish",       category: "food" },
  timber:    { icon: "\u2261", label: "Timber",     category: "raw" },
  clay:      { icon: "\u25A3", label: "Clay",       category: "raw" },
  iron:      { icon: "\u2692", label: "Iron",       category: "raw" },
  stone:     { icon: "\u25C6", label: "Stone",      category: "raw" },
  wool:      { icon: "\u223F", label: "Wool",       category: "trade" },
  cloth:     { icon: "\u2630", label: "Cloth",      category: "trade" },
  honey:     { icon: "\u2736", label: "Honey",      category: "trade" },
  herbs:     { icon: "\u2698", label: "Herbs",      category: "trade" },
  ale:       { icon: "\u2615", label: "Ale",        category: "trade" },
  salt:      { icon: "\u25CB", label: "Salt",       category: "buyOnly" },
  tools:     { icon: "\u2692", label: "Tools",      category: "buyOnly" },
  spices:    { icon: "\u2726", label: "Spices",     category: "buyOnly" },
};

/** Base sell prices (what the player gets when selling) */
export const BASE_SELL_PRICES = {
  grain: 3,
  livestock: 5,
  fish: 3,
  timber: 4,
  clay: 2,
  iron: 8,
  stone: 7,
  wool: 6,
  cloth: 12,
  honey: 8,
  herbs: 4,
  ale: 7,
};

/** Base buy prices (what the player pays to buy) */
export const BASE_BUY_PRICES = {
  grain: 5,
  livestock: 8,
  fish: 4,
  timber: 6,
  clay: 4,
  iron: 12,
  stone: 10,
  salt: 10,
  tools: 15,
  spices: 25,
};

/** Generate fluctuating market prices for a season (+-20%) */
export function generateMarketPrices() {
  const fluctuate = (price) =>
    Math.max(1, Math.round(price * (0.8 + Math.random() * 0.4)));

  const sell = {};
  for (const [res, price] of Object.entries(BASE_SELL_PRICES)) {
    sell[res] = fluctuate(price);
  }

  const buy = {};
  for (const [res, price] of Object.entries(BASE_BUY_PRICES)) {
    buy[res] = fluctuate(price);
  }

  return { sell, buy };
}

/** Empty inventory template */
export const EMPTY_INVENTORY = {
  grain: 0,
  livestock: 0,
  fish: 0,
  timber: 0,
  clay: 0,
  iron: 0,
  stone: 0,
  wool: 0,
  cloth: 0,
  honey: 0,
  herbs: 0,
  ale: 0,
};

/** Tax rates: denarii per family per season.
 *  populationMod: families gained/lost from satisfaction (+2 = +2 families next season chance).
 *  Higher taxes bring more coin but drive people away.
 */
export const TAX_RATES = {
  low:      { rate: 2, label: "Low",      populationMod: 2,  description: "People stay, coin scarce" },
  medium:   { rate: 4, label: "Medium",   populationMod: 0,  description: "Fair and balanced" },
  high:     { rate: 6, label: "High",     populationMod: -2, description: "Good coin, some leave" },
  crushing: { rate: 8, label: "Crushing", populationMod: -4, description: "Maximum coin, mass exodus" },
};

/** Castle level definitions (base costs — Easy mode overrides below) */
export const CASTLE_LEVELS = {
  1: { name: "Motte-and-Bailey", defense: 20, cost: 0, stone: 0, timber: 0, iron: 0, buildTime: 0 },
  2: { name: "Stone Keep",       defense: 50, cost: 150, stone: 6, timber: 6, iron: 0, buildTime: 0 },
  3: { name: "Curtain Wall",     defense: 75, cost: 300, stone: 10, timber: 8, iron: 4, buildTime: 0 },
  4: { name: "Concentric Castle", defense: 95, cost: 500, stone: 16, timber: 10, iron: 8, buildTime: 0 },
};

/** Easy mode castle levels — denarii only, no resources */
export const CASTLE_LEVELS_EASY = {
  1: { name: "Motte-and-Bailey", defense: 20, cost: 0, stone: 0, timber: 0, iron: 0, buildTime: 0 },
  2: { name: "Stone Keep",       defense: 50, cost: 50, stone: 0, timber: 0, iron: 0, buildTime: 0 },
  3: { name: "Curtain Wall",     defense: 75, cost: 50, stone: 0, timber: 0, iron: 0, buildTime: 0 },
  4: { name: "Concentric Castle", defense: 95, cost: 50, stone: 0, timber: 0, iron: 0, buildTime: 0 },
};

/** Defense upgrades (base costs — Easy mode overrides below) */
export const DEFENSE_UPGRADES = {
  arrow_slits:    { id: "arrow_slits",    name: "Arrow Slits",           defense: 5,  cost: 30,  stone: 3,  iron: 0, timber: 0 },
  drawbridge:     { id: "drawbridge",     name: "Drawbridge",            defense: 8,  cost: 50,  stone: 0,  iron: 2, timber: 4 },
  boiling_water:  { id: "boiling_water",  name: "Boiling Water Stations", defense: 6,  cost: 25,  stone: 0,  iron: 2, timber: 0 },
  sally_port:     { id: "sally_port",     name: "Sally Port",            defense: 10, cost: 40,  stone: 4,  iron: 2, timber: 0 },
};

/** Easy mode defense upgrades — denarii only, no resources */
export const DEFENSE_UPGRADES_EASY = {
  arrow_slits:    { id: "arrow_slits",    name: "Arrow Slits",           defense: 5,  cost: 50,  stone: 0,  iron: 0, timber: 0 },
  drawbridge:     { id: "drawbridge",     name: "Drawbridge",            defense: 8,  cost: 50,  stone: 0,  iron: 0, timber: 0 },
  boiling_water:  { id: "boiling_water",  name: "Boiling Water Stations", defense: 6,  cost: 50,  stone: 0,  iron: 0, timber: 0 },
  sally_port:     { id: "sally_port",     name: "Sally Port",            defense: 10, cost: 50,  stone: 0,  iron: 0, timber: 0 },
};

/** Garrison cost per soldier per season */
export const GARRISON_UPKEEP_PER_SOLDIER = 3;

/** Starting inventory capacity */
export const STARTING_INVENTORY_CAPACITY = 300;

/** Food consumption: 1 food per family per season */
export const FOOD_PER_FAMILY = 1;

/** Cost to recruit one soldier */
export const RECRUIT_COST = 10;

/** Maximum garrison size */
export const MAX_GARRISON = 25;

/** Church donation tiers */
export const DONATION_TIERS = [
  { key: "small",    label: "Small Offering",   amount: 25,  icon: "\u271D" },
  { key: "generous",  label: "Generous Tithe",   amount: 75,  icon: "\u2626" },
  { key: "grand",    label: "Grand Donation",   amount: 150, icon: "\u2720" },
];

/** Difficulty configuration presets */
export const DIFFICULTY_CONFIGS = {
  easy: {
    label: "Easy",
    description: "More resources, gentler penalties",
    startingDenarii: 700,
    startingInventory: { grain: 200, livestock: 50, fish: 30 },
    startingPopulation: 22,
    startingGarrison: 5,
    penaltyScale: 0.5,
  },
  normal: {
    label: "Normal",
    description: "The standard medieval experience",
    startingDenarii: 500,
    startingInventory: { grain: 150, livestock: 30, fish: 20 },
    startingPopulation: 20,
    startingGarrison: 5,
    penaltyScale: 1.0,
  },
  hard: {
    label: "Hard",
    description: "Fewer resources, harsher consequences",
    startingDenarii: 350,
    startingInventory: { grain: 100, livestock: 20, fish: 10 },
    startingPopulation: 18,
    startingGarrison: 3,
    penaltyScale: 1.5,
  },
};
