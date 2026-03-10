/**
 * GreatHall.jsx
 *
 * Phase 1 — The Hall Itself
 * A stone-walled hall with animated torches, meter display bar,
 * throne room with Steward Edmund, petition queue, and atmospheric
 * cycling text. Internal navigation for future views (audience,
 * decrees, council, feast).
 */

import { useState, useEffect } from "react";
import {
  Scale, Users, ScrollText, Landmark, Utensils, ChevronRight,
} from "lucide-react";
import {
  AMBIENT_TEXTS, EDMUND_GREETINGS, QUEUE_ITEMS,
  METER_CONFIG, DEFAULT_METERS,
} from "../data/greatHall";

// ─── Internal navigation config ────────────────────────────────

const HALL_VIEWS = [
  { id: "throne",   label: "Throne",   Icon: Scale },
  { id: "audience", label: "Audience", Icon: Users },
  { id: "decrees",  label: "Decrees",  Icon: ScrollText },
  { id: "council",  label: "Council",  Icon: Landmark },
  { id: "feast",    label: "Feast",    Icon: Utensils },
];

// ─── Sub-components ────────────────────────────────────────────

/** CSS-drawn NPC portrait — bordered frame with initial letter */
function NpcPortrait({ initial, socialClass = "steward", mood = "neutral", size = 72 }) {
  const bgMap = {
    peasant:  "linear-gradient(135deg, #4a3728, #2d2018)",
    merchant: "linear-gradient(135deg, #2d4a28, #1a2d14)",
    clergy:   "linear-gradient(135deg, #3a2850, #221838)",
    military: "linear-gradient(135deg, #3a3a40, #222228)",
    noble:    "linear-gradient(135deg, #4a3a10, #2d2408)",
    steward:  "linear-gradient(135deg, #3a3020, #252018)",
  };
  const borderMap = {
    angry:   "#c44444",
    sad:     "#6688aa",
    nervous: "#ccaa44",
    hopeful: "#44aa88",
    neutral: "#d4a44c",
    dutiful: "#a89070",
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid ${borderMap[mood] || borderMap.neutral}`,
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Cinzel Decorative, Cinzel, serif",
        fontSize: size * 0.35,
        color: "#e8dcc8",
        background: bgMap[socialClass] || bgMap.peasant,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

/** Single meter progress bar with label and value */
function MeterBar({ label, value, color }) {
  const isLow = value < 20;
  const isHigh = value > 80;

  return (
    <div style={{ flex: "1 1 120px", minWidth: 110 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 3 }}>
        <span
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: "0.6rem",
            color,
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: "0.65rem", color: "#a89070", fontFamily: "Cinzel, serif" }}>
          {value}
        </span>
      </div>
      <div
        style={{
          height: 7,
          borderRadius: 4,
          overflow: "hidden",
          backgroundColor: "#1a1714",
          border: isLow
            ? "1px solid rgba(198,40,40,0.5)"
            : isHigh
            ? "1px solid rgba(74,138,58,0.5)"
            : "1px solid #2a2520",
          boxShadow: isLow
            ? "0 0 6px rgba(198,40,40,0.2)"
            : isHigh
            ? "0 0 6px rgba(74,138,58,0.2)"
            : "none",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 4,
            width: `${value}%`,
            backgroundColor: color,
            transition: "width 600ms ease",
            boxShadow: `0 0 4px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

/** Animated CSS torch — flame + bracket */
function Torch() {
  return (
    <div
      className="torch-glow"
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {/* Flame */}
      <div
        style={{
          width: 14,
          height: 22,
          background:
            "radial-gradient(ellipse at center bottom, #e8c44a 0%, #c4813a 40%, #8b5e2b 70%, transparent 100%)",
          borderRadius: "50% 50% 20% 20%",
          filter: "blur(1px)",
        }}
      />
      {/* Bracket */}
      <div
        style={{
          width: 4,
          height: 28,
          background: "linear-gradient(180deg, #5a4a30, #3d3020)",
          borderRadius: 2,
        }}
      />
    </div>
  );
}

// ─── Throne Room (default view) ────────────────────────────────

function ThroneRoom({ edmundLine }) {
  return (
    <div>
      {/* Central throne icon + description */}
      <div className="text-center" style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            border: "2px solid #d4a44c",
            borderRadius: 8,
            background:
              "linear-gradient(135deg, #2a2520 0%, #1a1714 50%, #2a2520 100%)",
            boxShadow:
              "0 0 20px rgba(212,164,76,0.15), inset 0 0 20px rgba(0,0,0,0.3)",
            marginBottom: 8,
          }}
        >
          <Scale size={36} style={{ color: "#d4a44c" }} />
        </div>
        <h3
          style={{
            fontFamily: "Cinzel Decorative, Cinzel, serif",
            fontSize: "0.9rem",
            color: "#d4a44c",
            letterSpacing: "2px",
            margin: "4px 0",
          }}
        >
          The Seat of Judgment
        </h3>
        <p
          style={{
            fontFamily: "Crimson Text, serif",
            fontStyle: "italic",
            fontSize: "0.8rem",
            color: "#a89070",
            margin: 0,
          }}
        >
          From this throne, the lord hears the disputes of the land and shapes
          the fate of the manor.
        </p>
      </div>

      {/* Two-panel layout: Steward + Queue */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Steward Edmund */}
        <div
          className="flex-1"
          style={{
            border: "1px solid #3d3630",
            borderRadius: 6,
            backgroundColor: "rgba(42,37,32,0.5)",
            padding: 12,
          }}
        >
          <div className="flex items-start gap-3">
            <NpcPortrait initial="E" socialClass="steward" mood="dutiful" size={64} />
            <div className="flex-1 min-w-0">
              <h4
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: "0.8rem",
                  color: "#d4a44c",
                  margin: "0 0 2px",
                }}
              >
                Edmund
              </h4>
              <p
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: "0.6rem",
                  color: "#6a5a42",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  margin: "0 0 8px",
                }}
              >
                Steward of the Hall
              </p>
              <p
                style={{
                  fontFamily: "Crimson Text, serif",
                  fontStyle: "italic",
                  fontSize: "0.85rem",
                  color: "#c8b090",
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                &ldquo;{edmundLine}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Queue */}
        <div
          className="flex-1"
          style={{
            border: "1px solid #3d3630",
            borderRadius: 6,
            backgroundColor: "rgba(42,37,32,0.5)",
            padding: 12,
          }}
        >
          <h4
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: "0.8rem",
              color: "#d4a44c",
              margin: "0 0 8px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ScrollText size={14} />
            Today&rsquo;s Queue
          </h4>
          {QUEUE_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2"
              style={{
                padding: "6px 0",
                borderTop: i > 0 ? "1px solid #2a2520" : "none",
              }}
            >
              <ChevronRight
                size={12}
                style={{ color: "#6a5a42", flexShrink: 0 }}
              />
              <span
                style={{
                  fontFamily: "Crimson Text, serif",
                  fontSize: "0.85rem",
                  color: "#c8b090",
                }}
              >
                {item.title}
              </span>
              <span
                style={{
                  fontFamily: "Cinzel, serif",
                  fontSize: "0.55rem",
                  color: "#6a5a42",
                  marginLeft: "auto",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  flexShrink: 0,
                }}
              >
                {item.urgency}
              </span>
            </div>
          ))}
          <p
            style={{
              fontFamily: "Crimson Text, serif",
              fontStyle: "italic",
              fontSize: "0.75rem",
              color: "#6a5a42",
              marginTop: 8,
              marginBottom: 0,
            }}
          >
            Disputes and petitions will be heard from the throne.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder for unbuilt views ─────────────────────────────

