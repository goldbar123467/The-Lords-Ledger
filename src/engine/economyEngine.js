/**
 * economyEngine.js
 *
 * Pure functions for the economic simulation.
 * No side effects, no I/O. All functions are deterministic given inputs.
 *
 * The simulate() function runs the full season resolution:
 * 1. Production — buildings produce into inventory
 * 2. Consumption — population eats food
 * 3. Upkeep — building + garrison costs deducted from denarii
 * 4. Tax collection (Autumn only)
 * 5. Passive income (market tolls, mill fees)
 * 6. Population changes based on food/tax conditions
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
import { getSynergyPassiveIncome, hasSynergyPopulationBonus } from "./synergyEngine.js";

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
function runConsumption(inventory, population, maxFoodLoss) {
  const needed = maxFoodLoss ? Math.min(population * FOOD_PER_FAMILY, maxFoodLoss) : population * FOOD_PER_FAMILY;
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
 * @returns {object} { denarii, food, population, inventory, report, populationChange }
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
  } = state;

  const report = [];
  const penaltyScale = (DIFFICULTY_CONFIGS[state.difficulty || "normal"] || DIFFICULTY_CONFIGS.normal).penaltyScale;
  let currentDenarii = denarii;
  let currentPopulation = population;
  let currentGarrison = garrison;

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

  // ----- 2. CONSUMPTION -----
  const difficulty = state.difficulty || "normal";
  const maxFoodLoss = (difficulty === "easy" || difficulty === "normal") ? 25 : null;
  const consumption = runConsumption(currentInventory, currentPopulation, maxFoodLoss);
  currentInventory = consumption.inventory;
  report.push(...consumption.report);

  // Food shortfall causes families to leave
  if (consumption.shortfall > 0) {
    const familiesLeave = Math.min(currentPopulation - 1, Math.round(Math.min(5, consumption.shortfall) * penaltyScale));
    if (familiesLeave > 0) {
      currentPopulation -= familiesLeave;
      report.push(`${familiesLeave} ${familiesLeave === 1 ? "family" : "families"} left due to hunger.`);
    }
  }

  // ----- 2.5. GARRISON FOOD — soldiers eat too -----
  const garrisonFoodNeeded = Math.ceil(currentGarrison / 2);
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
      report.push(`Your ${currentGarrison} soldiers needed ${garrisonFoodNeeded} food but supplies ran short.`);
      // Hungry soldiers desert
      const deserters = Math.min(currentGarrison, Math.ceil(garrisonRemaining * penaltyScale));
      if (deserters > 0) {
        currentGarrison -= deserters;
        report.push(`${deserters} hungry ${deserters === 1 ? "soldier" : "soldiers"} deserted.`);
      }
    } else {
      report.push(`Your garrison consumed ${garrisonFoodNeeded} food.`);
    }
  }

  // ----- 3. UPKEEP -----
  const upkeep = runUpkeep(currentDenarii, buildings, currentGarrison);
  currentDenarii = upkeep.denarii;
  report.push(...upkeep.report);

  // Unpaid upkeep: soldiers desert, buildings decay
  if (upkeep.unpaidUpkeep > 0) {
    const deserters = Math.min(currentGarrison, Math.ceil(2 * penaltyScale));
    if (deserters > 0) {
      currentGarrison -= deserters;
      report.push(`${deserters} unpaid ${deserters === 1 ? "soldier" : "soldiers"} deserted.`);
    }
  }

  // ----- 4. TAX COLLECTION (Autumn only) -----
  const taxIncome = getTaxIncome(currentPopulation, taxRate, season);
  if (taxIncome > 0) {
    currentDenarii += taxIncome;
    report.push(`Autumn tax collection: ${taxIncome}d from ${currentPopulation} families at ${TAX_RATES[taxRate]?.label || "medium"} rate.`);

    // Tax rate affects population
    const taxConfig = TAX_RATES[taxRate];
    if (taxConfig && taxConfig.populationMod) {
      const popChange = taxConfig.populationMod;
      if (popChange < 0) {
        const leavers = Math.min(currentPopulation - 1, Math.abs(popChange));
        currentPopulation -= leavers;
        if (leavers > 0) {
          report.push(`${leavers} ${leavers === 1 ? "family" : "families"} left due to heavy taxes.`);
        }
      } else if (popChange > 0) {
        currentPopulation += popChange;
        report.push(`${popChange} new ${popChange === 1 ? "family" : "families"} settled thanks to low taxes.`);
      }
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

  // ----- 6. POPULATION GROWTH/DECLINE -----
  let populationChange = 0;
  const totalFoodInInventory = getTotalFood(currentInventory);
  const foodSurplus = totalFoodInInventory > currentPopulation;

  // Ale consumed for morale — helps attract settlers
  const hasAle = (currentInventory.ale || 0) >= 3;
  if (hasAle) {
    currentInventory.ale -= 3;
    report.push("Your people enjoyed 3 ale — morale is high!");
  }

  // Salt consumed — preserves food
  if ((currentInventory.salt || 0) > 0) {
    currentInventory.salt -= 1;
  }
  // Tools consumed — improves efficiency
  if ((currentInventory.tools || 0) > 0) {
    currentInventory.tools -= 1;
  }
  // Spices consumed — church ceremonies (income bonus from church favor)
  if ((currentInventory.spices || 0) > 0) {
    currentInventory.spices -= 1;
    currentDenarii += 10; // Church reciprocates generosity
  }

  // Church donation income bonus (faith → economic benefit)
  const churchDonation = state.churchDonation ?? 0;
  if (churchDonation > 0) {
    // Church reciprocates: small denarii bonus + population attraction
    const churchBonus = Math.min(30, Math.floor(churchDonation / 3));
    currentDenarii += churchBonus;
    if (churchBonus > 0) {
      report.push(`The Church reciprocates your ${churchDonation}d offering: +${churchBonus}d in tithes and goodwill.`);
    }
    // Church favor attracts settlers
    if (churchDonation >= 75 && Math.random() < 0.4) {
      populationChange += 1;
    }
  }

  // Growth from food surplus + ale
  if (foodSurplus && hasAle) {
    populationChange += Math.random() < 0.6 ? 2 : 1;
  } else if (foodSurplus && Math.random() < 0.4) {
    populationChange += 1;
  }

  // Synergy: Breadbasket bonus — extra chance for +1 population
  if (hasSynergyPopulationBonus(activatedSynergies) && foodSurplus) {
    if (populationChange === 0 && Math.random() < 0.25) {
      populationChange = 1;
    }
  }

  // Decline from starvation
  if (consumption.shortfall > 0 && populationChange > 0) {
    populationChange = 0; // Cancel growth during famine
  }

  currentPopulation = Math.max(1, currentPopulation + populationChange);
  if (populationChange > 0) {
    report.push(`${populationChange} new ${populationChange === 1 ? "family has" : "families have"} settled on your land.`);
  } else if (populationChange < 0) {
    report.push(`${Math.abs(populationChange)} ${Math.abs(populationChange) === 1 ? "family has" : "families have"} left your manor.`);
  }

  // --- INVARIANT GUARDS ---
  if (currentDenarii < 0) {
    currentDenarii = 0;
  }
  if (currentPopulation < 1) {
    currentPopulation = 0; // Allow reaching 0 for game over
  }
  for (const [res, qty] of Object.entries(currentInventory)) {
    if (qty < 0) {
      currentInventory[res] = 0;
    }
  }

  return {
    denarii: currentDenarii,
    food: getTotalFood(currentInventory),
    population: currentPopulation,
    inventory: currentInventory,
    garrison: currentGarrison,
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
