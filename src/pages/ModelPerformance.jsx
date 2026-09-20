import React from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ComposedChart,
} from "recharts";
import { useML } from "../context/MLContext.jsx";
import StatCard from "../components/StatCard.jsx";

export default function ModelPerformance() {
  const { isTrained, trained } = useML();

  if (!isTrained) {
    return (
      <div className="panel rounded p-8 text-center">
        <p className="font-display font-medium mb-2">No model trained yet</p>
        <p className="text-sm text-inkMuted mb-5">
          Train the linear regression model on the Dashboard to see its performance here.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-cab text-base font-semibold rounded text-sm hover:bg-cab/90 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const { metrics, actualVsPredicted } = trained;

  const minVal = Math.min(...actualVsPredicted.map((d) => Math.min(d.actual, d.predicted)));
  const maxVal = Math.max(...actualVsPredicted.map((d) => Math.max(d.actual, d.predicted)));
  const referenceLine = [
    { actual: minVal, predicted: minVal },
    { actual: maxVal, predicted: maxVal },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="MAE" value={`$${metrics.mae.toFixed(2)}`} sub="Mean Absolute Error" accent="yellow" />
        <StatCard label="RMSE" value={`$${metrics.rmse.toFixed(2)}`} sub="Root Mean Squared Error" accent="yellow" />
        <StatCard label="R² Score" value={metrics.r2.toFixed(3)} sub={`on ${metrics.testSize} test trips`} accent="green" />
      </div>

      <div className="panel rounded p-5">
        <h3 className="font-display font-medium text-sm mb-1">Actual Fare vs Predicted Fare</h3>
        <p className="text-xs text-inkMuted mb-3">
          Every point is one test-set trip. Points closer to the diagonal line are more accurate
          predictions.
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart margin={{ top: 8, right: 16, left: -8, bottom: 8 }}>
            <CartesianGrid stroke="#33333A" strokeDasharray="2 4" />
            <XAxis
              type="number"
              dataKey="actual"
              name="Actual ($)"
              tick={{ fontSize: 11, fill: "#9B9AA3" }}
              tickLine={false}
              axisLine={{ stroke: "#33333A" }}
              label={{ value: "Actual Fare ($)", position: "insideBottom", offset: -4, fontSize: 11, fill: "#9B9AA3" }}
            />
            <YAxis
              type="number"
              dataKey="predicted"
              name="Predicted ($)"
              tick={{ fontSize: 11, fill: "#9B9AA3" }}
              tickLine={false}
              axisLine={false}
              label={{ value: "Predicted Fare ($)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#9B9AA3" }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{ background: "#1C1C21", border: "1px solid #33333A", fontSize: 12 }}
              labelStyle={{ color: "#F2F1ED" }}
            />
            <Scatter data={actualVsPredicted} fill="#F5B400" fillOpacity={0.55} />
            <Line
              data={referenceLine}
              dataKey="predicted"
              stroke="#34D399"
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
              legendType="none"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
