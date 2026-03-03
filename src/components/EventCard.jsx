const INDICATOR_LABELS = {
  treasury: "\u{1FA99}",
  people: "\u{1F33E}",
  military: "\u2694\uFE0F",
  faith: "\u26EA",
};

function IndicatorPills({ indicators }) {
  if (!indicators) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {Object.entries(indicators).map(([meter, dir]) => (
        <span
          key={meter}
          className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full border"
          style={{
            borderColor: "#c4a45a",
            backgroundColor: dir === "up" ? "#e8f5e9" : "#fce4ec",
            color: dir === "up" ? "#2d5a27" : "#8b1a1a",
          }}
        >
          {INDICATOR_LABELS[meter] || meter}
          {dir === "up" ? " \u2191" : " \u2193"}
        </span>
      ))}
    </div>
  );
}

export default function EventCard({ event, onChoose, phaseLabel }) {
  if (!event) return null;

  return (
    <div
      className="mx-auto w-full max-w-xl rounded-lg border-2 p-4 sm:p-5 shadow-lg"
      style={{
        backgroundColor: "#faf3e3",
        borderColor: "#c4a45a",
        boxShadow: "4px 4px 12px rgba(44, 24, 16, 0.15)",
      }}
    >
      {phaseLabel && (
        <div
          className="text-xs uppercase tracking-widest font-heading font-semibold mb-2"
          style={{ color: "#8b6914" }}
        >
          {phaseLabel}
        </div>
      )}
      <h3
        className="font-heading text-lg sm:text-xl font-bold mb-2"
        style={{ color: "#2c1810" }}
      >
        {event.title}
      </h3>
      <p className="text-base leading-relaxed mb-4" style={{ color: "#3d2517" }}>
        {event.description}
      </p>
      <div className="flex flex-col gap-2" role="group" aria-label="Choose your response">
        {event.options.map((option, i) => (
          <button
            key={i}
            onClick={() => onChoose(i)}
            className="w-full text-left px-4 py-4 rounded-md border-2 transition-all duration-200 cursor-pointer min-h-[44px]"
            style={{
              backgroundColor: "#f4e4c1",
              borderColor: "#b89a5a",
              color: "#2c1810",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e8d5a3";
              e.currentTarget.style.borderColor = "#8b6914";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f4e4c1";
              e.currentTarget.style.borderColor = "#b89a5a";
            }}
            aria-label={`Option ${i + 1}: ${option.text}`}
          >
            <div className="font-semibold text-base">{option.text}</div>
            <IndicatorPills indicators={option.indicators} />
          </button>
        ))}
      </div>
    </div>
  );
}
