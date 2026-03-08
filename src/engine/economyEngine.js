/**
 * economyEngine.js
 *
 * Pure functions for the V2 economic simulation.
 * No side effects, no I/O. All functions are deterministic given inputs.
 *
 * The simulate() function runs the full season resolution:
 * 1. Production — buildings produce into inventory
 * 2. Consumption — population eats food
 * 3. Upkeep — building + garrison costs deducted from denarii
 * 4. Tax collection (Autumn only)
 * 5. Passive income (market tolls, mill fees)
 * 6. Meter adjustments based on economic health
 *
 * Returns the new economic state + a report array of chronicle lines.
 */

import BUILDINGS from "../data/buildings.js";
import {
  FOOD_RESOURCES,
  TAX_RATES,
  GARRISON_UPKEEP_PER_SOLDIER,
  FOOD_PER_FAMILY,
  DIFFICULTY_CONFIGS,
} from "../data/economy.js";
import { getSynergyPassiveIncome, getSynergyMeterEffects, hasSynergyPopulationBonus } from "./synergyEngine.js";

/**
 * Count how many of a given building ID the player has built.
 */
function countBuilding(buildings, buildingId) {
  return buildings.filter((b) => b === buildingId).length;
}

/**
 * Get total inventory used (sum of all resource quantities).
 */
export function getInventoryUsed(inventory) {
  return Object.values(inventory).reduce((sum, v) => sum + v, 0);
}

/**
 * Get total food in inventory (grain + livestock + fish).
 */
export function getTotalFood(inventory) {
  return FOOD_RESOURCES.reduce((sum, r) => sum + (inventory[r] || 0), 0);
}

/**
 * Calculate total building upkeep per season.
 */
export function getTotalBuildingUpkeep(buildings) {
  return buildings.reduce((sum, id) => {
    const def = BUILDINGS[id];
    return sum + (def ? def.upkeep : 0);
  }, 0);
}

/**
 * Calculate total garrison upkeep per season.
 */
export function getGarrisonUpkeep(garrison) {
  return garrison * GARRISON_UPKEEP_PER_SOLDIER;
}

/**
 * Calculate total upkeep (buildings + garrison).
 */
export function getTotalUpkeep(buildings, garrison) {
  return getTotalBuildingUpkeep(buildings) + getGarrisonUpkeep(garrison);
}

/**
 * Calculate tax income for the season.
 * Only collected in Autumn.
 */
export function getTaxIncome(population, taxRate, season) {
  if (season !== "autumn") return 0;
  const rate = TAX_RATES[taxRate]?.rate ?? TAX_RATES.medium.rate;
  return population * rate;
}

/**
 * Calculate passive income (market tolls, mill fees based on castle level and buildings).
 */
export function getPassiveIncome(castleLevel, buildings) {
  const baseTolls = castleLevel * 5;
  const millFees = buildings.filter((b) =>
    b === "fulling_mill" || b === "brewery"
  ).length * 4;
  return baseTolls + millFees;
}

/**
 * Calculate total production from all buildings.
 * Returns { produced: { resource: amount }, consumed: { resource: amount } }.
 * For converter buildings (fulling mill, brewery), only produces if inputs are available.
 */
function runProduction(buildings, inventory, inventoryCapacity) {
  const produced = {};
  const consumed = {};
  let currentInventory = { ...inventory };
  let currentUsed = getInventoryUsed(currentInventory);
  const report = [];

  // First pass: basic producers (no consumes)
  for (const buildingId of buildings) {
    const def = BUILDINGS[buildingId];
    if (!def || def.consumes) continue;

    for (const [resource, amount] of Object.entries(def.produces)) {
      const space = inventoryCapacity - currentUsed;
      const actualAmount = Math.min(amount, space);
      if (actualAmount > 0) {
        produced[resource] = (produced[resource] || 0) + actualAmount;
        currentInventory[resource] = (currentInventory[resource] || 0) + actualAmount;
        currentUsed += actualAmount;
      }
    }
  }

  // Second pass: converter buildings (consumes input, produces output)
  for (const buildingId of buildings) {
    const def = BUILDINGS[buildingId];
    if (!def || !def.consumes) continue;

    // Check if all inputs are available
    let canProduce = true;
    for (const [resource, amount] of Object.entries(def.consumes)) {
      if ((currentInventory[resource] || 0) < amount) {
        canProduce = false;
        report.push(`Your ${def.name} sits idle — not enough ${resource}.`);
        break;
      }
    }

    if (canProduce) {
      // Consume inputs
      for (const [resource, amount] of Object.entries(def.consumes)) {
        consumed[resource] = (consumed[resource] || 0) + amount;
        currentInventory[resource] -= amount;
        currentUsed -= amount;
      }
      // Produce outputs
      for (const [resource, amount] of Object.entries(def.produces)) {
        const space = inventoryCapacity - currentUsed;
        const actualAmount = Math.min(amount, space);
        if (actualAmount > 0) {
          produced[resource] = (produced[resource] || 0) + actualAmount;
          currentInventory[resource] = (currentInventory[resource] || 0) + actualAmount;
          currentUsed += actualAmount;
        }
      }
    }
  }

  // Check if inventory was full and production was wasted
  if (currentUsed >= inventoryCapacity && buildings.length > 0) {
    report.push("Your storehouses are full! Some production was wasted.");
  }

  return { produced, consumed, inventory: currentInventory, report };
}

