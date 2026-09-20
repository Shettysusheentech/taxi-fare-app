import { useLocation } from "react-router-dom";
import { useML } from "../context/MLContext";

const TITLES = {
  "/": "Dashboard",
  "/dataset": "Dataset",
  "/prediction": "Prediction",
  "/performance": "Model Performance",
};

export default function Navbar() {
  const location = useLocation();
  const { isTrained, isTraining } = useML();
  const title = TITLES[location.pathname] ?? "FareMeter";

  return (
    <header className="h-16 shrink-0 border-b border-edge bg-panel flex items-center justify-between px-6">
      <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
      <div className="flex items-center gap-2 text-sm font-mono">
        <span
          className={`h-2 w-2 rounded-full ${
            isTraining ? "bg-cab animate-pulse" : isTrained ? "bg-meter" : "bg-alert"
          }`}
        />
        <span className="text-inkMuted">
          {isTraining ? "Training…" : isTrained ? "Model trained" : "Model not trained"}
        </span>
      </div>
    </header>
  );
}
