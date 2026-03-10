import { useEffect, useRef } from "react";

const SEASON_ICONS = {
  spring: "\u2741",
  summer: "\u2600",
  autumn: "\u2767",
  winter: "\u2744",
};

const TYPE_STYLES = {
  action: { borderLeft: "3px solid #c4a24a" },
  event: { borderLeft: "3px solid #6a4a8a" },
  system: { borderLeft: "3px solid #6a5a42", fontStyle: "italic" },
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
      style={{ borderColor: "#6a5a42", backgroundColor: "#231e16" }}
    >
      <div
        className="px-4 py-2 border-b font-heading text-base font-semibold uppercase tracking-widest"
        style={{ backgroundColor: "#1a1610", borderColor: "#6a5a42", color: "#c4a24a", fontFamily: "Cinzel, serif" }}
      >
        Chronicle of Your Reign
      </div>
      <div
        className="max-h-80 overflow-y-auto p-3 flex flex-col gap-2"
        style={{ scrollbarGutter: "stable", backgroundColor: "#1a1610" }}
      >
        <div ref={topRef} />
        {reversed.map((entry, i) => {
          const icon = SEASON_ICONS[entry.season] || "";
          const style = TYPE_STYLES[entry.type] || TYPE_STYLES.system;
          return (
            <div
              key={entries.length - 1 - i}
              className="pl-3 py-1.5 text-base leading-relaxed"
              style={{ ...style, color: "#a89070" }}
            >
              <span className="text-sm font-semibold mr-1.5" style={{ color: "#c4a24a" }}>
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
