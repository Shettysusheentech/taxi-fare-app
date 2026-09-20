import { Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Dataset from "./pages/Dataset";
import Prediction from "./pages/Prediction";
import ModelPerformance from "./pages/ModelPerformance";
import { MLProvider } from "./context/MLContext";

export default function App() {
  return (
    <MLProvider>
      <div className="flex h-screen bg-base text-ink font-display">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dataset" element={<Dataset />} />
              <Route path="/prediction" element={<Prediction />} />
              <Route path="/performance" element={<ModelPerformance />} />
            </Routes>
          </main>
        </div>
      </div>
    </MLProvider>
  );
}
