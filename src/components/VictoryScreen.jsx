import { victoryTitles, victorySummary } from "../data/endings";

function getVictoryTitle(meters) {
  const { treasury, people, military, faith } = meters;
  const isBalanced =
    treasury >= 40 && treasury <= 60 &&
    people >= 40 && people <= 60 &&
    military >= 40 && military <= 60 &&
    faith >= 40 && faith <= 60;

  if (isBalanced) return victoryTitles.balanced;

  const entries = [
    { key: "treasury", value: treasury },
    { key: "people", value: people },
    { key: "military", value: military },
    { key: "faith", value: faith },
  ];
  entries.sort((a, b) => b.value - a.value);
  return victoryTitles[entries[0].key];
}

export default function VictoryScreen({ meters, onPlayAgain }) {
  const title = getVictoryTitle(meters);
  const summary = victorySummary(meters);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 py-6"
      style={{ backgroundColor: "#2c1810" }}
    >
      <div
        className="w-full max-w-xl rounded-lg border-2 p-5 sm:p-8 shadow-2xl"
        style={{
          backgroundColor: "#faf3e3",
          borderColor: "#8b6914",
          boxShadow: "0 8px 32px rgba(139, 105, 20, 0.3)",
        }}
      >
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">{"\u{1F451}"}</div>
          <h2
            className="font-heading text-3xl sm:text-4xl font-bold"
            style={{ color: "#8b6914" }}
          >
            {title.title}
          </h2>
          <p className="text-base font-semibold mt-1" style={{ color: "#5a3a28" }}>
            {title.subtitle}
          </p>
        </div>

        <div
          className="w-16 h-0.5 mx-auto my-4"
          style={{ backgroundColor: "#8b6914" }}
        />

        <p className="text-base leading-relaxed mb-4" style={{ color: "#3d2517" }}>
          {title.description}
        </p>

        <p className="text-base leading-relaxed mb-5" style={{ color: "#3d2517" }}>
          {summary}
        </p>

        {/* Final meter values */}
        <div className="grid grid-cols-4 gap-2 mb-5 text-center text-xs">
          {["treasury", "people", "military", "faith"].map((m) => {
            const icons = {
              treasury: "\u{1FA99}",
              people: "\u{1F33E}",
              military: "\u2694\uFE0F",
              faith: "\u26EA",
            };
            return (
              <div
                key={m}
                className="py-2 rounded-md border"
                style={{ borderColor: "#c4a45a", backgroundColor: "#f4e4c1" }}
              >
                <div className="text-lg mb-0.5">{icons[m]}</div>
                <div
                  className="font-heading font-semibold uppercase"
                  style={{ color: "#5a3a28" }}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </div>
                <div
                  className="text-xl font-bold"
                  style={{ color: "#2c1810" }}
                >
                  {meters[m]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Historian's Note */}
        <div
          className="rounded-md border p-4 mb-5"
          style={{ borderColor: "#8b6914", backgroundColor: "#fdf6e3" }}
        >
          <h4
            className="font-heading text-sm font-bold uppercase tracking-wider mb-2"
            style={{ color: "#8b6914" }}
          >
            {"\u{1F4DC}"} Historian's Note
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: "#3d2517" }}>
            {title.historianNote}
          </p>
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full py-3 rounded-md border-2 font-heading font-bold text-base uppercase tracking-wider cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: "#8b6914",
            borderColor: "#5a3a28",
            color: "#faf3e3",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#a07d1c";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#8b6914";
          }}
        >
          Reign Again
        </button>
      </div>
    </div>
  );
}
