import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { MLProvider, useML } from "./context/MLContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Dataset from "./pages/Dataset.jsx";
import Prediction from "./pages/Prediction.jsx";
import ModelPerformance from "./pages/ModelPerformance.jsx";

function Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isTrained } = useML();

  return (
    <div className="min-h-screen flex bg-base text-ink">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenuClick={() => setMenuOpen((o) => !o)} isTrained={isTrained} />
        <main className="flex-1 px-5 md:px-8 py-6 max-w-6xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dataset" element={<Dataset />} />
            <Route path="/predict" element={<Prediction />} />
            <Route path="/performance" element={<ModelPerformance />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <MLProvider>
      <Shell />
    </MLProvider>
  );
}
