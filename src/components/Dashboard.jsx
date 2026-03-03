/**
 * Dashboard.jsx
 *
 * V2 top bar: Row 1 = core meters (from V1), Row 2 = economy stats.
 * Always visible, never scrolls.
 */

import { getMeterStatus } from "../engine/meterUtils";

const METER_CONFIG = {
  treasury: { label: "Treasury", icon: "\u{1FA99}", color: "#b8860b", lightColor: "#daa520" },
  people:   { label: "People",   icon: "\u{1F33E}", color: "#2d5a27", lightColor: "#4a8c3f" },
  military: { label: "Military", icon: "\u2694\uFE0F",  color: "#8b1a1a", lightColor: "#c0392b" },
  faith:    { label: "Faith",    icon: "\u26EA",  color: "#4a1a6b", lightColor: "#6b3fa0" },
};

function DeltaArrow({ delta }) {
  if (delta === 0) return null;
  const isUp = delta > 0;
  return (
    <span
      className={`ml-1 text-sm font-bold transition-opacity duration-500 ${
        isUp ? "text-green-700" : "text-red-700"
      }`}
    >
      {isUp ? `+${delta}` : delta}
    </span>
  );
}

function SingleMeter({ name, value, delta, active }) {
  const config = METER_CONFIG[name];
  const status = getMeterStatus(value);

  if (!active) return null;

  const isWarning = status === "critical" || status === "danger" || status === "warning";
  const shouldPulse = status === "critical" || status === "danger";

  return (
    <div
      className="flex flex-col items-center gap-0.5 transition-all duration-300"
      style={{ minWidth: 70 }}
      role="meter"
      aria-label={`${config.label}: ${value} out of 100`}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="flex items-center gap-1">
        <span className="text-base" aria-hidden="true">{config.icon}</span>
        <span
          className="text-sm font-heading font-semibold uppercase tracking-wide"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </div>
      <div
        className={`w-full h-4 rounded-full overflow-hidden border ${shouldPulse ? "meter-pulse" : ""}`}
        style={{
          borderColor: isWarning ? "#c0392b" : config.color,
          backgroundColor: "#e8d5a3",
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${value}%`,
            backgroundColor: isWarning ? (status === "critical" ? "#c0392b" : config.lightColor) : config.color,
          }}
        />
      </div>
      <div className="flex items-center">
        <span className="text-sm font-bold" style={{ color: config.color }}>{value}</span>
        <DeltaArrow delta={delta} />
      </div>
    </div>
  );
}

function FlipStatBar({ flipStats }) {
  if (!flipStats) return null;

  return (
    <div className="px-3 py-2 flex justify-center gap-3 sm:gap-5">
      {flipStats.map((stat) => (
        <div
          key={stat.key}
          className="flex flex-col items-center gap-0.5 transition-all duration-300"
          style={{ minWidth: 70 }}
          role="meter"
          aria-label={`${stat.label}: ${stat.value} out of 100`}
          aria-valuenow={stat.value}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="flex items-center gap-1">
            <span className="text-base" aria-hidden="true">{stat.icon}</span>
            <span
              className="text-sm font-heading font-semibold uppercase tracking-wide"
              style={{ color: stat.color }}
            >
              {stat.label}
            </span>
          </div>
          <div
            className="w-full h-4 rounded-full overflow-hidden border"
            style={{
              borderColor: stat.color,
              backgroundColor: "#e8d5a3",
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${stat.value}%`,
                backgroundColor: stat.color,
              }}
            />
          </div>
          <span className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</span>
        </div>
      ))}
    </div>
  );
}

function EconStat({ icon, label, value, warning }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm">{icon}</span>
      <span className="text-xs font-heading font-semibold uppercase tracking-wide" style={{ color: "#5a3a28" }}>
        {label}:
      </span>
      <span
        className="text-sm font-bold"
        style={{ color: warning ? "#c0392b" : "#2c1810" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function Dashboard({
  meters,
  meterDeltas,
  activeMeterCount,
  denarii,
  food,
  population,
  season,
  year,
  turn,
  flipMode,
  flipStats,
}) {
  const meterNames = ["treasury", "people", "military", "faith"];

  const SEASON_ICONS = {
    spring: "\u{1F331}",
    summer: "\u2600\uFE0F",
    autumn: "\u{1F342}",
    winter: "\u2744\uFE0F",
  };

  const seasonLabel = season ? season.charAt(0).toUpperCase() + season.slice(1) : "";

  return (
    <div
      className="w-full border-b-2"
      style={{ backgroundColor: "#f0dca0", borderColor: "#c4a45a" }}
    >
      {/* Row 1: Core meters OR flip stats */}
      {flipMode && flipStats ? (
        <FlipStatBar flipStats={flipStats} />
      ) : (
        <div className="px-3 py-2 flex justify-center gap-3 sm:gap-5">
          {meterNames.map((name, i) => (
            <SingleMeter
              key={name}
              name={name}
              value={meters[name]}
              delta={meterDeltas[name]}
              active={i < activeMeterCount}
            />
          ))}
        </div>
      )}

      {/* Row 2: Economy stats (hidden during flip) */}
      {!flipMode && (
        <div
          className="px-3 py-1.5 flex flex-wrap justify-center gap-x-4 gap-y-1 border-t"
          style={{ borderColor: "#c4a45a", backgroundColor: "#ebd599" }}
        >
          <EconStat icon={"\u{1FA99}"} label="Denarii" value={`${denarii}d`} warning={denarii <= 0} />
          <EconStat icon={"\u{1F35E}"} label="Food" value={food} warning={food <= 0} />
          <EconStat icon={"\u{1F3E0}"} label="Families" value={population} />
          <EconStat
            icon={SEASON_ICONS[season] || ""}
            label="Season"
            value={`${seasonLabel}, Y${year} (Turn ${turn}/28)`}
          />
        </div>
      )}
    </div>
  );
}
