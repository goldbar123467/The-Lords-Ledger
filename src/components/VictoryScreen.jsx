import { getVictoryTitle, victorySummary } from "../data/endings";
import { getSynergyVictoryTitle, getActiveSynergyDisplay } from "../engine/synergyEngine.js";

function computeVictoryTitle(state, activatedSynergies) {
  // Tier 3 synergy title override takes priority
  const synergyTitle = getSynergyVictoryTitle(activatedSynergies ?? []);
  if (synergyTitle) return synergyTitle;

  return getVictoryTitle(state);
}

export default function VictoryScreen({ state, onPlayAgain, activatedSynergies }) {
  const title = computeVictoryTitle(state, activatedSynergies);
  const summary = victorySummary(state);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 py-6"
      style={{ backgroundColor: "#0f0d0a" }}
    >
      <div
        className="w-full max-w-xl rounded-lg border-2 p-5 sm:p-8 shadow-2xl"
        style={{
          backgroundColor: "#1a1610",
          borderColor: "#c4a24a",
          boxShadow: "0 8px 32px rgba(196, 162, 74, 0.3)",
        }}
      >
        <div className="text-center mb-4">
          <div className="text-5xl mb-2" style={{ color: "#e8c44a" }}>{"\u265B"}</div>
          <h2
            className="font-heading text-3xl sm:text-4xl font-bold"
            style={{ color: "#e8c44a", textShadow: "0 0 12px rgba(232, 196, 74, 0.4)" }}
          >
            {title.title}
          </h2>
          <p className="text-base font-semibold mt-1" style={{ color: "#a89070" }}>
            {title.subtitle}
          </p>
        </div>

        <div className="flex items-center justify-center my-4 gap-2">
          <div className="flex-1 h-0.5" style={{ backgroundColor: "#c4a24a" }} />
          <div className="text-sm" style={{ color: "#c4a24a" }}>{"\u25C6"}</div>
          <div className="flex-1 h-0.5" style={{ backgroundColor: "#c4a24a" }} />
        </div>

        <p className="text-base leading-relaxed mb-4" style={{ color: "#a89070" }}>
          {title.description}
        </p>

        <p className="text-base leading-relaxed mb-5" style={{ color: "#a89070" }}>
          {summary}
        </p>

        {/* Final resource values */}
        <div className="grid grid-cols-4 gap-2 mb-5 text-center text-xs">
          {[
            { key: "denarii", label: "Denarii", icon: "\u269C", value: `${state.denarii || 0}d` },
            { key: "food", label: "Food", icon: "\u2727", value: state.food || 0 },
            { key: "population", label: "Families", icon: "\u2302", value: state.population || 0 },
            { key: "garrison", label: "Garrison", icon: "\u2694", value: state.garrison || 0 },
          ].map((r) => (
            <div
              key={r.key}
              className="py-2 rounded-md border"
              style={{ borderColor: "#6a5a42", backgroundColor: "#231e16" }}
            >
              <div className="text-lg mb-0.5" style={{ color: "#c4a24a" }}>{r.icon}</div>
              <div
                className="font-heading font-semibold uppercase"
                style={{ color: "#6a5a42" }}
              >
                {r.label}
              </div>
              <div
                className="text-xl font-bold"
                style={{ color: "#e8c44a" }}
              >
                {r.value}
              </div>
            </div>
          ))}
        </div>

        {/* Strategy Paths */}
        {(() => {
          const synDisplay = getActiveSynergyDisplay(activatedSynergies ?? []);
          if (synDisplay.length === 0) return null;
          return (
            <div
              className="rounded-md border p-4 mb-5"
              style={{ borderColor: "#c4a24a", backgroundColor: "#231e16" }}
            >
              <h4
                className="font-heading text-sm font-bold uppercase tracking-wider mb-2"
                style={{ color: "#c4a24a" }}
              >
                Strategy Paths
              </h4>
              <div className="space-y-1.5">
                {synDisplay.map((s) => (
                  <div key={s.pathName} className="flex items-center gap-2 text-sm">
                    <span className="text-base">{s.pathIcon}</span>
                    <span className="font-semibold" style={{ color: s.pathColor }}>{s.pathName}</span>
                    <span style={{ color: "#a89070" }}>
                      {"—"} Tier {s.tierLevel}: {s.tierTitle}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Historian's Note */}
        <div
          className="rounded-md border p-4 mb-5"
          style={{ borderColor: "#c4a24a", backgroundColor: "#231e16" }}
        >
          <h4
            className="font-heading text-sm font-bold uppercase tracking-wider mb-2"
            style={{ color: "#c4a24a" }}
          >
            Historian's Note
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: "#a89070" }}>
            {title.historianNote}
          </p>
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full py-3 rounded-md border-2 font-heading font-bold text-base uppercase tracking-wider cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #8b1a1a, #c62828)",
            borderColor: "#c4a24a",
            color: "#e8c44a",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #a02020, #d63030)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #8b1a1a, #c62828)";
          }}
        >
          Reign Again
        </button>
      </div>
    </div>
  );
}
