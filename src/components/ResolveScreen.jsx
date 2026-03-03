export default function ResolveScreen({ label, onContinue, buttonText }) {
  return (
    <div className="w-full max-w-xl mx-auto text-center mt-4">
      <button
        onClick={onContinue}
        className="px-8 py-3 rounded-md border-2 font-heading font-semibold text-base uppercase tracking-wider cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
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
        {buttonText || "Continue"}
      </button>
    </div>
  );
}
