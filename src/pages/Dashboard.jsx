import { useEffect, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useML } from "../context/MLContext";
import StatCard from "../components/StatCard";
import { buildHistogram, mean } from "../utils/stats";

export default function Dashboard() {
  const {
    dataset,
    isDatasetLoading,
    datasetError,
    loadDataset,
    train,
    isTraining,
    trainingProgress,
    isTrained,
    metrics,
  } = useML();

  useEffect(() => {
    if (!dataset.length && !isDatasetLoading) {
      loadDataset();
    }
  }, [dataset.length, isDatasetLoading, loadDataset]);

  const histogram = useMemo(
    () => buildHistogram(dataset.map((r) => r.fare_amount)),
    [dataset]
  );

  const avgFare = dataset.length ? mean(dataset.map((r) => r.fare_amount)) : 0;
  const avgDistance = dataset.length ? mean(dataset.map((r) => r.trip_distance)) : 0;
  const avgPassengers = dataset.length ? mean(dataset.map((r) => r.passenger_count)) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Trips loaded" value={dataset.length.toLocaleString()} />
        <StatCard label="Avg fare" value={`$${avgFare.toFixed(2)}`} accent="meter" />
        <StatCard label="Avg distance" value={`${avgDistance.toFixed(2)} km`} />
        <StatCard label="Avg passengers" value={avgPassengers.toFixed(1)} />
      </div>

      <div className="rounded-lg border border-edge bg-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-ink">Fare distribution</h2>
        </div>
        {isDatasetLoading && <p className="text-inkMuted text-sm">Loading dataset…</p>}
        {datasetError && <p className="text-alert text-sm">{datasetError}</p>}
        {!isDatasetLoading && histogram.length > 0 && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={histogram}>
              <CartesianGrid strokeDasharray="3 3" stroke="#33333A" />
              <XAxis dataKey="label" stroke="#9B9AA3" fontSize={12} />
              <YAxis stroke="#9B9AA3" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#1C1C21", border: "1px solid #33333A" }}
                labelStyle={{ color: "#F2F1ED" }}
              />
              <Bar dataKey="count" fill="#F5B400" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-lg border border-edge bg-panel p-5">
        <h2 className="font-display font-semibold text-ink mb-3">Model training</h2>
        <p className="text-sm text-inkMuted mb-4">
          Trains a linear regression model on 80% of the dataset, evaluates it on
          the held-out 20%, and reports MAE, RMSE, and R² from real predictions.
        </p>
        <button
          onClick={train}
          disabled={!dataset.length || isTraining}
          className="rounded-md bg-cab px-4 py-2 font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition"
        >
          {isTraining ? `Training… ${trainingProgress}%` : "Train Model"}
        </button>
        {isTrained && metrics && (
          <p className="mt-4 text-sm text-meter">
            Trained — test MAE ${metrics.mae.toFixed(2)}, R² {metrics.r2.toFixed(3)}.
            See Model Performance for details.
          </p>
        )}
      </div>
    </div>
  );
}
