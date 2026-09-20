export default function StatCard({ label, value, sublabel, accent = "cab" }) {
  const accentClass = {
    cab: "text-cab",
    meter: "text-meter",
    alert: "text-alert",
    ink: "text-ink",
  }[accent];

  return (
    <div className="rounded-lg border border-edge bg-panel px-5 py-4">
      <div className="text-xs font-mono uppercase tracking-wide text-inkMuted">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-display font-semibold ${accentClass}`}>
        {value}
      </div>
      {sublabel && <div className="mt-1 text-xs text-inkMuted">{sublabel}</div>}
    </div>
  );
}
