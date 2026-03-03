import { useEffect, useState } from "react";
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
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (status === "critical" || status === "danger") {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [value, status]);

  if (!active) return null;

  const isWarning = status === "critical" || status === "danger" || status === "warning";

  return (
    <div
      className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${
        flash ? "scale-110" : ""
      }`}
      style={{ minWidth: 70 }}
    >
      <div className="flex items-center gap-1">
        <span className="text-base">{config.icon}</span>
        <span
          className="text-xs font-heading font-semibold uppercase tracking-wide"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </div>
      <div
        className="w-full h-4 rounded-full overflow-hidden border"
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
            boxShadow: flash ? `0 0 8px ${config.lightColor}` : "none",
          }}
        />
      </div>
      <div className="flex items-center">
        <span
          className="text-sm font-bold"
          style={{ color: config.color }}
        >
          {value}
        </span>
        <DeltaArrow delta={delta} />
      </div>
    </div>
  );
}

export default function ResourceBar({ meters, meterDeltas, activeMeterCount }) {
  const meterNames = ["treasury", "people", "military", "faith"];

  return (
    <div className="w-full px-3 py-2 flex justify-center gap-3 sm:gap-5 border-b-2"
      style={{
        backgroundColor: "#f0dca0",
        borderColor: "#c4a45a",
      }}
    >
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
  );
}