/**
 * Consume food for the population.
 * Returns { inventory, foodEaten, shortfall, report }.
 */
function runConsumption(inventory, population) {
  const needed = population * FOOD_PER_FAMILY;
  let remaining = needed;
  const nextInventory = { ...inventory };
  const report = [];

  // Consume food in order: grain first, then livestock, then fish
  for (const resource of FOOD_RESOURCES) {
    if (remaining <= 0) break;
    const available = nextInventory[resource] || 0;
    const eat = Math.min(available, remaining);
    nextInventory[resource] -= eat;
    remaining -= eat;
  }

  const foodEaten = needed - remaining;
  const shortfall = remaining;

  if (shortfall > 0) {
    report.push(`Your ${population} families needed ${needed} food but only had ${foodEaten}. ${shortfall} families went hungry!`);
  } else {
    report.push(`Your ${population} families consumed ${foodEaten} food.`);
  }

  return { inventory: nextInventory, foodEaten, shortfall, report };
}

/**
 * Deduct upkeep costs from denarii.
 * Returns { denarii, unpaidUpkeep, report }.
 */
function runUpkeep(denarii, buildings, garrison) {
  const buildingCost = getTotalBuildingUpkeep(buildings);
  const garrisonCost = getGarrisonUpkeep(garrison);
  const totalCost = buildingCost + garrisonCost;
  const report = [];

  let newDenarii = denarii - totalCost;
  let unpaidUpkeep = 0;

  if (newDenarii < 0) {
    unpaidUpkeep = Math.abs(newDenarii);
    newDenarii = 0;
    report.push(`Upkeep cost ${totalCost}d but you only had ${denarii}d. ${unpaidUpkeep}d went unpaid!`);
  } else if (totalCost > 0) {
    report.push(`Upkeep: ${buildingCost}d for buildings, ${garrisonCost}d for ${garrison} soldiers. Total: ${totalCost}d.`);
  }

  return { denarii: newDenarii, unpaidUpkeep, report };
}

/**
 * Run the full seasonal economic simulation.
 *
 * @param {object} state - Economy-relevant state fields
 * @returns {object} { denarii, food, population, inventory, meters, meterEffects, report, populationChange }
 */
