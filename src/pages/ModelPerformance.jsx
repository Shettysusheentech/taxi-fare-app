import {
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useML } from "../context/MLContext";
import StatCard from "../components/StatCard";

export default function ModelPerformance() {
  const { isTrained, metrics } = useML();

  if (!isTrained || !metrics) {
    return (
      <div className="rounded-lg border border-cabDim bg-panel p-4 text-sm text-cab">
        Train the model on the Dashboard first to see performance metrics.
      </div>
    );
  }

  const { mae, rmse, r2, points } = metrics;
  const maxValue = Math.max(...points.map((p) => Math.max(p.actual, p.predicted))) * 1.05;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="MAE" value={`$${mae.toFixed(2)}`} sublabel="Avg. dollar error" />
        <StatCard label="RMSE" value={`$${rmse.toFixed(2)}`} sublabel="Penalizes large misses" />
        <StatCard label="R² score" value={r2.toFixed(3)} accent="meter" sublabel="1.0 is perfect" />
      </div>

      <div className="rounded-lg border border-edge bg-panel p-5">
        <h2 className="font-display font-semibold text-ink mb-4">
          Actual vs. predicted fare (test set)
        </h2>
        <ResponsiveContainer width="100%" height={360}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#33333A" />
            <XAxis
              type="number"
              dataKey="actual"
              name="Actual fare"
              unit="$"
              domain={[0, maxValue]}
              stroke="#9B9AA3"
              fontSize={12}
            />
            <YAxis
              type="number"
              dataKey="predicted"
              name="Predicted fare"
              unit="$"
              domain={[0, maxValue]}
              stroke="#9B9AA3"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{ background: "#1C1C21", border: "1px solid #33333A" }}
              labelStyle={{ color: "#F2F1ED" }}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Legend wrapperStyle={{ color: "#9B9AA3", fontSize: 12 }} />
            <ReferenceLine
              segment={[
                { x: 0, y: 0 },
                { x: maxValue, y: maxValue },
              ]}
              stroke="#9B9AA3"
              strokeDasharray="4 4"
              label={{ value: "Perfect prediction", fill: "#9B9AA3", fontSize: 11 }}
            />
            <Scatter name="Test trips" data={points} fill="#F5B400" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
