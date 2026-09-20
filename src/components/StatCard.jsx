import React from "react";

const accentMap = {
  yellow: "text-cab",
  green: "text-meter",
  red: "text-alert",
  ink: "text-ink",
};

export default function StatCard({ label, value, sub, accent = "ink" }) {
  return (
    <div className="panel rounded px-5 py-4 flex flex-col gap-1.5">
      <span className="text-[11px] text-inkMuted uppercase tracking-wide">
        {label}
      </span>
      <span className={`meter-digits text-3xl font-semibold ${accentMap[accent]}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-inkMuted">{sub}</span>}
    </div>
  );
}
