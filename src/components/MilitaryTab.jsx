/**
 * MilitaryTab.jsx
 *
 * Garrison recruitment/dismissal, castle upgrades, and defense installations.
 */

import {
  CASTLE_LEVELS, CASTLE_LEVELS_EASY,
  DEFENSE_UPGRADES, DEFENSE_UPGRADES_EASY,
  GARRISON_UPKEEP_PER_SOLDIER,
  RECRUIT_COST, MAX_GARRISON,
} from "../data/economy.js";

const btnBase = "px-3 py-2 rounded-md border-2 font-heading font-bold text-sm uppercase tracking-wider cursor-pointer transition-all duration-200 min-h-[44px]";
const btnEnabled = { backgroundColor: "#8b6914", borderColor: "#5a3a28", color: "#faf3e3" };
const btnDisabled = { backgroundColor: "#c4a45a", borderColor: "#c4a45a", color: "#e8d5a3", cursor: "not-allowed" };

function ActionButton({ onClick, disabled, children, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={btnBase}
      style={disabled ? { ...btnDisabled, ...style } : { ...btnEnabled, ...style }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = "#a07d1c"; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = "#8b6914"; }}
    >
      {children}
    </button>
  );
}

function ResourceCost({ denarii, stone, timber, iron }) {
  const parts = [];
  if (denarii) parts.push(`${denarii}d`);
  if (stone) parts.push(`${stone} stone`);
  if (timber) parts.push(`${timber} timber`);
  if (iron) parts.push(`${iron} iron`);
  return <span>{parts.join(" + ")}</span>;
}

export default function MilitaryTab({ state, onRecruit, onDismiss, onUpgradeCastle, onInstallDefense }) {
  const { garrison, castleLevel, defenseUpgrades, denarii, inventory, population, difficulty } = state;
  const isEasy = difficulty === "easy";
  const castleLevels = isEasy ? CASTLE_LEVELS_EASY : CASTLE_LEVELS;
  const defenseTable = isEasy ? DEFENSE_UPGRADES_EASY : DEFENSE_UPGRADES;
  const maxByPop = Math.floor(population * 0.6);
  const castle = castleLevels[castleLevel];
  const nextCastle = castleLevels[castleLevel + 1];

  const baseDefense = castle?.defense || 0;
  const upgradeDefense = defenseUpgrades.reduce((sum, id) => {
    const upg = defenseTable[id];
    return sum + (upg?.defense || 0);
  }, 0);
  const totalDefense = baseDefense + upgradeDefense + garrison * 2;

  const effectiveMax = Math.min(MAX_GARRISON, maxByPop);
  const canRecruit1 = denarii >= RECRUIT_COST && garrison < effectiveMax;
  const canRecruit5 = denarii >= RECRUIT_COST * 5 && garrison + 5 <= effectiveMax;
  const canDismiss1 = garrison > 0;
  const canDismiss5 = garrison >= 5;

  const canUpgrade = nextCastle &&
    denarii >= nextCastle.cost &&
    (inventory.stone || 0) >= nextCastle.stone &&
    (inventory.timber || 0) >= nextCastle.timber &&
    (inventory.iron || 0) >= nextCastle.iron;

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
        <div className="grid grid-cols-2 gap-3 text-base mb-3" style={{ color: "#3d2517" }}>
          <div>
            <span className="font-semibold">Soldiers:</span> {garrison}/{effectiveMax}
          </div>
          <div>
            <span className="font-semibold">Upkeep:</span> {garrison * GARRISON_UPKEEP_PER_SOLDIER}d/season
          </div>
          <div>
            <span className="font-semibold">Defense Rating:</span>{" "}
            <span className="font-bold" style={{ color: "#8b1a1a" }}>{totalDefense}</span>
          </div>
          <div>
            <span className="font-semibold">Recruit Cost:</span> {RECRUIT_COST}d/soldier
          </div>
        </div>

        {garrison >= effectiveMax && (
          <p className="text-sm mb-2 italic" style={{ color: "#8b1a1a" }}>
            Garrison at maximum — you need more families to recruit further. The rest must work the fields.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={() => onRecruit(1)} disabled={!canRecruit1}>
            Recruit +1
          </ActionButton>
          <ActionButton onClick={() => onRecruit(5)} disabled={!canRecruit5}>
            Recruit +5
          </ActionButton>
          <ActionButton
            onClick={() => onDismiss(1)}
            disabled={!canDismiss1}
            style={canDismiss1 ? { backgroundColor: "#8b1a1a", borderColor: "#5a1010" } : {}}
          >
            Dismiss -1
          </ActionButton>
          <ActionButton
            onClick={() => onDismiss(5)}
            disabled={!canDismiss5}
            style={canDismiss5 ? { backgroundColor: "#8b1a1a", borderColor: "#5a1010" } : {}}
          >
            Dismiss -5
          </ActionButton>
        </div>
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
          <div className="p-3 rounded-md border mb-3" style={{ borderColor: "#c4a45a", backgroundColor: "#f4e4c1" }}>
            <span className="font-heading font-semibold uppercase" style={{ color: "#5a3a28" }}>
              Next: {nextCastle.name}
            </span>
            <div className="mt-1 text-sm" style={{ color: "#3d2517" }}>
              <ResourceCost denarii={nextCastle.cost} stone={nextCastle.stone} timber={nextCastle.timber} iron={nextCastle.iron} />
            </div>
            <div className="mt-2">
              <ActionButton onClick={onUpgradeCastle} disabled={!canUpgrade}>
                {canUpgrade ? "Upgrade Castle" : "Cannot Afford"}
              </ActionButton>
            </div>
            {!canUpgrade && nextCastle && (
              <p className="text-xs mt-2 italic" style={{ color: "#8b6914" }}>
                {denarii < nextCastle.cost && "Not enough denarii. "}
                {(inventory.stone || 0) < nextCastle.stone && `Need ${nextCastle.stone - (inventory.stone || 0)} more stone. `}
                {(inventory.timber || 0) < nextCastle.timber && `Need ${nextCastle.timber - (inventory.timber || 0)} more timber. `}
                {nextCastle.iron > 0 && (inventory.iron || 0) < nextCastle.iron && `Need ${nextCastle.iron - (inventory.iron || 0)} more iron.`}
              </p>
            )}
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
          {Object.values(defenseTable).map((upgrade) => {
            const owned = defenseUpgrades.includes(upgrade.id);
            const canInstall = !owned &&
              denarii >= upgrade.cost &&
              (inventory.stone || 0) >= upgrade.stone &&
              (inventory.iron || 0) >= upgrade.iron &&
              (inventory.timber || 0) >= upgrade.timber;

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
                  <ResourceCost denarii={upgrade.cost} stone={upgrade.stone} iron={upgrade.iron} timber={upgrade.timber} />
                </div>
                {owned ? (
                  <span className="font-semibold" style={{ color: "#2d5a27" }}>Installed</span>
                ) : (
                  <div className="mt-1">
                    <ActionButton onClick={() => onInstallDefense(upgrade.id)} disabled={!canInstall}>
                      {canInstall ? "Install" : "Cannot Afford"}
                    </ActionButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
