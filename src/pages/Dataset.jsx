import { useEffect } from "react";
import { useML } from "../context/MLContext";
import StatCard from "../components/StatCard";

const PREVIEW_ROWS = 25;

export default function Dataset() {
  const { dataset, rawRowCount, isDatasetLoading, datasetError, loadDataset } = useML();

  useEffect(() => {
    if (!dataset.length && !isDatasetLoading) {
      loadDataset();
    }
  }, [dataset.length, isDatasetLoading, loadDataset]);

  const droppedCount = Math.max(rawRowCount - dataset.length, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Raw rows" value={rawRowCount.toLocaleString()} />
        <StatCard label="Clean rows" value={dataset.length.toLocaleString()} accent="meter" />
        <StatCard label="Dropped rows" value={droppedCount.toLocaleString()} accent="alert" />
      </div>

      <div className="rounded-lg border border-edge bg-panel p-5">
        <h2 className="font-display font-semibold text-ink mb-1">
          Cleaning rules
        </h2>
        <p className="text-sm text-inkMuted mb-4">
          Rows with missing values, non-positive or unrealistic fares (&le; $0 or
          &gt; $300), passenger counts outside 1-8, or coordinates well outside the
          NYC area are excluded.
        </p>

        {isDatasetLoading && <p className="text-inkMuted text-sm">Loading dataset…</p>}
        {datasetError && <p className="text-alert text-sm">{datasetError}</p>}

        {!isDatasetLoading && dataset.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-inkMuted text-left border-b border-edge">
                  <th className="py-2 pr-4">Pickup</th>
                  <th className="py-2 pr-4">Dropoff</th>
                  <th className="py-2 pr-4">Passengers</th>
                  <th className="py-2 pr-4">Distance (km)</th>
                  <th className="py-2 pr-4">Fare</th>
                </tr>
              </thead>
              <tbody>
                {dataset.slice(0, PREVIEW_ROWS).map((row, i) => (
                  <tr key={i} className="border-b border-edge/50 text-ink">
                    <td className="py-2 pr-4">
                      {row.pickup_latitude.toFixed(4)}, {row.pickup_longitude.toFixed(4)}
                    </td>
                    <td className="py-2 pr-4">
                      {row.dropoff_latitude.toFixed(4)}, {row.dropoff_longitude.toFixed(4)}
                    </td>
                    <td className="py-2 pr-4">{row.passenger_count}</td>
                    <td className="py-2 pr-4">{row.trip_distance.toFixed(2)}</td>
                    <td className="py-2 pr-4 text-cab">${row.fare_amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-inkMuted">
              Showing {Math.min(PREVIEW_ROWS, dataset.length)} of {dataset.length.toLocaleString()} rows.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
