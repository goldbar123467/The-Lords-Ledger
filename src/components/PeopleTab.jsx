/**
 * PeopleTab.jsx
 *
 * Population management, tax rate, and church donations.
 * Resource-based: no meter references.
 */

import { TAX_RATES, FOOD_PER_FAMILY, DONATION_TIERS } from "../data/economy.js";
import { getTotalFood } from "../engine/economyEngine.js";

export default function PeopleTab({ state, onSetTaxRate, onDonate }) {
  const { population, inventory, taxRate, denarii, churchDonation = 0, garrison = 0 } = state;
  const totalFood = getTotalFood(inventory);
  const garrisonFood = Math.ceil(garrison / 2);
  const consumption = population * FOOD_PER_FAMILY + garrisonFood;
  const surplus = totalFood - consumption;

  // Growth conditions
  const hasFood = surplus > 0;
  const hasAle = (inventory.ale || 0) >= 3;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Population panel */}
      <div
        className="rounded-lg p-4 mb-4"
        style={{ backgroundColor: "#231e16", border: "1px solid #6a5a42" }}
      >
        <h3
          className="text-sm font-bold uppercase tracking-wider mb-3"
          style={{ fontFamily: "Cinzel, serif", color: "#2962a8" }}
        >
          Population
        </h3>
        <div className="grid grid-cols-2 gap-3 text-base" style={{ color: "#a89070" }}>
          <div>
            <span className="font-semibold" style={{ color: "#c8b090" }}>Total Families:</span>{" "}
            <span style={{ color: "#e8c44a" }}>{population}</span>
          </div>
          <div>
            <span className="font-semibold" style={{ color: "#c8b090" }}>Food Supply:</span>{" "}
            <span style={{ color: "#e8c44a" }}>{totalFood}</span>
            <span className="text-sm ml-1" style={{ color: "#8a7a3a" }}>
              (need {consumption}/season)
            </span>
          </div>
          <div>
            <span className="font-semibold" style={{ color: "#c8b090" }}>Food Balance:</span>{" "}
            <span style={{ color: surplus >= 0 ? "#4a8a3a" : "#c62828" }}>
              {surplus >= 0 ? "+" : ""}{surplus}/season
            </span>
          </div>
          <div>
            <span className="font-semibold" style={{ color: "#c8b090" }}>Growth:</span>{" "}
            <span style={{ color: hasFood && hasAle ? "#4a8a3a" : hasFood ? "#8a7a3a" : "#c62828" }}>
              {hasFood && hasAle
                ? "Strong (food + ale = settlers)"
                : hasFood
                  ? "Possible (+1-2 families per season)"
                  : "Stalled — need more food (build farms)"}
            </span>
          </div>
        </div>
        <p className="text-sm mt-2 italic" style={{ color: "#8a7a3a" }}>
          Food surplus attracts new families. Ale boosts growth further. Families leave when food runs out or taxes are too high.
        </p>
      </div>

      {/* Tax collection */}
      <div
        className="rounded-lg p-4 mb-4"
        style={{ backgroundColor: "#231e16", border: "1px solid #6a5a42" }}
      >
        <h3
          className="text-sm font-bold uppercase tracking-wider mb-3"
          style={{ fontFamily: "Cinzel, serif", color: "#c4a24a" }}
        >
          Tax Rate
        </h3>
        <p className="text-sm mb-3" style={{ color: "#a89070" }}>
          Taxes are collected each Autumn. Higher rates bring more coin but drive people away.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(TAX_RATES).map(([key, config]) => {
            const isActive = taxRate === key;
            const income = population * config.rate;
            return (
              <button
                key={key}
                onClick={() => onSetTaxRate(key)}
                className="p-3 rounded-md text-center cursor-pointer transition-all duration-200 min-h-[44px]"
                style={{
                  backgroundColor: isActive ? "#c4a24a" : "#1a1610",
                  border: isActive ? "1px solid #8a7a3a" : "1px solid #6a5a42",
                  color: isActive ? "#0f0d0a" : "#c8b090",
                }}
                aria-label={`Set tax rate to ${config.label} — ${config.rate}d per family`}
                aria-pressed={isActive}
              >
                <div className="text-sm font-bold uppercase" style={{ fontFamily: "Cinzel, serif" }}>{config.label}</div>
                <div className="text-sm mt-0.5" style={{ color: isActive ? "#0f0d0a" : "#8a7a3a" }}>{config.rate}d/family</div>
                <div className="text-sm mt-0.5" style={{ color: isActive ? "#0f0d0a" : "#8a7a3a" }}>
                  ~{income}d/autumn
                </div>
                <div className="text-xs mt-0.5" style={{ color: isActive ? "#0f0d0a" : "#8a7a3a" }}>
                  {config.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Church donations */}
      <div
        className="rounded-lg p-4 mb-4"
        style={{ backgroundColor: "#231e16", border: "1px solid #6a5a42" }}
      >
        <h3
          className="text-sm font-bold uppercase tracking-wider mb-3"
          style={{ fontFamily: "Cinzel, serif", color: "#6a4a8a" }}
        >
          {"\u2626"} Church Offering
        </h3>
        <p className="text-sm mb-3" style={{ color: "#a89070" }}>
          Donate denarii to the Church. The Church reciprocates with economic support
          and helps attract new settlers to your estate.
        </p>

        {churchDonation > 0 && (
          <div
            className="text-sm font-semibold mb-3 p-2 rounded-md"
            style={{ backgroundColor: "rgba(106, 74, 138, 0.15)", color: "#6a4a8a", border: "1px solid #6a4a8a" }}
          >
            Pledged this season: {churchDonation}d
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {DONATION_TIERS.map((tier) => {
            const canAfford = denarii >= tier.amount;
            return (
              <button
                key={tier.key}
                onClick={() => onDonate(tier.amount)}
                disabled={!canAfford}
                className="p-3 rounded-md text-center transition-all duration-200 min-h-[44px]"
                style={{
                  backgroundColor: canAfford ? "#6a4a8a" : "#2a2318",
                  border: canAfford ? "1px solid #4a1a6b" : "1px solid #3a3228",
                  color: canAfford ? "#e8c44a" : "#6a5a42",
                  cursor: canAfford ? "pointer" : "not-allowed",
                }}
                onMouseEnter={(e) => { if (canAfford) e.currentTarget.style.backgroundColor = "#8a5aaa"; }}
                onMouseLeave={(e) => { if (canAfford) e.currentTarget.style.backgroundColor = "#6a4a8a"; }}
              >
                <div className="text-lg mb-0.5">{tier.icon}</div>
                <div className="text-xs font-bold uppercase" style={{ fontFamily: "Cinzel, serif" }}>{tier.label}</div>
                <div className="text-sm mt-0.5">{tier.amount}d</div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
