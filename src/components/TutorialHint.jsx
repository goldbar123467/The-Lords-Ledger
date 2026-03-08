/**
 * TutorialHint.jsx
 *
 * Contextual hint banners shown during the first few turns to guide new players.
 * Disappears automatically after the relevant turn passes.
 */

const HINTS = {
  estate: [
    { maxTurn: 2, text: "Start by building a Strip Farm or Pasture — they produce food to keep your people alive. Check the \"Boosts\" line to see which meters each building helps." },
    { maxTurn: 4, text: "Watch your Net income at the top. If it's negative, you're losing money each season. Build wisely!" },
  ],
  trade: [
    { maxTurn: 4, text: "Sell extra resources for denarii, or buy goods you need. Prices change each season — look for good deals." },
    { maxTurn: 6, text: "Salt, Tools, and Spices are special — each one boosts a meter for one season, then gets used up. Stock up!" },
  ],
  military: [
    { maxTurn: 6, text: "Recruit soldiers to raise your Military meter. Upgrade your castle and install defenses for permanent boosts." },
    { maxTurn: 8, text: "Soldiers cost upkeep each season and eat food. Don't recruit more than you can afford to feed!" },
  ],
  people: [
    { maxTurn: 2, text: "Set your tax rate here. Higher taxes bring more gold in autumn, but your people won't be happy about it." },
    { maxTurn: 6, text: "Donate to the Church to boost your Faith meter. The bigger the donation, the bigger the boost when the season resolves." },
  ],
  chronicle: [
    { maxTurn: 2, text: "This is the history of your reign. Every action, event, and season is recorded here." },
  ],
};

export default function TutorialHint({ tab, turn }) {
  const tabHints = HINTS[tab];
  if (!tabHints) return null;

  const activeHint = tabHints.find((h) => turn <= h.maxTurn);
  if (!activeHint) return null;

  return (
    <div
      className="rounded-md border-2 p-3 mb-4 text-sm"
      style={{
        backgroundColor: "#fff8e1",
        borderColor: "#b8860b",
        color: "#5a3a28",
      }}
    >
      <span className="font-heading font-bold uppercase text-xs tracking-wider mr-1.5" style={{ color: "#b8860b" }}>
        {"\u{1F4A1}"} Tip:
      </span>
      {activeHint.text}
    </div>
  );
}
