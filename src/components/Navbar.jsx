import React from "react";
import { useLocation } from "react-router-dom";

const titles = {
  "/": "Dashboard",
  "/dataset": "Dataset",
  "/predict": "Prediction",
  "/performance": "Model Performance",
};

export default function Navbar({ onMenuClick, isTrained }) {
  const location = useLocation();
  const title = titles[location.pathname] || "FareMeter";

  return (
    <header className="sticky top-0 z-20 bg-base/95 backdrop-blur border-b border-edge">
      <div className="flex items-center justify-between px-5 md:px-8 h-16">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-inkMuted border border-edge rounded px-2.5 py-1.5"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <h1 className="font-display font-semibold text-lg">{title}</h1>
        </div>

        <div className="flex items-center gap-2 meter-digits text-xs">
          <span
            className={`w-2 h-2 rounded-full ${isTrained ? "bg-meter" : "bg-inkMuted"}`}
          />
          <span className="text-inkMuted">
            {isTrained ? "MODEL TRAINED" : "MODEL NOT TRAINED"}
          </span>
        </div>
      </div>
    </header>
  );
}
