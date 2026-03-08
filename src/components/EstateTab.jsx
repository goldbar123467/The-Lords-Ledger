/**
 * EstateTab.jsx
 *
 * Production buildings tab — the primary new feature of V2.
 * Shows economy status summary, then a card grid of buildings to build/manage.
 */

import BUILDINGS, { BUILDING_LIST } from "../data/buildings.js";
import { RESOURCE_CONFIG, FOOD_RESOURCES } from "../data/economy.js";
import {
  canBuildBuilding,
  getInventoryUsed,
  getTotalBuildingUpkeep,
  getGarrisonUpkeep,
  getPassiveIncome,
  getFoodConsumption,
} from "../engine/economyEngine.js";
import { getSynergyBuildings } from "../engine/synergyEngine.js";

function EconomyStatusBox({ state }) {
  const {
    food, population, inventory, inventoryCapacity,
    buildings, garrison, castleLevel,
  } = state;

  const used = getInventoryUsed(inventory);
  const pct = inventoryCapacity > 0 ? Math.round((used / inventoryCapacity) * 100) : 0;
  const garrisonFood = Math.ceil(garrison / 2);
  const consumption = getFoodConsumption(population) + garrisonFood;
  const buildingUpkeep = getTotalBuildingUpkeep(buildings);
  const garrisonUpkeep = getGarrisonUpkeep(garrison);
  const totalUpkeep = buildingUpkeep + garrisonUpkeep;
  const passiveIncome = getPassiveIncome(castleLevel, buildings);
  const netIncome = passiveIncome - totalUpkeep;

  return (
    <div
      className="rounded-lg border-2 p-3 mb-4"
      style={{ backgroundColor: "#faf3e3", borderColor: "#c4a45a" }}
    >
      <h3
        className="font-heading text-base font-bold uppercase tracking-wider mb-2"
        style={{ color: "#5a3a28" }}
      >
        Economy Overview
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-base" style={{ color: "#3d2517" }}>
        <div>
          <span className="font-semibold">{"\u{1F35E}"} Food:</span> {food}
          <span className="text-sm ml-1" style={{ color: "#8b6914" }}>(-{consumption}/season)</span>
        </div>
        <div>
          <span className="font-semibold">{"\u{1F4E6}"} Inventory:</span> {used}/{inventoryCapacity}
          <span className="text-sm ml-1" style={{ color: pct >= 90 ? "#c0392b" : "#8b6914" }}>({pct}%)</span>
        </div>
        <div>
          <span className="font-semibold">{"\u{1FA99}"} Income:</span> {passiveIncome}d/season
        </div>
        <div>
          <span className="font-semibold">{"\u{1F4B8}"} Upkeep:</span> {totalUpkeep}d/season
        </div>
      </div>
      <div className="mt-1 text-base font-semibold" style={{ color: netIncome >= 0 ? "#2d5a27" : "#c0392b" }}>
        Net: {netIncome >= 0 ? "+" : ""}{netIncome}d/season
        {netIncome < 0 && <span className="ml-1">{"\u26A0\uFE0F"}</span>}
      </div>
    </div>
  );
}

