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

const RARITY_COLORS = {
  common:   { border: "#8a7a5a", glow: "rgba(138, 122, 90, 0.2)" },
  uncommon: { border: "#2a7a4a", glow: "rgba(42, 122, 74, 0.2)" },
  rare:     { border: "#2a4a8a", glow: "rgba(42, 74, 138, 0.2)" },
};

const PRODUCTION_COLORS = {
  grain: "#4a8a3a",
  livestock: "#4a8a3a",
  fish: "#4a8a3a",
  timber: "#2962a8",
  clay: "#2962a8",
  iron: "#2962a8",
  stone: "#2962a8",
  wool: "#c4a24a",
  cloth: "#c4a24a",
  honey: "#c4a24a",
  herbs: "#c4a24a",
  ale: "#c4a24a",
};

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
      className="rounded-lg p-3 mb-4"
      style={{ backgroundColor: "#231e16", border: "1px solid #6a5a42" }}
    >
      <h3
        className="text-base font-bold uppercase mb-0"
        style={{
          fontFamily: '"Cinzel Decorative", "Cinzel", serif',
          color: "#c4a24a",
          letterSpacing: "2px",
        }}
      >
        Economy Overview
      </h3>
      <div className="decorative-rule">
        <span style={{ color: "#8a7a3a" }}>{"\u25C6"}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-base">
        <div>
          <span style={{ color: "#6a5a42", fontVariant: "small-caps" }}>Food:</span>{" "}
          <span style={{ color: "#e8c44a" }}>{food}</span>
          <span className="text-sm ml-1" style={{ color: "#c62828" }}>
            ({"\u25BC"}{consumption}/season)
          </span>
        </div>
        <div>
          <span style={{ color: "#6a5a42", fontVariant: "small-caps" }}>Inventory:</span>{" "}
          <span style={{ color: "#e8c44a" }}>{used}/{inventoryCapacity}</span>
          <span
            className="text-sm ml-1"
            style={{ color: pct >= 90 ? "#c62828" : "#6a5a42" }}
          >
            ({pct}%)
          </span>
        </div>
        <div>
          <span style={{ color: "#6a5a42", fontVariant: "small-caps" }}>Income:</span>{" "}
          <span style={{ color: "#e8c44a" }}>{passiveIncome}d</span>
          <span className="text-sm ml-1" style={{ color: "#4a8a3a" }}>
            ({"\u25B2"}/season)
          </span>
        </div>
        <div>
          <span style={{ color: "#6a5a42", fontVariant: "small-caps" }}>Upkeep:</span>{" "}
          <span style={{ color: "#e8c44a" }}>{totalUpkeep}d</span>
          <span className="text-sm ml-1" style={{ color: "#c62828" }}>
            ({"\u25BC"}/season)
          </span>
        </div>
      </div>
      <div
        className={`mt-2 text-base font-semibold rounded px-2 py-1 ${netIncome < 0 ? "critical-pulse" : ""}`}
        style={{
          color: netIncome >= 0 ? "#4a8a3a" : "#c62828",
          ...(netIncome < 0
            ? {
                background: "rgba(198, 40, 40, 0.1)",
                borderLeft: "3px solid #8b1a1a",
              }
            : {}),
        }}
      >
        Net: {netIncome >= 0 ? "+" : ""}{netIncome}d/season
        {netIncome >= 0 && (
          <span className="ml-1" style={{ color: "#4a8a3a" }}>{"\u25B2"}</span>
        )}
        {netIncome < 0 && (
          <span className="ml-1">{"\u26A0"}</span>
        )}
      </div>
    </div>
  );
}

