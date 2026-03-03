import { failureNarratives } from "../data/endings";

export default function GameOverScreen({ gameOverReason, causeChain, meters, onPlayAgain }) {
  if (!gameOverReason) return null;

  const { meter, type } = gameOverReason;
  const narrative = failureNarratives[meter]?.[type === "depleted" ? "zero" : "hundred"];

  if (!narrative) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-6"
      style={{ backgroundColor: "#2c1810" }}
    >
      <div
        className="w-full max-w-xl rounded-lg border-2 p-5 sm:p-8 shadow-2xl"
        style={{
          backgroundColor: "#faf3e3",
          borderColor: "#8b1a1a",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{"\u{1F480}"}</div>
          <h2
            className="font-heading text-2xl sm:text-3xl font-bold"
            style={{ color: "#8b1a1a" }}
          >
            {narrative.title}
          </h2>
          <p className="text-base font-semibold mt-1" style={{ color: "#5a3a28" }}>
            {narrative.headline}
          </p>
        </div>

        <div
          className="w-12 h-0.5 mx-auto my-4"
          style={{ backgroundColor: "#8b1a1a" }}
        />

        <p className="text-base leading-relaxed mb-5" style={{ color: "#3d2517" }}>
          {narrative.narrative}
        </p>

        {/* Chronicle of Ruin - Causal Chain */}
        <div
          className="rounded-md border-2 p-4 mb-5"
          style={{ borderColor: "#8b1a1a", backgroundColor: "#fdf6e3" }}
        >
          <h3
            className="font-heading text-base font-bold uppercase tracking-wider mb-3"
            style={{ color: "#8b1a1a" }}
          >
            {"\u{1F4D6}"} Chronicle of Ruin
          </h3>
          <div className="flex flex-col gap-2">
            {causeChain.map((entry, i) => (
              <div key={i} className="flex items-start gap-2">
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{ backgroundColor: "#8b1a1a", color: "#faf3e3" }}
                >
                  {i + 1}
                </div>
                <div>
                  <span className="text-xs font-semibold" style={{ color: "#8b6914" }}>
                    Y{entry.year} {entry.season?.charAt(0).toUpperCase() + entry.season?.slice(1)}
                  </span>
                  <p className="text-sm leading-snug" style={{ color: "#3d2517" }}>
                    {entry.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historian's Lesson */}
        <div
          className="rounded-md border p-4 mb-5"
          style={{ borderColor: "#8b6914", backgroundColor: "#fdf6e3" }}
        >
          <h4
            className="font-heading text-sm font-bold uppercase tracking-wider mb-2"
            style={{ color: "#8b6914" }}
          >
            {"\u{1F4DC}"} Historian's Lesson
          </h4>
          <p className="text-sm leading-relaxed" style={{ color: "#3d2517" }}>
            {narrative.historianLesson}
          </p>
        </div>

        {/* Final meter values */}
        <div className="grid grid-cols-4 gap-2 mb-5 text-center text-xs">
          {["treasury", "people", "military", "faith"].map((m) => (
            <div key={m} className="py-1.5 rounded-md border" style={{ borderColor: "#c4a45a", backgroundColor: "#f4e4c1" }}>
              <div className="font-heading font-semibold uppercase" style={{ color: "#5a3a28" }}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </div>
              <div className="text-lg font-bold" style={{ color: m === meter ? "#8b1a1a" : "#2c1810" }}>
                {meters[m]}
              </div>
            </div>
          ))}
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
          Try Again
        </button>
      </div>
    </div>
  );
}
