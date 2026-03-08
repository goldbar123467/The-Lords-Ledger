/**
 * PeopleTab.jsx
 *
 * Population management, tax rate, and church donations.
 */

import { TAX_RATES, FOOD_PER_FAMILY, DONATION_TIERS } from "../data/economy.js";
import { getTotalFood } from "../engine/economyEngine.js";

export default function PeopleTab({ state, onSetTaxRate, onDonate }) {
  const { population, inventory, taxRate, meters, denarii, churchDonation = 0, garrison = 0 } = state;
  const totalFood = getTotalFood(inventory);
  const garrisonFood = Math.ceil(garrison / 2);
  const consumption = population * FOOD_PER_FAMILY + garrisonFood;
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
          Population may grow by 1-2 families each season when there is a food surplus and People satisfaction is above 40.
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
                    People: {config.peopleMod > 0 ? "+" : ""}{config.peopleMod} (autumn)
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Church donations */}
      <div
        className="rounded-lg border-2 p-4 mb-4"
        style={{ backgroundColor: "#faf3e3", borderColor: "#c4a45a" }}
      >
        <h3
          className="font-heading text-sm font-bold uppercase tracking-wider mb-3"
          style={{ color: "#4a1a6b" }}
        >
          {"\u26EA"} Church Offering
        </h3>
        <p className="text-sm mb-3" style={{ color: "#5a3a28" }}>
          Donate denarii to the Church to strengthen the faith of your people.
          Offerings are recognized when the season resolves.
        </p>

        {churchDonation > 0 && (
          <div
            className="text-sm font-semibold mb-3 p-2 rounded-md"
            style={{ backgroundColor: "#e8e0f0", color: "#4a1a6b" }}
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
                className="p-3 rounded-md border-2 text-center cursor-pointer transition-all duration-200 min-h-[44px]"
                style={{
                  backgroundColor: canAfford ? "#4a1a6b" : "#c4a45a",
                  borderColor: canAfford ? "#2c1046" : "#c4a45a",
                  color: canAfford ? "#faf3e3" : "#e8d5a3",
                  cursor: canAfford ? "pointer" : "not-allowed",
                }}
                onMouseEnter={(e) => { if (canAfford) e.currentTarget.style.backgroundColor = "#5e2a85"; }}
                onMouseLeave={(e) => { if (canAfford) e.currentTarget.style.backgroundColor = "#4a1a6b"; }}
              >
                <div className="text-lg mb-0.5">{tier.icon}</div>
                <div className="font-heading text-xs font-bold uppercase">{tier.label}</div>
                <div className="text-sm mt-0.5">{tier.amount}d</div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