const VIEW_INFO = {
  audience: {
    title: "The Audience Chamber",
    desc: "Hold audience with your people. Hear their pleas, their gossip, and their wisdom.",
    Icon: Users,
  },
  decrees: {
    title: "The Decree Desk",
    desc: "Issue official decrees sealed with wax. Each decree shapes the laws and customs of your manor.",
    Icon: ScrollText,
  },
  council: {
    title: "The Council Chamber",
    desc: "Convene your advisors to debate matters of great importance to the realm.",
    Icon: Landmark,
  },
  feast: {
    title: "The Feast Hall",
    desc: "Host a grand feast for the village. Break bread, build bonds, and celebrate the season.",
    Icon: Utensils,
  },
};

function PlaceholderView({ viewId, onBack }) {
  const info = VIEW_INFO[viewId] || {
    title: "Unknown",
    desc: "",
    Icon: Scale,
  };
  const ViewIcon = info.Icon;

  return (
    <div className="text-center" style={{ padding: "32px 0" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          border: "2px solid #3d3630",
          borderRadius: 8,
          backgroundColor: "rgba(26,23,20,0.5)",
          marginBottom: 12,
        }}
      >
        <ViewIcon size={28} style={{ color: "#6a5a42" }} />
      </div>
      <h3
        style={{
          fontFamily: "Cinzel Decorative, Cinzel, serif",
          fontSize: "1rem",
          color: "#6a5a42",
          letterSpacing: "2px",
          margin: "0 0 8px",
        }}
      >
        {info.title}
      </h3>
      <p
        style={{
          fontFamily: "Crimson Text, serif",
          fontStyle: "italic",
          fontSize: "0.85rem",
          color: "#4a4030",
          maxWidth: 400,
          margin: "0 auto 16px",
        }}
      >
        {info.desc}
      </p>
      <p
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: "0.65rem",
          color: "#4a4030",
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}
      >
        Coming Soon
      </p>
      <button
        onClick={onBack}
        style={{
          fontFamily: "Cinzel, serif",
          fontSize: "0.75rem",
          color: "#d4a44c",
          background: "none",
          border: "1px solid #3d3630",
          padding: "6px 16px",
          borderRadius: 4,
          cursor: "pointer",
          marginTop: 12,
          transition: "all 200ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#d4a44c";
          e.currentTarget.style.backgroundColor = "rgba(212,164,76,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#3d3630";
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        Return to Throne
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────

export default function GreatHall({ state }) {
  const [currentView, setCurrentView] = useState("throne");
  const [ambientIndex, setAmbientIndex] = useState(0);
  const [ambientVisible, setAmbientVisible] = useState(true);

  // Stable greeting per tab visit (doesn't re-randomize on re-render)
  const [edmundLine] = useState(
    () => EDMUND_GREETINGS[Math.floor(Math.random() * EDMUND_GREETINGS.length)]
  );

  const meters = state.greatHall?.meters || DEFAULT_METERS;
  const reputation = state.greatHall?.reputation || "Unknown Lord";

  // Cycle ambient text every 8 seconds with a fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbientVisible(false);
      const fadeTimer = setTimeout(() => {
        setAmbientIndex((prev) => (prev + 1) % AMBIENT_TEXTS.length);
        setAmbientVisible(true);
      }, 500);
      return () => clearTimeout(fadeTimer);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="hall-wall"
      style={{
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid #3d3630",
        boxShadow: "inset 0 0 80px rgba(0,0,0,0.25)",
      }}
    >
      {/* ═══ HEADER ═══ */}
      <div
        style={{
          textAlign: "center",
          padding: "16px 16px 12px",
          borderBottom: "1px solid #3d3630",
          background:
            "linear-gradient(180deg, rgba(26,23,20,0.95) 0%, rgba(42,37,32,0.8) 100%)",
        }}
      >
        <div className="flex items-center justify-center gap-4">
          <Torch />
          <div>
            <h2
              style={{
                fontFamily: "Cinzel Decorative, Cinzel, serif",
                fontSize: "1.3rem",
                color: "#d4a44c",
                letterSpacing: "3px",
                textTransform: "uppercase",
                margin: 0,
                lineHeight: 1.2,
                textShadow: "0 0 20px rgba(212,164,76,0.3)",
              }}
            >
              The Great Hall
            </h2>
            <p
              style={{
                fontFamily: "Cinzel, serif",
                fontSize: "0.7rem",
                color: "#a89070",
                letterSpacing: "2px",
                marginTop: 4,
                margin: "4px 0 0",
              }}
            >
              {reputation} &mdash;{" "}
              {state.season
                ? state.season.charAt(0).toUpperCase() + state.season.slice(1)
                : "Spring"}
              , Year {state.year || 1}
            </p>
          </div>
          <Torch />
        </div>
      </div>

      {/* ═══ METER BAR ═══ */}
      <div
        className="flex flex-wrap gap-3"
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid #2a2520",
          backgroundColor: "rgba(26,23,20,0.6)",
        }}
      >
        {METER_CONFIG.map((m) => (
          <MeterBar key={m.key} label={m.label} value={meters[m.key]} color={m.color} />
        ))}
      </div>

      {/* ═══ CONTENT AREA (with decorative columns) ═══ */}
      <div className="flex" style={{ minHeight: 360 }}>
        {/* Left stone column with torch (desktop) */}
        <div
          className="hidden md:flex flex-col items-center"
          style={{
            width: 48,
            paddingTop: 24,
            background: "linear-gradient(90deg, #1a1714 0%, #2a2520 100%)",
            borderRight: "2px solid #3d3630",
          }}
        >
          <Torch />
        </div>

        {/* Main content */}
        <div className="flex-1" style={{ padding: 16 }}>
          {currentView === "throne" && <ThroneRoom edmundLine={edmundLine} />}
          {currentView !== "throne" && (
            <PlaceholderView
              viewId={currentView}
              onBack={() => setCurrentView("throne")}
            />
          )}
        </div>

        {/* Right stone column with torch (desktop) */}
        <div
          className="hidden md:flex flex-col items-center"
          style={{
            width: 48,
            paddingTop: 24,
            background: "linear-gradient(270deg, #1a1714 0%, #2a2520 100%)",
            borderLeft: "2px solid #3d3630",
          }}
        >
          <Torch />
        </div>
      </div>

      {/* ═══ HALL NAVIGATION ═══ */}
      <div
        className="flex overflow-x-auto"
        style={{
          borderTop: "1px solid #3d3630",
          backgroundColor: "rgba(26,23,20,0.8)",
        }}
      >
        {HALL_VIEWS.map((view) => {
          const isActive = currentView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className="flex-1 min-w-0 px-2"
              style={{
                paddingTop: 8,
                paddingBottom: 8,
                textAlign: "center",
                backgroundColor: isActive ? "#2a2520" : "transparent",
                borderTop: isActive
                  ? "2px solid #d4a44c"
                  : "2px solid transparent",
                color: isActive ? "#d4a44c" : "#6a5a42",
                fontFamily: "Cinzel, serif",
                fontSize: "0.7rem",
                letterSpacing: "1px",
                cursor: "pointer",
                transition: "all 200ms ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#2a2520";
                  e.currentTarget.style.color = "#c8b090";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#6a5a42";
                }
              }}
            >
              <view.Icon size={15} className="inline-block" />
              <span className="block text-xs" style={{ marginTop: 2 }}>
                {view.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ═══ AMBIENT FOOTER ═══ */}
      <div
        style={{
          padding: "8px 16px",
          borderTop: "1px solid #2a2520",
          backgroundColor: "rgba(15,13,10,0.8)",
        }}
      >
        <p
          style={{
            fontFamily: "Crimson Text, serif",
            fontStyle: "italic",
            fontSize: "0.85rem",
            color: "#6a5a42",
            textAlign: "center",
            margin: 0,
            opacity: ambientVisible ? 1 : 0,
            transition: "opacity 500ms ease",
          }}
        >
          &#9656; {AMBIENT_TEXTS[ambientIndex]}
        </p>
      </div>
    </div>
  );
}