function BuildingCard({ building, state, onBuild, onDemolish, isSynergyBuilding }) {
  const built = state.buildings.filter((b) => b === building.id);
  const builtCount = built.length;
  const check = canBuildBuilding(building.id, state);

  const RARITY_COLORS = {
    common:   { bg: "#f4e4c1", border: "#c4a45a" },
    uncommon: { bg: "#e8f0e3", border: "#6b8f5b" },
    rare:     { bg: "#e8e0f0", border: "#7b5ea7" },
  };
  const rarity = RARITY_COLORS[building.rarity] || RARITY_COLORS.common;

  return (
    <div
      className="rounded-lg border-2 p-3 flex flex-col"
      style={{ backgroundColor: rarity.bg, borderColor: rarity.border }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">{building.icon}</span>
          <div>
            <h4 className="font-heading text-sm font-bold leading-tight" style={{ color: "#2c1810" }}>
              {building.name}
              {isSynergyBuilding && (
                <span title="Part of an active strategy path" className="ml-1" style={{ color: "#b8860b" }}>{"\u2B50"}</span>
              )}
            </h4>
            <p className="text-[10px] italic" style={{ color: "#8b6914" }}>{building.latin}</p>
          </div>
        </div>
        <span
          className="text-[10px] font-heading font-semibold uppercase px-1.5 py-0.5 rounded-full border"
          style={{ borderColor: rarity.border, color: rarity.border }}
        >
          {building.rarity}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm leading-snug mb-2" style={{ color: "#3d2517" }}>
        {building.description}
      </p>

      {/* Stats */}
      <div className="text-sm space-y-0.5 mb-2" style={{ color: "#5a3a28" }}>
        <div>
          <span className="font-semibold">Cost:</span> {building.cost}d
        </div>
        <div>
          <span className="font-semibold">Produces:</span>{" "}
          {Object.entries(building.produces).map(([res, amt]) => {
            const cfg = RESOURCE_CONFIG[res];
            return `${amt} ${cfg?.icon || ""} ${res}`;
          }).join(", ")}
          /season
        </div>
        {building.consumes && (
          <div>
            <span className="font-semibold">Consumes:</span>{" "}
            {Object.entries(building.consumes).map(([res, amt]) => {
              const cfg = RESOURCE_CONFIG[res];
              return `${amt} ${cfg?.icon || ""} ${res}`;
            }).join(", ")}
            /season
          </div>
        )}
        <div>
          <span className="font-semibold">Upkeep:</span> {building.upkeep}d/season
        </div>
        {building.requires && (
          <div>
            <span className="font-semibold">Requires:</span> {BUILDINGS[building.requires]?.name || building.requires}
          </div>
        )}
        {building.meterBonus && (
          <div>
            <span className="font-semibold">Boosts:</span>{" "}
            {Object.entries(building.meterBonus).map(([meter, amt]) => {
              const icons = { treasury: "\u{1FA99}", people: "\u{1F33E}", military: "\u2694\uFE0F", faith: "\u26EA" };
              return `${icons[meter] || ""} ${meter.charAt(0).toUpperCase() + meter.slice(1)} +${amt}`;
            }).join(", ")}
          </div>
        )}
      </div>

      {/* Built count */}
      {builtCount > 0 && (
        <div className="text-sm font-semibold mb-2" style={{ color: "#2d5a27" }}>
          Built: {builtCount}/{building.maxCount}
        </div>
      )}

      {/* Action area */}
      <div className="mt-auto flex gap-2">
        <button
          onClick={() => onBuild(building.id)}
          disabled={!check.canBuild}
          className="flex-1 py-2.5 rounded-md border-2 font-heading font-semibold text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: check.canBuild ? "#8b6914" : "#c4a45a",
            borderColor: "#5a3a28",
            color: "#faf3e3",
          }}
          title={check.reason || "Build this structure"}
          aria-label={check.canBuild ? `Build ${building.name} for ${building.cost}d` : check.reason}
        >
          {check.canBuild ? `Build (${building.cost}d)` : (check.reason || "Cannot Build")}
        </button>

        {builtCount > 0 && (
          <button
            onClick={() => {
              const idx = state.buildings.lastIndexOf(building.id);
              if (idx >= 0) onDemolish(idx);
            }}
            className="py-2.5 px-4 rounded-md border-2 font-heading font-semibold text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: "#faf3e3",
              borderColor: "#8b1a1a",
              color: "#8b1a1a",
            }}
            aria-label={`Demolish ${building.name} (refund ${Math.floor(building.cost / 2)}d)`}
          >
            Demolish
          </button>
        )}
      </div>
    </div>
  );
}

export default function EstateTab({ state, onBuild, onDemolish, activatedSynergies }) {
  const synergyBuildingIds = getSynergyBuildings(activatedSynergies ?? [], state.buildings);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <EconomyStatusBox state={state} />

      {/* Current inventory */}
      <div
        className="rounded-lg border-2 p-3 mb-4"
        style={{ backgroundColor: "#faf3e3", borderColor: "#c4a45a" }}
      >
        <h3
          className="font-heading text-base font-bold uppercase tracking-wider mb-2"
          style={{ color: "#5a3a28" }}
        >
          Inventory
        </h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(state.inventory)
            .filter(([, qty]) => qty > 0)
            .map(([resource, qty]) => {
              const cfg = RESOURCE_CONFIG[resource];
              return (
                <span
                  key={resource}
                  className="inline-flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-full border"
                  style={{ borderColor: "#c4a45a", backgroundColor: "#f4e4c1", color: "#2c1810" }}
                >
                  {cfg?.icon} {cfg?.label || resource}: {qty}
                </span>
              );
            })
          }
          {Object.values(state.inventory).every((v) => v === 0) && (
            <p className="text-sm italic" style={{ color: "#8b6914" }}>
              Your manor has no production facilities. Build farms and workshops to generate resources.
            </p>
          )}
        </div>
      </div>

      {/* Building cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BUILDING_LIST.map((building) => (
          <BuildingCard
            key={building.id}
            building={building}
            state={state}
            onBuild={onBuild}
            onDemolish={onDemolish}
            isSynergyBuilding={synergyBuildingIds.has(building.id)}
          />
        ))}
      </div>
    </div>
  );
}
