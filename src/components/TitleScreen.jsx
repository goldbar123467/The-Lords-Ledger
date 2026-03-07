const DIFFICULTIES = [
  { key: "easy", label: "Easy", desc: "More resources, gentler penalties", icon: "\u{1F33F}" },
  { key: "normal", label: "Normal", desc: "The standard experience", icon: "\u2696\uFE0F" },
  { key: "hard", label: "Hard", desc: "Fewer resources, harsher realm", icon: "\u{1F480}" },
];

export default function TitleScreen({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: "#f4e4c1" }}
    >
      <div
        className="w-full max-w-lg text-center rounded-lg border-2 p-6 sm:p-10 shadow-xl"
        style={{
          backgroundColor: "#faf3e3",
          borderColor: "#8b6914",
          boxShadow: "6px 6px 20px rgba(44, 24, 16, 0.2)",
        }}
      >
        <div className="text-5xl mb-4">{"\u{1F3F0}"}</div>
        <h1
          className="font-heading text-3xl sm:text-4xl font-bold mb-2"
          style={{ color: "#2c1810" }}
        >
          The Lord's Ledger
        </h1>
        <p className="text-lg mb-1" style={{ color: "#5a3a28" }}>
          A Medieval Economic Simulation
        </p>
        <div
          className="w-16 h-0.5 mx-auto my-4"
          style={{ backgroundColor: "#8b6914" }}
        />
        <p className="text-base leading-relaxed mb-6" style={{ color: "#3d2517" }}>
          The old lord has passed, and the estate is now yours. Manage your treasury,
          keep your people fed, defend your borders, and honor the Church — for seven
          years, through spring planting and winter storms, through raids and feasts
          and the quiet decisions that shape a reign.
        </p>
        <p className="text-sm mb-4" style={{ color: "#8b6914" }}>
          Every choice has consequences. There are no right answers — only trade-offs.
        </p>
        <p
          className="text-sm font-heading font-semibold uppercase tracking-wider mb-3"
          style={{ color: "#5a3a28" }}
        >
          Choose Your Challenge
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.key}
              onClick={() => onStart(d.key)}
              className="flex-1 px-4 py-3 rounded-md border-2 font-heading font-bold text-base uppercase tracking-wider cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
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
              <span className="block text-lg mb-0.5">{d.icon}</span>
              <span className="block">{d.label}</span>
              <span
                className="block text-xs font-normal normal-case tracking-normal mt-0.5"
                style={{ color: "#e8d5a3" }}
              >
                {d.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-6 text-xs" style={{ color: "#8b6914" }}>
        A game about medieval economics, trade-offs, and the weight of a crown.
      </p>
    </div>
  );
}
