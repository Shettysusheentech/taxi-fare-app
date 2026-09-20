import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
} from "recharts";
import { useML } from "../context/MLContext.jsx";
import StatCard from "../components/StatCard.jsx";
import { histogramBuckets, mean } from "../utils/stats.js";

export default function Dashboard() {
  const { rows, loading, loadError, isTraining, trainProgress, trained, train, isTrained } =
    useML();

  const fareValues = useMemo(() => rows.map((r) => r.fare_amount), [rows]);
  const distanceValues = useMemo(() => rows.map((r) => r.trip_distance), [rows]);

  const fareHistogram = useMemo(() => histogramBuckets(fareValues, 12), [fareValues]);
  const distanceVsFare = useMemo(
    () => rows.map((r) => ({ distance: Number(r.trip_distance.toFixed(2)), fare: r.fare_amount })),
    [rows]
  );

  const avgFare = fareValues.length ? mean(fareValues) : 0;
  const avgDistance = distanceValues.length ? mean(distanceValues) : 0;

  if (loading) {
    return <p className="text-inkMuted text-sm">Loading dataset...</p>;
  }

  if (loadError) {
    return (
      <p className="text-alert text-sm">
        Couldn't load the dataset: {loadError}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Records" value={rows.length.toLocaleString()} />
        <StatCard label="Average Fare" value={`$${avgFare.toFixed(2)}`} accent="yellow" />
        <StatCard label="Average Distance" value={`${avgDistance.toFixed(2)} km`} accent="yellow" />
        <StatCard
          label="R² Score"
          value={trained ? trained.metrics.r2.toFixed(3) : "—"}
          sub={trained ? "on test set" : "train the model to see this"}
          accent={trained ? "green" : "ink"}
        />
      </div>

      <div className="panel rounded p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-display font-medium text-sm">Train the model</p>
          <p className="text-xs text-inkMuted mt-1">
            Fits a linear regression on {rows.length.toLocaleString()} trips, right here in your
            browser (TensorFlow.js). Takes a few seconds.
          </p>
        </div>
        <button
          onClick={train}
          disabled={isTraining || rows.length === 0}
          className="px-5 py-2.5 bg-cab text-base font-semibold rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cab/90 transition-colors whitespace-nowrap"
        >
          {isTraining
            ? `Training... ${Math.round(trainProgress * 100)}%`
            : isTrained
            ? "Retrain Model"
            : "Train Model"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="panel rounded p-5">
          <h3 className="font-display font-medium text-sm mb-1">Fare Distribution</h3>
          <p className="text-xs text-inkMuted mb-3">How trip fares are spread across the dataset</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={fareHistogram} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#33333A" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9B9AA3" }} tickLine={false} axisLine={{ stroke: "#33333A" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9B9AA3" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#1C1C21", border: "1px solid #33333A", fontSize: 12 }}
                labelStyle={{ color: "#F2F1ED" }}
              />
              <Bar dataKey="count" fill="#F5B400" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel rounded p-5">
          <h3 className="font-display font-medium text-sm mb-1">Distance vs Fare</h3>
          <p className="text-xs text-inkMuted mb-3">Each point is one trip</p>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#33333A" strokeDasharray="2 4" />
              <XAxis
                type="number"
                dataKey="distance"
                name="Distance (km)"
                tick={{ fontSize: 11, fill: "#9B9AA3" }}
                tickLine={false}
                axisLine={{ stroke: "#33333A" }}
              />
              <YAxis
                type="number"
                dataKey="fare"
                name="Fare ($)"
                tick={{ fontSize: 11, fill: "#9B9AA3" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{ background: "#1C1C21", border: "1px solid #33333A", fontSize: 12 }}
                labelStyle={{ color: "#F2F1ED" }}
              />
              <Scatter data={distanceVsFare} fill="#34D399" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
