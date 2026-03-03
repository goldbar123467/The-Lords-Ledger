/**
 * PeopleTab.jsx
 *
 * Population management, labor allocation, and tax rate.
 */

import { TAX_RATES, FOOD_PER_FAMILY } from "../data/economy.js";
import { getTotalFood } from "../engine/economyEngine.js";

export default function PeopleTab({ state, onSetTaxRate }) {
  const { population, inventory, taxRate, meters } = state;
  const totalFood = getTotalFood(inventory);
  const consumption = population * FOOD_PER_FAMILY;
  const surplus = totalFood - consumption;

  // Growth conditions check
  const canGrow = surplus > 0 && meters.people > 40;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Population panel */}
      <div
        className="rounded-lg border-2 p-4 mb-4"
        style={{ backgroundColor: "#faf3e3", borderColor: "#c4a45a" }}
      >
        <h3
          className="font-heading text-sm font-bold uppercase tracking-wider mb-3"
          style={{ color: "#2d5a27" }}
        >
          {"\u{1F465}"} Population
        </h3>
        <div className="grid grid-cols-2 gap-3 text-base" style={{ color: "#3d2517" }}>
          <div>
            <span className="font-semibold">Total Families:</span> {population}
          </div>
          <div>
            <span className="font-semibold">Food Supply:</span> {totalFood}
            <span className="text-sm ml-1" style={{ color: "#8b6914" }}>
              (need {consumption}/season)
            </span>
          </div>
          <div>
            <span className="font-semibold">Food Balance:</span>{" "}
            <span style={{ color: surplus >= 0 ? "#2d5a27" : "#c0392b" }}>
              {surplus >= 0 ? "+" : ""}{surplus}/season
            </span>
          </div>
          <div>
            <span className="font-semibold">Growth:</span>{" "}
            <span style={{ color: canGrow ? "#2d5a27" : "#8b6914" }}>
              {canGrow ? "Possible (food surplus + happy people)" : "Stalled"}
            </span>
          </div>
        </div>
        <p className="text-sm mt-2" style={{ color: "#8b6914" }}>
          Population grows by 1-2 families per season when there is a food surplus and People satisfaction is above 40.
          Families leave when food runs out or People drops below 20.
        </p>
      </div>

      {/* Tax collection */}
      <div
        className="rounded-lg border-2 p-4 mb-4"
        style={{ backgroundColor: "#faf3e3", borderColor: "#c4a45a" }}
      >
        <h3
          className="font-heading text-sm font-bold uppercase tracking-wider mb-3"
          style={{ color: "#8b6914" }}
        >
          {"\u{1FA99}"} Tax Rate
        </h3>
        <p className="text-sm mb-3" style={{ color: "#5a3a28" }}>
          Taxes are collected each Autumn. Higher rates bring more coin but risk revolt.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(TAX_RATES).map(([key, config]) => {
            const isActive = taxRate === key;
            const income = population * config.rate;
            return (
              <button
                key={key}
                onClick={() => onSetTaxRate(key)}
                className="p-3 rounded-md border-2 text-center cursor-pointer transition-all duration-200 min-h-[44px]"
                style={{
                  backgroundColor: isActive ? "#8b6914" : "#f4e4c1",
                  borderColor: isActive ? "#5a3a28" : "#c4a45a",
                  color: isActive ? "#faf3e3" : "#2c1810",
                }}
                aria-label={`Set tax rate to ${config.label} — ${config.rate}d per family`}
                aria-pressed={isActive}
              >
                <div className="font-heading text-sm font-bold uppercase">{config.label}</div>
                <div className="text-sm mt-0.5">{config.rate}d/family</div>
                <div className="text-sm mt-0.5" style={{ color: isActive ? "#e8d5a3" : "#8b6914" }}>
                  ~{income}d/autumn
                </div>
                {config.peopleMod !== 0 && (
                  <div className="text-sm mt-0.5" style={{ color: config.peopleMod > 0 ? "#2d5a27" : "#c0392b" }}>
                    People: {config.peopleMod > 0 ? "+" : ""}{config.peopleMod}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Labor allocation - informational for now */}
      <div
        className="rounded-lg border-2 p-4"
        style={{ backgroundColor: "#faf3e3", borderColor: "#c4a45a" }}
      >
        <h3
          className="font-heading text-sm font-bold uppercase tracking-wider mb-3"
          style={{ color: "#5a3a28" }}
        >
          {"\u{1F6E0}\uFE0F"} Labor Allocation
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="p-2.5 rounded-md border" style={{ borderColor: "#c4a45a", backgroundColor: "#f4e4c1" }}>
            <div className="font-heading font-semibold uppercase" style={{ color: "#5a3a28" }}>
              Lord's Demesne
            </div>
            <div className="text-lg font-bold" style={{ color: "#2c1810" }}>40%</div>
            <div style={{ color: "#8b6914" }}>Treasury income</div>
          </div>
          <div className="p-2.5 rounded-md border" style={{ borderColor: "#c4a45a", backgroundColor: "#f4e4c1" }}>
            <div className="font-heading font-semibold uppercase" style={{ color: "#5a3a28" }}>
              Peasant Fields
            </div>
            <div className="text-lg font-bold" style={{ color: "#2c1810" }}>40%</div>
            <div style={{ color: "#8b6914" }}>People satisfaction</div>
          </div>
          <div className="p-2.5 rounded-md border" style={{ borderColor: "#c4a45a", backgroundColor: "#f4e4c1" }}>
            <div className="font-heading font-semibold uppercase" style={{ color: "#5a3a28" }}>
              Construction
            </div>
            <div className="text-lg font-bold" style={{ color: "#2c1810" }}>20%</div>
            <div style={{ color: "#8b6914" }}>Building speed</div>
          </div>
        </div>
        <p className="text-sm mt-2 italic" style={{ color: "#8b6914" }}>
          The manor is peaceful this season. Your workers tend their duties without complaint.
        </p>
      </div>
    </div>
  );
}
