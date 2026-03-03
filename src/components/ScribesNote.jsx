export default function ScribesNote({ text, onDismiss }) {
  if (!text) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        className="w-full max-w-md rounded-lg border-2 p-5 shadow-2xl"
        style={{
          backgroundColor: "#fdf6e3",
          borderColor: "#8b6914",
          boxShadow: "0 8px 32px rgba(44, 24, 16, 0.3)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{"\u{1F4DC}"}</span>
          <h4
            className="font-heading text-lg font-bold"
            style={{ color: "#8b6914" }}
          >
            Scribe's Note
          </h4>
        </div>
        <p className="text-base leading-relaxed mb-4" style={{ color: "#3d2517" }}>
          {text}
        </p>
        <button
          onClick={onDismiss}
          className="w-full py-2 rounded-md border-2 font-heading font-semibold text-sm uppercase tracking-wider cursor-pointer transition-colors duration-200"
          style={{
            backgroundColor: "#e8d5a3",
            borderColor: "#8b6914",
            color: "#5a3a28",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#d4c090";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#e8d5a3";
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
