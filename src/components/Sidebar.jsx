import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/dataset", label: "Dataset" },
  { to: "/predict", label: "Prediction" },
  { to: "/performance", label: "Model Performance" },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-panel border-r border-edge flex flex-col z-40 transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-6 border-b border-edge">
          <div className="flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="2" y="10" width="22" height="9" rx="2" fill="#F5B400" />
              <rect x="5" y="6" width="16" height="6" rx="1.5" fill="#F5B400" />
              <circle cx="7.5" cy="20" r="2.3" fill="#1C1C21" stroke="#F5B400" strokeWidth="1.3" />
              <circle cx="18.5" cy="20" r="2.3" fill="#1C1C21" stroke="#F5B400" strokeWidth="1.3" />
            </svg>
            <span className="font-display font-semibold text-lg tracking-tight">
              FareMeter
            </span>
          </div>
          <p className="text-[11px] text-inkMuted mt-1 meter-digits">
            NYC TAXI FARE PREDICTOR
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cab text-base"
                    : "text-inkMuted hover:text-ink hover:bg-raised"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-edge text-[11px] text-inkMuted leading-relaxed">
          Linear Regression trained in your browser with TensorFlow.js. No
          server, no login.
        </div>
      </aside>
    </>
  );
}
