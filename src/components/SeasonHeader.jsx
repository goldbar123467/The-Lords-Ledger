const SEASON_DISPLAY = {
  spring: { label: "Spring", icon: "\u{1F331}", bg: "#e8f5e9" },
  summer: { label: "Summer", icon: "\u2600\uFE0F", bg: "#fff8e1" },
  autumn: { label: "Autumn", icon: "\u{1F342}", bg: "#fff3e0" },
  winter: { label: "Winter", icon: "\u2744\uFE0F", bg: "#e3f2fd" },
};

export default function SeasonHeader({ season, year, turn }) {
  const s = SEASON_DISPLAY[season] || SEASON_DISPLAY.spring;
  return (
    <div
      className="w-full text-center py-2 px-4 border-b"
      style={{ backgroundColor: s.bg, borderColor: "#c4a45a" }}
    >
      <div className="font-heading text-xl sm:text-2xl font-semibold" style={{ color: "#2c1810" }}>
        {s.icon} {s.label}, Year {year}
      </div>
      <div className="text-sm" style={{ color: "#5a3a28" }}>
        Turn {turn} of 28
      </div>
    </div>
  );
}
