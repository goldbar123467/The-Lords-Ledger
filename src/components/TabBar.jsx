/**
 * TabBar.jsx
 *
 * Horizontal tab navigation styled as medieval ledger tabs.
 * Tabs unlock progressively based on turn number.
 */

const TAB_CONFIG = [
  { id: "estate",    label: "Estate",    icon: "\u{1F3F0}", unlockTurn: 1 },
  { id: "trade",     label: "Trade",     icon: "\u2696\uFE0F",  unlockTurn: 3 },
  { id: "military",  label: "Military",  icon: "\u2694\uFE0F",  unlockTurn: 5 },
  { id: "people",    label: "People",    icon: "\u{1F465}", unlockTurn: 1 },
  { id: "chronicle", label: "Chronicle", icon: "\u{1F4DC}", unlockTurn: 1 },
];

export default function TabBar({ activeTab, onSetTab, turn, disabled }) {
  return (
    <div
      className="w-full flex overflow-x-auto border-b-2"
      style={{
        backgroundColor: "#e8d5a3",
        borderColor: "#c4a45a",
      }}
    >
      {TAB_CONFIG.map((tab) => {
        const unlocked = turn >= tab.unlockTurn;
        const isActive = activeTab === tab.id;
        const isDisabled = !unlocked || disabled;

        if (!unlocked) {
          return (
            <button
              key={tab.id}
              disabled
              className="flex-1 min-w-0 px-2 py-3 text-center opacity-40 cursor-not-allowed"
              style={{ color: "#8b6914" }}
              aria-label={`${tab.label} tab (locked)`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="hidden sm:inline text-sm font-heading font-semibold uppercase tracking-wide ml-1">
                {tab.label}
              </span>
              <span className="sm:hidden text-xs font-heading font-semibold uppercase tracking-wide block">
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => !isDisabled && onSetTab(tab.id)}
            disabled={isDisabled}
            className={`flex-1 min-w-0 px-2 py-3 text-center transition-all duration-200 border-b-3 ${
              isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
            style={{
              backgroundColor: isActive ? "#f4e4c1" : "transparent",
              borderColor: isActive ? "#8b6914" : "transparent",
              borderBottomColor: isActive ? "#f4e4c1" : "transparent",
              color: isActive ? "#2c1810" : "#5a3a28",
              fontWeight: isActive ? "700" : "600",
            }}
            aria-label={`${tab.label} tab${isActive ? " (active)" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="hidden sm:inline text-sm font-heading font-semibold uppercase tracking-wide ml-1">
              {tab.label}
            </span>
            <span className="sm:hidden text-xs font-heading font-semibold uppercase tracking-wide block">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
