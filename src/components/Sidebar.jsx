import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/dataset", label: "Dataset" },
  { to: "/prediction", label: "Prediction" },
  { to: "/performance", label: "Model Performance" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-edge bg-panel flex flex-col">
      <div className="px-5 py-6 flex items-center gap-2">
        <span className="text-2xl">🚕</span>
        <span className="font-display font-semibold text-ink text-lg">FareMeter</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-raised text-cab"
                  : "text-inkMuted hover:bg-raised hover:text-ink"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 text-xs text-inkMuted font-mono">
        Client-side ML demo
      </div>
    </aside>
  );
}
