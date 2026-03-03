import { useEffect, useRef } from "react";

const SEASON_ICONS = {
  spring: "\u{1F331}",
  summer: "\u2600\uFE0F",
  autumn: "\u{1F342}",
  winter: "\u2744\uFE0F",
};

const TYPE_STYLES = {
  action: { borderLeft: "3px solid #b8860b" },
  event: { borderLeft: "3px solid #4a1a6b" },
  system: { borderLeft: "3px solid #5a3a28", fontStyle: "italic" },
};

export default function Chronicle({ entries }) {
  const topRef = useRef(null);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [entries.length]);

  if (entries.length === 0) return null;

  const reversed = [...entries].reverse();

  return (
    <div
      className="w-full max-w-xl mx-auto mt-4 rounded-lg border-2 overflow-hidden"
      style={{ borderColor: "#c4a45a", backgroundColor: "#faf3e3" }}
    >
      <div
        className="px-4 py-2 border-b font-heading text-base font-semibold uppercase tracking-widest"
        style={{ backgroundColor: "#e8d5a3", borderColor: "#c4a45a", color: "#5a3a28" }}
      >
        Chronicle of Your Reign
      </div>
      <div
        className="max-h-80 overflow-y-auto p-3 flex flex-col gap-2"
        style={{ scrollbarGutter: "stable" }}
      >
        <div ref={topRef} />
        {reversed.map((entry, i) => {
          const icon = SEASON_ICONS[entry.season] || "";
          const style = TYPE_STYLES[entry.type] || TYPE_STYLES.system;
          return (
            <div
              key={entries.length - 1 - i}
              className="pl-3 py-1.5 text-base leading-relaxed"
              style={{ ...style, color: "#3d2517" }}
            >
              <span className="text-sm font-semibold mr-1.5" style={{ color: "#8b6914" }}>
                {icon} Y{entry.year} {entry.season?.charAt(0).toUpperCase() + entry.season?.slice(1)}
              </span>
              <span>{entry.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
