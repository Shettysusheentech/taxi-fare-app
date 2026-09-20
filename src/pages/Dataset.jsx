import React from "react";
import { useML } from "../context/MLContext.jsx";
import StatCard from "../components/StatCard.jsx";

const COLUMNS = [
  "pickup_latitude",
  "pickup_longitude",
  "dropoff_latitude",
  "dropoff_longitude",
  "passenger_count",
  "fare_amount",
  "trip_distance",
];

export default function Dataset() {
  const { rows, rawRows, cleaningStats, loading, loadError } = useML();

  if (loading) return <p className="text-inkMuted text-sm">Loading dataset...</p>;
  if (loadError) return <p className="text-alert text-sm">Couldn't load the dataset: {loadError}</p>;

  const preview = rows.slice(0, 50);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Records (raw file)" value={rawRows.length.toLocaleString()} />
        <StatCard label="Records (after cleaning)" value={rows.length.toLocaleString()} accent="green" />
        <StatCard label="Columns" value={COLUMNS.length} />
        <StatCard
          label="Rows dropped"
          value={cleaningStats ? cleaningStats.droppedMissing + cleaningStats.droppedInvalid : 0}
          sub={
            cleaningStats
              ? `${cleaningStats.droppedMissing} missing, ${cleaningStats.droppedInvalid} out of range`
              : ""
          }
          accent="yellow"
        />
      </div>

      <div className="panel rounded p-5">
        <h3 className="font-display font-medium text-sm mb-1">First 50 rows</h3>
        <p className="text-xs text-inkMuted mb-3">
          Showing cleaned data, including the computed{" "}
          <code className="meter-digits">trip_distance</code> column (km, via the Haversine
          formula).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse meter-digits">
            <thead>
              <tr className="border-b border-edge">
                {COLUMNS.map((c) => (
                  <th key={c} className="text-left px-3 py-2 text-[11px] text-inkMuted uppercase tracking-wide whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-b border-edge/60 hover:bg-raised/50">
                  {COLUMNS.map((c) => (
                    <td key={c} className="px-3 py-2 whitespace-nowrap">
                      {typeof row[c] === "number" ? row[c].toFixed(c === "passenger_count" ? 0 : 3) : row[c]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