export function simulateEconomy(state) {
  const {
    denarii,
    population,
    inventory,
    inventoryCapacity,
    buildings,
    garrison,
    castleLevel,
    taxRate,
    season,
    meters,
  } = state;

  const report = [];
  const penaltyScale = (DIFFICULTY_CONFIGS[state.difficulty || "normal"] || DIFFICULTY_CONFIGS.normal).penaltyScale;
  let currentDenarii = denarii;
  let currentPopulation = population;
  const meterEffects = { treasury: 0, people: 0, military: 0, faith: 0 };

  // ----- 1. PRODUCTION -----
  const production = runProduction(buildings, inventory, inventoryCapacity);
  let currentInventory = production.inventory;
  report.push(...production.report);

  // Summarize production
  const prodEntries = Object.entries(production.produced);
  if (prodEntries.length > 0) {
    const prodStr = prodEntries.map(([r, a]) => `${a} ${r}`).join(", ");
    report.push(`Your buildings produced: ${prodStr}.`);
  }

  // Apply meter bonuses from buildings (herb garden faith, brewery people)
  for (const buildingId of buildings) {
    const def = BUILDINGS[buildingId];
    if (def?.meterBonus) {
      for (const [meter, amount] of Object.entries(def.meterBonus)) {
        meterEffects[meter] += amount;
      }
    }
  }

  // ----- 2. CONSUMPTION -----
  const consumption = runConsumption(currentInventory, currentPopulation);
  currentInventory = consumption.inventory;
  report.push(...consumption.report);

  // Food shortfall damages People meter (capped so 50→0 takes at least 4 turns on normal)
  if (consumption.shortfall > 0) {
    const peopleDamage = Math.round(Math.min(12, consumption.shortfall * 2) * penaltyScale);
    meterEffects.people -= peopleDamage;
  }

  // ----- 2.5. GARRISON FOOD — soldiers eat too (skip before military tab unlocks at turn 6) -----
  const militaryActive = (state.turn ?? 1) >= 6;
  const garrisonFoodNeeded = militaryActive ? Math.ceil(garrison / 2) : 0;
  if (garrisonFoodNeeded > 0) {
    let garrisonRemaining = garrisonFoodNeeded;
    for (const resource of FOOD_RESOURCES) {
      if (garrisonRemaining <= 0) break;
      const available = currentInventory[resource] || 0;
      const eat = Math.min(available, garrisonRemaining);
      currentInventory[resource] -= eat;
      garrisonRemaining -= eat;
    }
    if (garrisonRemaining > 0) {
      report.push(`Your ${garrison} soldiers needed ${garrisonFoodNeeded} food but supplies ran short.`);
      meterEffects.military -= Math.round(2 * penaltyScale);
    } else {
      report.push(`Your garrison consumed ${garrisonFoodNeeded} food.`);
    }
  }

  // ----- 3. UPKEEP (garrison upkeep waived before military tab unlocks) -----
  const upkeep = runUpkeep(currentDenarii, buildings, militaryActive ? garrison : 0);
  currentDenarii = upkeep.denarii;
  report.push(...upkeep.report);

  // Unpaid upkeep: garrison deserts, buildings decay
  if (upkeep.unpaidUpkeep > 0) {
    meterEffects.military -= Math.round(3 * penaltyScale);
    meterEffects.treasury -= Math.round(5 * penaltyScale);
  }

  // ----- 4. TAX COLLECTION (Autumn only) -----
  const taxIncome = getTaxIncome(currentPopulation, taxRate, season);
  if (taxIncome > 0) {
    currentDenarii += taxIncome;
    report.push(`Autumn tax collection: ${taxIncome}d from ${currentPopulation} families at ${TAX_RATES[taxRate]?.label || "medium"} rate.`);

    // Tax rate affects meters
    const taxConfig = TAX_RATES[taxRate];
    if (taxConfig) {
      meterEffects.people += taxConfig.peopleMod;
      meterEffects.treasury += taxConfig.treasuryMod;
    }
  }

  // ----- 5. PASSIVE INCOME -----
  const passiveIncome = getPassiveIncome(castleLevel, buildings);
  currentDenarii += passiveIncome;
  if (passiveIncome > 0) {
    report.push(`Passive income: ${passiveIncome}d from market tolls and mill fees.`);
  }

  // ----- 5.5. SYNERGY BONUSES -----
  const activatedSynergies = state.synergies?.activated ?? [];
  const synergyIncome = getSynergyPassiveIncome(activatedSynergies);
  currentDenarii += synergyIncome;
  if (synergyIncome > 0) {
    report.push(`Strategy bonuses: +${synergyIncome}d`);
  }

  const synergyMeterFx = getSynergyMeterEffects(activatedSynergies);
  for (const [m, d] of Object.entries(synergyMeterFx)) {
    meterEffects[m] += d;
  }

  // ----- 6. METER ADJUSTMENTS (economy-driven, no arbitrary decay) -----
  // Building meterBonus already applied in production section above.
  // Each meter is now driven by the actual economic state.

  // --- TREASURY: financial health ---
  meterEffects.treasury += 1; // Baseline: rents and tolls
  // Population economic activity — more families = more market trade
  meterEffects.treasury += Math.min(2, Math.floor(currentPopulation / 10));
  const netIncome = (taxIncome + passiveIncome + synergyIncome) - getTotalUpkeep(buildings, garrison);
  if (netIncome > 0) {
    meterEffects.treasury += Math.min(3, Math.ceil(netIncome / 15));
  } else if (netIncome < 0) {
    meterEffects.treasury -= Math.min(3, Math.ceil(Math.abs(netIncome) / 15));
  }
  if (currentDenarii <= 0) {
    meterEffects.treasury -= Math.round(10 * penaltyScale);
  } else if (currentDenarii < 100) {
    meterEffects.treasury -= 2;
  } else if (currentDenarii > 500) {
    meterEffects.treasury += 2;
  }

  // --- PEOPLE: food, ale, starvation ---
  meterEffects.people -= 1; // Complaints, disputes, natural wear on goodwill
  const totalFoodInInventory = getTotalFood(currentInventory);
  if (totalFoodInInventory > currentPopulation * 2) {
    meterEffects.people += 2;
  } else if (totalFoodInInventory > currentPopulation) {
    meterEffects.people += 1;
  }
  if (totalFoodInInventory === 0 && consumption.shortfall > 0) {
    meterEffects.people -= Math.round(3 * penaltyScale);
  }
  // Ale boosts morale
  if ((currentInventory.ale || 0) >= 3) {
    meterEffects.people += 1;
  }
  // Salt preserves food and improves meals — people notice (consumed each season)
  if ((currentInventory.salt || 0) > 0) {
    meterEffects.people += 1;
    currentInventory.salt -= 1;
  }
  // Tools improve building efficiency — treasury benefits (consumed each season)
  if ((currentInventory.tools || 0) > 0) {
    meterEffects.treasury += 1;
    currentInventory.tools -= 1;
  }

  // --- MILITARY: garrison, castle, defenses ---
  meterEffects.military -= 2; // Readiness degrades: walls need repair, morale fades
  if (garrison === 0) {
    meterEffects.military -= Math.round(3 * penaltyScale);
  } else if (garrison < 5) {
    meterEffects.military -= 1;
  } else {
    meterEffects.military += 1;
  }
  // Castle and defenses provide modest stability
  if (castleLevel > 1) {
    meterEffects.military += 1;
  }
  const defenseCount = (state.defenseUpgrades ?? []).length;
  if (defenseCount >= 2) {
    meterEffects.military += 1;
  }

  // --- FAITH: donations, spices, ongoing expectations ---
  meterEffects.faith -= 2; // The Church always demands tithes and devotion
  // Church donations boost faith
  const churchDonation = state.churchDonation ?? 0;
  if (churchDonation > 0) {
    meterEffects.faith += Math.min(8, Math.floor(churchDonation / 20));
  }
  // Spices used in church ceremonies (consumed each season)
  if ((currentInventory.spices || 0) > 0) {
    meterEffects.faith += 1;
    currentInventory.spices -= 1;
  }

  // Population growth/decline
  let populationChange = 0;
  const foodSurplus = totalFoodInInventory > currentPopulation;
  const peopleMeterValue = meters.people + meterEffects.people;

  if (foodSurplus && peopleMeterValue > 40 && Math.random() < 0.5) {
    populationChange = Math.random() < 0.5 ? 1 : 2;
  }
  // Synergy: Breadbasket bonus — extra chance for +1 population
  if (hasSynergyPopulationBonus(activatedSynergies) && foodSurplus && peopleMeterValue > 35) {
    if (populationChange === 0 && Math.random() < 0.25) {
      populationChange = 1;
    }
  }
  if (peopleMeterValue < 20 || consumption.shortfall > 0) {
    populationChange = -(Math.random() < 0.5 ? 1 : 2);
  }



  currentPopulation = Math.max(5, currentPopulation + populationChange);
  if (populationChange > 0) {
    report.push(`${populationChange} new ${populationChange === 1 ? "family has" : "families have"} settled on your land.`);
  } else if (populationChange < 0) {
    report.push(`${Math.abs(populationChange)} ${Math.abs(populationChange) === 1 ? "family has" : "families have"} left your manor.`);
  }

  // --- INVARIANT GUARDS ---
  if (currentDenarii < 0) {
    console.warn(`[invariant] denarii went negative (${currentDenarii}), clamping to 0`);
    currentDenarii = 0;
  }
  if (currentPopulation < 5) {
    console.warn(`[invariant] population below minimum (${currentPopulation}), clamping to 5`);
    currentPopulation = 5;
  }
  for (const [res, qty] of Object.entries(currentInventory)) {
    if (qty < 0) {
      console.warn(`[invariant] inventory.${res} went negative (${qty}), clamping to 0`);
      currentInventory[res] = 0;
    }
  }

  return {
    denarii: currentDenarii,
    food: getTotalFood(currentInventory),
    population: currentPopulation,
    inventory: currentInventory,
    meterEffects,
    report,
    populationChange,
  };
}