function BuildingCard({ building, state, onBuild, onDemolish, isSynergyBuilding, index }) {
  const built = state.buildings.filter((b) => b === building.id);
  const builtCount = built.length;
  const check = canBuildBuilding(building.id, state);

  const rarity = RARITY_COLORS[building.rarity] || RARITY_COLORS.common;
  const isBuilt = builtCount > 0;

  return (
    <div
      className="rounded-lg p-3 flex flex-col"
      style={{
        backgroundColor: "#231e16",
        border: `1px solid ${isBuilt ? "#c4a24a" : rarity.border}`,
        transition: "all 200ms ease",
        animation: `card-enter 300ms ease backwards`,
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isBuilt ? "#e8c44a" : rarity.border;
        e.currentTarget.style.boxShadow = `0 0 16px ${rarity.glow}`;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isBuilt ? "#c4a24a" : rarity.border;
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {/* Icon circle */}
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 40,
              height: 40,
              backgroundColor: `${rarity.border}26`,
              color: "#c8b090",
              fontSize: "1.25rem",
            }}
          >
            {building.icon}
          </div>
          <div>
            <h4
              className="text-sm leading-tight"
              style={{
                fontFamily: '"Cinzel", serif',
                fontWeight: 600,
                color: "#c8b090",
              }}
            >
              {building.name}
              {isSynergyBuilding && (
                <span
                  title="Part of an active strategy path"
                  className="ml-1"
                  style={{ color: "#c4a24a" }}
                >
                  {"\u2605"}
                </span>
              )}
            </h4>
            <p className="text-xs italic" style={{ color: "#6a5a42" }}>
              {building.latin}
            </p>
          </div>
        </div>
        {/* Rarity badge */}
        <span
          className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full shrink-0"
          style={{
            backgroundColor: rarity.border,
            color: "#ffffff",
          }}
        >
          {building.rarity}
        </span>
      </div>

      {/* Description */}
      <p
        className="text-sm leading-snug mb-2"
        style={{ color: "#a89070", fontFamily: "system-ui, sans-serif" }}
      >
        {building.description}
      </p>

      {/* Stats */}
      <div className="text-sm space-y-0.5 mb-2">
        <div>
          <span
            style={{
              fontFamily: '"Cinzel", serif',
              color: "#8a7a3a",
            }}
          >
            Cost:
          </span>{" "}
          <span style={{ color: "#c4a24a" }}>{building.cost}d</span>
        </div>
        <div>
          <span
            style={{
              fontFamily: '"Cinzel", serif',
              color: "#8a7a3a",
            }}
          >
            Produces:
          </span>{" "}
          {Object.entries(building.produces).map(([res, amt], i) => {
            const cfg = RESOURCE_CONFIG[res];
            const prodColor = PRODUCTION_COLORS[res] || "#c4a24a";
            return (
              <span key={res}>
                {i > 0 && ", "}
                <span style={{ color: prodColor }}>
                  {amt} {cfg?.icon || ""} {res}
                </span>
              </span>
            );
          })}
          <span style={{ color: "#8a7a3a" }}>/season</span>
        </div>
        {building.consumes && (
          <div>
            <span
              style={{
                fontFamily: '"Cinzel", serif',
                color: "#8a7a3a",
              }}
            >
              Consumes:
            </span>{" "}
            {Object.entries(building.consumes).map(([res, amt], i) => {
              const cfg = RESOURCE_CONFIG[res];
              return (
                <span key={res}>
                  {i > 0 && ", "}
                  <span style={{ color: "#c62828" }}>
                    {amt} {cfg?.icon || ""} {res}
                  </span>
                </span>
              );
            })}
            <span style={{ color: "#8a7a3a" }}>/season</span>
          </div>
        )}
        <div>
          <span
            style={{
              fontFamily: '"Cinzel", serif',
              color: "#8a7a3a",
            }}
          >
            Upkeep:
          </span>{" "}
          <span style={{ color: "#c4a24a" }}>{building.upkeep}d/season</span>
        </div>
        {building.requires && (
          <div>
            <span
              style={{
                fontFamily: '"Cinzel", serif',
                color: "#8a7a3a",
              }}
            >
              Requires:
            </span>{" "}
            <span style={{ color: "#c4a24a" }}>
              {BUILDINGS[building.requires]?.name || building.requires}
            </span>
          </div>
        )}
      </div>

      {/* Built count */}
      {builtCount > 0 && (
        <div className="text-sm font-semibold mb-2" style={{ color: "#4a8a3a" }}>
          Built: {builtCount}/{building.maxCount}
        </div>
      )}

      {/* Action area */}
      <div className="mt-auto flex gap-2">
        <button
          onClick={() => onBuild(building.id)}
          disabled={!check.canBuild}
          className="flex-1 py-2.5 rounded-md text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          style={{
            fontFamily: '"Cinzel Decorative", "Cinzel", serif',
            fontWeight: 700,
            letterSpacing: "2px",
            background: check.canBuild
              ? "linear-gradient(135deg, #8b1a1a, #c62828)"
              : "#3a3228",
            color: check.canBuild ? "#e8c44a" : "#6a5a42",
            border: "none",
            boxShadow: check.canBuild
              ? "0 2px 8px rgba(198, 40, 40, 0.2)"
              : "none",
          }}
          onMouseEnter={(e) => {
            if (check.canBuild) {
              e.currentTarget.style.filter = "brightness(1.15)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(198, 40, 40, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (check.canBuild) {
              e.currentTarget.style.filter = "brightness(1)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(198, 40, 40, 0.2)";
            }
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
            className="py-2.5 px-4 rounded-md font-heading font-semibold text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: "transparent",
              border: "1px solid #8b1a1a",
              color: "#c62828",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(139, 26, 26, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
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
        className="rounded-lg p-3 mb-4"
        style={{ backgroundColor: "#231e16", border: "1px solid #6a5a42" }}
      >
        <h3
          className="text-base font-bold uppercase mb-0"
          style={{
            fontFamily: '"Cinzel Decorative", "Cinzel", serif',
            color: "#c4a24a",
            letterSpacing: "2px",
          }}
        >
          Inventory
        </h3>
        <div className="decorative-rule">
          <span style={{ color: "#8a7a3a" }}>{"\u25C6"}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(state.inventory)
            .filter(([, qty]) => qty > 0)
            .map(([resource, qty]) => {
              const cfg = RESOURCE_CONFIG[resource];
              return (
                <span
                  key={resource}
                  className="inline-flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-full"
                  style={{
                    backgroundColor: "#2a2318",
                    border: "1px solid #6a5a42",
                  }}
                >
                  <span style={{ color: "#a89070" }}>
                    {cfg?.icon} {cfg?.label || resource}:
                  </span>{" "}
                  <span style={{ color: "#e8c44a", fontWeight: 600 }}>{qty}</span>
                </span>
              );
            })
          }
          {Object.values(state.inventory).every((v) => v === 0) && (
            <p className="text-sm italic" style={{ color: "#8a7a3a" }}>
              Your manor has no production facilities. Build farms and workshops to generate resources.
            </p>
          )}
        </div>
      </div>

      {/* Building cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BUILDING_LIST.map((building, index) => (
          <BuildingCard
            key={building.id}
            building={building}
            state={state}
            onBuild={onBuild}
            onDemolish={onDemolish}
            isSynergyBuilding={synergyBuildingIds.has(building.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
