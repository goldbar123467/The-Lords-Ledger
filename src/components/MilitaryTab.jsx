/**
 * MilitaryTab.jsx
 *
 * Garrison management and castle upgrades.
 */

import { CASTLE_LEVELS, DEFENSE_UPGRADES, GARRISON_UPKEEP_PER_SOLDIER } from "../data/economy.js";

export default function MilitaryTab({ state }) {
  const { garrison, castleLevel, defenseUpgrades } = state;
  const castle = CASTLE_LEVELS[castleLevel];
  const nextCastle = CASTLE_LEVELS[castleLevel + 1];

  const baseDefense = castle?.defense || 0;
  const upgradeDefense = defenseUpgrades.reduce((sum, id) => {
    const upg = DEFENSE_UPGRADES[id];
    return sum + (upg?.defense || 0);
  }, 0);
  const totalDefense = baseDefense + upgradeDefense + garrison * 2;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Garrison panel */}
      <div
        className="rounded-lg border-2 p-4 mb-4"
        style={{ backgroundColor: "#faf3e3", borderColor: "#c4a45a" }}
      >
        <h3
          className="font-heading text-sm font-bold uppercase tracking-wider mb-3"
          style={{ color: "#8b1a1a" }}
        >
          {"\u2694\uFE0F"} Garrison
        </h3>
        <div className="grid grid-cols-2 gap-3 text-base" style={{ color: "#3d2517" }}>
          <div>
            <span className="font-semibold">Soldiers:</span> {garrison}
          </div>
          <div>
            <span className="font-semibold">Upkeep:</span> {garrison * GARRISON_UPKEEP_PER_SOLDIER}d/season
          </div>
          <div>
            <span className="font-semibold">Defense Rating:</span>{" "}
            <span className="font-bold" style={{ color: "#8b1a1a" }}>{totalDefense}</span>
          </div>
        </div>
        <p className="text-sm mt-3 italic" style={{ color: "#8b6914" }}>
          Your garrison stands ready. Their presence deters raiders and protects your people.
        </p>
      </div>

      {/* Castle level */}
      <div
        className="rounded-lg border-2 p-4 mb-4"
        style={{ backgroundColor: "#faf3e3", borderColor: "#c4a45a" }}
      >
        <h3
          className="font-heading text-sm font-bold uppercase tracking-wider mb-3"
          style={{ color: "#5a3a28" }}
        >
          {"\u{1F3F0}"} Castle — {castle?.name || "Unknown"}
        </h3>
        <div className="text-base mb-3" style={{ color: "#3d2517" }}>
          <span className="font-semibold">Level:</span> {castleLevel}/4
          <span className="ml-4 font-semibold">Base Defense:</span> {baseDefense}
        </div>

        {/* Castle level visual */}
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4].map((lvl) => (
            <div
              key={lvl}
              className="flex-1 h-3 rounded-full"
              style={{
                backgroundColor: lvl <= castleLevel ? "#8b6914" : "#e8d5a3",
                border: "1px solid #c4a45a",
              }}
            />
          ))}
        </div>

        {nextCastle ? (
          <div className="text-sm p-3 rounded-md border" style={{ borderColor: "#c4a45a", backgroundColor: "#f4e4c1" }}>
            <span className="font-heading font-semibold uppercase" style={{ color: "#5a3a28" }}>
              Next: {nextCastle.name}
            </span>
            <div className="mt-1" style={{ color: "#3d2517" }}>
              Cost: {nextCastle.cost}d + {nextCastle.stone} stone + {nextCastle.timber} timber
              {nextCastle.iron > 0 ? ` + ${nextCastle.iron} iron` : ""} | {nextCastle.buildTime} seasons
            </div>
          </div>
        ) : (
          <p className="text-xs font-semibold" style={{ color: "#2d5a27" }}>
            Maximum fortification reached!
          </p>
        )}
      </div>

      {/* Defense upgrades */}
      <div
        className="rounded-lg border-2 p-4"
        style={{ backgroundColor: "#faf3e3", borderColor: "#c4a45a" }}
      >
        <h3
          className="font-heading text-sm font-bold uppercase tracking-wider mb-3"
          style={{ color: "#5a3a28" }}
        >
          {"\u{1F6E1}\uFE0F"} Defense Upgrades
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.values(DEFENSE_UPGRADES).map((upgrade) => {
            const owned = defenseUpgrades.includes(upgrade.id);
            return (
              <div
                key={upgrade.id}
                className="p-2.5 rounded-md border text-sm"
                style={{
                  borderColor: owned ? "#2d5a27" : "#c4a45a",
                  backgroundColor: owned ? "#e8f0e3" : "#f4e4c1",
                }}
              >
                <div className="font-heading font-semibold" style={{ color: "#2c1810" }}>
                  {upgrade.name} <span style={{ color: "#2d5a27" }}>+{upgrade.defense} defense</span>
                </div>
                <div style={{ color: "#5a3a28" }}>
                  {upgrade.cost}d
                  {upgrade.stone > 0 ? ` + ${upgrade.stone} stone` : ""}
                  {upgrade.iron > 0 ? ` + ${upgrade.iron} iron` : ""}
                  {upgrade.timber > 0 ? ` + ${upgrade.timber} timber` : ""}
                </div>
                {owned && (
                  <span className="font-semibold" style={{ color: "#2d5a27" }}>Installed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