/**
 * Check if a building can be built given current state.
 * Returns { canBuild: boolean, reason: string | null }.
 */
export function canBuildBuilding(buildingId, state) {
  const def = BUILDINGS[buildingId];
  if (!def) return { canBuild: false, reason: "Unknown building" };

  const { denarii, buildings } = state;

  // Check cost
  if (denarii < def.cost) {
    return { canBuild: false, reason: `Need ${def.cost}d (have ${denarii}d)` };
  }

  // Check build limit
  const currentCount = countBuilding(buildings, buildingId);
  if (currentCount >= def.maxCount) {
    return { canBuild: false, reason: `Maximum ${def.maxCount} built` };
  }

  // Check prerequisites
  if (def.requires) {
    const hasPrereq = buildings.some((b) => b === def.requires);
    if (!hasPrereq) {
      const prereqDef = BUILDINGS[def.requires];
      return { canBuild: false, reason: `Requires ${prereqDef?.name || def.requires}` };
    }
  }

  return { canBuild: true, reason: null };
}

/**
 * Calculate the net income per season (not including tax).
 */
export function getNetIncome(buildings, garrison, castleLevel) {
  const passiveIncome = getPassiveIncome(castleLevel, buildings);
  const totalUpkeep = getTotalUpkeep(buildings, garrison);
  return passiveIncome - totalUpkeep;
}

/**
 * Calculate the food consumption rate per season.
 */
export function getFoodConsumption(population) {
  return population * FOOD_PER_FAMILY;
}
