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

const btnBase = "px-3 py-2 rounded-md font-bold text-sm uppercase tracking-wider cursor-pointer transition-all duration-200 min-h-[44px]";
const btnEnabled = { backgroundColor: "#8b1a1a", border: "1px solid #6a5a42", color: "#e8c44a" };
const btnDisabled = { backgroundColor: "#2a2318", border: "1px solid #3a3228", color: "#6a5a42", cursor: "not-allowed" };

function ActionButton({ onClick, disabled, children, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={btnBase}
      style={{ fontFamily: "Cinzel, serif", ...(disabled ? { ...btnDisabled, ...style } : { ...btnEnabled, ...style }) }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = "#c62828"; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = (style && style.backgroundColor) || "#8b1a1a"; }}
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

  const criminalDefended = garrison >= 5;
  const scottishDefended = garrison >= 10;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Raid defense status */}
      <div
        className="rounded-lg p-4 mb-4"
        style={{ backgroundColor: "#231e16", border: "1px solid #6a5a42" }}
      >
        <h3
          className="text-sm font-bold uppercase tracking-wider mb-3"
          style={{ fontFamily: "Cinzel, serif", color: "#c4a24a" }}
        >
          {"\u2694"} Raid Defense Status
        </h3>
        <div className="grid grid-cols-1 gap-2 text-base" style={{ color: "#a89070" }}>
          <div className="flex items-center justify-between">
            <span>
              <span className="font-semibold" style={{ color: "#c8b090" }}>Outlaws:</span>{" "}
              5 garrison
            </span>
            <span
              className="font-bold text-sm uppercase tracking-wider"
              style={{ color: criminalDefended ? "#4a8a3a" : "#c62828" }}
            >
              {criminalDefended ? "\u2713 DEFENDED" : "\u2717 VULNERABLE"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>
              <span className="font-semibold" style={{ color: "#c8b090" }}>Scots:</span>{" "}
              10 garrison
            </span>
            <span
              className="font-bold text-sm uppercase tracking-wider"
              style={{ color: scottishDefended ? "#4a8a3a" : "#c62828" }}
            >
              {scottishDefended ? "\u2713 DEFENDED" : "\u2717 VULNERABLE"}
            </span>
          </div>
        </div>
        <div className="mt-2 text-sm" style={{ color: "#a89070" }}>
          <span className="font-semibold" style={{ color: "#c8b090" }}>Your garrison:</span>{" "}
          <span style={{ color: "#e8c44a" }}>{garrison}</span>
        </div>
      </div>

      {/* Garrison panel */}
      <div
        className="rounded-lg p-4 mb-4"
        style={{ backgroundColor: "#231e16", border: "1px solid #6a5a42" }}
      >
        <h3
          className="text-sm font-bold uppercase tracking-wider mb-3"
          style={{ fontFamily: "Cinzel, serif", color: "#c62828" }}
        >
          {"\u2694"} Garrison
        </h3>
        <div className="grid grid-cols-2 gap-3 text-base mb-3" style={{ color: "#a89070" }}>
          <div>
            <span className="font-semibold" style={{ color: "#c8b090" }}>Soldiers:</span>{" "}
            <span style={{ color: "#e8c44a" }}>{garrison}/{effectiveMax}</span>
          </div>
          <div>
            <span className="font-semibold" style={{ color: "#c8b090" }}>Upkeep:</span>{" "}
            <span style={{ color: "#e8c44a" }}>{garrison * GARRISON_UPKEEP_PER_SOLDIER}d/season</span>
          </div>
          <div>
            <span className="font-semibold" style={{ color: "#c8b090" }}>Defense Rating:</span>{" "}
            <span className="font-bold" style={{ color: "#c62828" }}>{totalDefense}</span>
          </div>
          <div>
            <span className="font-semibold" style={{ color: "#c8b090" }}>Recruit Cost:</span>{" "}
            <span style={{ color: "#e8c44a" }}>{RECRUIT_COST}d/soldier</span>
          </div>
        </div>

        {garrison >= effectiveMax && (
          <p className="text-sm mb-2 italic" style={{ color: "#8a7a3a" }}>
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
            style={canDismiss1 ? { backgroundColor: "#8b1a1a", border: "1px solid #5a1010" } : {}}
          >
            Dismiss -1
          </ActionButton>
          <ActionButton
            onClick={() => onDismiss(5)}
            disabled={!canDismiss5}
            style={canDismiss5 ? { backgroundColor: "#8b1a1a", border: "1px solid #5a1010" } : {}}
          >
            Dismiss -5
          </ActionButton>
        </div>
      </div>

      {/* Castle level */}
      <div
        className="rounded-lg p-4 mb-4"
        style={{ backgroundColor: "#231e16", border: "1px solid #6a5a42" }}
      >
        <h3
          className="text-sm font-bold uppercase tracking-wider mb-3"
          style={{ fontFamily: "Cinzel, serif", color: "#c4a24a" }}
        >
          {"\u265B"} Castle — {castle?.name || "Unknown"}
        </h3>
        <div className="text-base mb-3" style={{ color: "#a89070" }}>
          <span className="font-semibold" style={{ color: "#c8b090" }}>Level:</span>{" "}
          <span style={{ color: "#e8c44a" }}>{castleLevel}/4</span>
          <span className="ml-4 font-semibold" style={{ color: "#c8b090" }}>Base Defense:</span>{" "}
          <span style={{ color: "#e8c44a" }}>{baseDefense}</span>
        </div>

        {/* Castle level visual */}
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4].map((lvl) => (
            <div
              key={lvl}
              className="flex-1 h-3 rounded-full"
              style={{
                backgroundColor: lvl <= castleLevel ? "#c4a24a" : "#2a2318",
                border: "1px solid #6a5a42",
              }}
            />
          ))}
        </div>

        {nextCastle ? (
          <div className="p-3 rounded-md mb-3" style={{ border: "1px solid #6a5a42", backgroundColor: "#1a1610" }}>
            <span className="font-semibold uppercase" style={{ fontFamily: "Cinzel, serif", color: "#c8b090" }}>
              Next: {nextCastle.name}
            </span>
            <div className="mt-1 text-sm" style={{ color: "#a89070" }}>
              <ResourceCost denarii={nextCastle.cost} stone={nextCastle.stone} timber={nextCastle.timber} iron={nextCastle.iron} />
            </div>
            <div className="mt-2">
              <ActionButton onClick={onUpgradeCastle} disabled={!canUpgrade}>
                {canUpgrade ? "Upgrade Castle" : "Cannot Afford"}
              </ActionButton>
            </div>
            {!canUpgrade && nextCastle && (
              <p className="text-xs mt-2 italic" style={{ color: "#8a7a3a" }}>
                {denarii < nextCastle.cost && "Not enough denarii. "}
                {(inventory.stone || 0) < nextCastle.stone && `Need ${nextCastle.stone - (inventory.stone || 0)} more stone. `}
                {(inventory.timber || 0) < nextCastle.timber && `Need ${nextCastle.timber - (inventory.timber || 0)} more timber. `}
                {nextCastle.iron > 0 && (inventory.iron || 0) < nextCastle.iron && `Need ${nextCastle.iron - (inventory.iron || 0)} more iron.`}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs font-semibold" style={{ color: "#4a8a3a" }}>
            Maximum fortification reached!
          </p>
        )}
      </div>

      {/* Defense upgrades */}
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: "#231e16", border: "1px solid #6a5a42" }}
      >
        <h3
          className="text-sm font-bold uppercase tracking-wider mb-3"
          style={{ fontFamily: "Cinzel, serif", color: "#c4a24a" }}
        >
          {"\u2694"} Defense Upgrades
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
                className="p-2.5 rounded-md text-sm"
                style={{
                  border: owned ? "1px solid #4a8a3a" : "1px solid #6a5a42",
                  backgroundColor: owned ? "rgba(74, 138, 58, 0.1)" : "#1a1610",
                }}
              >
                <div className="font-semibold" style={{ fontFamily: "Cinzel, serif", color: "#c8b090" }}>
                  {upgrade.name} <span style={{ color: "#4a8a3a" }}>+{upgrade.defense} defense</span>
                </div>
                <div style={{ color: "#a89070" }}>
                  <ResourceCost denarii={upgrade.cost} stone={upgrade.stone} iron={upgrade.iron} timber={upgrade.timber} />
                </div>
                {owned ? (
                  <span className="font-semibold" style={{ color: "#4a8a3a" }}>Installed</span>
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
