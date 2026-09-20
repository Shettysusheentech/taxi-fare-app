import { useMemo, useState } from "react";
import { useML } from "../context/MLContext";
import { predictFare } from "../ml/prediction";
import { haversineDistance } from "../utils/distance";
import { generatePdfReport } from "../utils/pdfReport";
import StatCard from "../components/StatCard";

const DEFAULT_FORM = {
  pickupLat: "40.7580",
  pickupLon: "-73.9855",
  dropoffLat: "40.6892",
  dropoffLon: "-74.0445",
  passengerCount: "1",
};

export default function Prediction() {
  const { model, stats, isTrained, dataset, metrics, lastPrediction, setLastPrediction } =
    useML();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);

  const liveDistance = useMemo(() => {
    const { pickupLat, pickupLon, dropoffLat, dropoffLon } = form;
    if (![pickupLat, pickupLon, dropoffLat, dropoffLon].every((v) => v !== "" && !Number.isNaN(Number(v)))) {
      return null;
    }
    return haversineDistance(
      Number(pickupLat),
      Number(pickupLon),
      Number(dropoffLat),
      Number(dropoffLon)
    );
  }, [form]);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isTrained) return;

    const input = {
      pickupLat: Number(form.pickupLat),
      pickupLon: Number(form.pickupLon),
      dropoffLat: Number(form.dropoffLat),
      dropoffLon: Number(form.dropoffLon),
      passengerCount: Number(form.passengerCount),
    };

    const { predictedFare, distanceKm } = predictFare(model, stats, input);
    setResult(predictedFare);
    setLastPrediction({
      pickupLat: input.pickupLat,
      pickupLon: input.pickupLon,
      dropoffLat: input.dropoffLat,
      dropoffLon: input.dropoffLon,
      passengerCount: input.passengerCount,
      distanceKm,
      predictedFare,
    });
  }

  function handleDownloadPdf() {
    generatePdfReport({
      datasetSize: dataset.length,
      metrics,
      lastPrediction,
    });
  }

  return (
    <div className="space-y-6">
      {!isTrained && (
        <div className="rounded-lg border border-cabDim bg-panel p-4 text-sm text-cab">
          Train the model on the Dashboard first to enable predictions.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 rounded-lg border border-edge bg-panel p-5 md:grid-cols-2"
      >
        <Field label="Pickup latitude" value={form.pickupLat} onChange={handleChange("pickupLat")} />
        <Field label="Pickup longitude" value={form.pickupLon} onChange={handleChange("pickupLon")} />
        <Field label="Dropoff latitude" value={form.dropoffLat} onChange={handleChange("dropoffLat")} />
        <Field label="Dropoff longitude" value={form.dropoffLon} onChange={handleChange("dropoffLon")} />
        <Field
          label="Passenger count"
          value={form.passengerCount}
          onChange={handleChange("passengerCount")}
          type="number"
          min="1"
          max="8"
        />
        <div className="flex flex-col justify-end">
          <span className="text-xs font-mono uppercase tracking-wide text-inkMuted mb-1">
            Trip distance
          </span>
          <span className="text-lg font-mono text-ink">
            {liveDistance !== null ? `${liveDistance.toFixed(2)} km` : "—"}
          </span>
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={!isTrained}
            className="rounded-md bg-cab px-4 py-2 font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition"
          >
            Predict Fare
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={!lastPrediction}
            className="rounded-md border border-edge px-4 py-2 font-medium text-ink disabled:opacity-50 disabled:cursor-not-allowed hover:bg-raised transition"
          >
            Download PDF report
          </button>
        </div>
      </form>

      {result !== null && (
        <StatCard label="Predicted fare" value={`$${result.toFixed(2)}`} accent="meter" />
      )}
    </div>
  );
}

function Field({ label, type = "number", ...inputProps }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-mono uppercase tracking-wide text-inkMuted">
        {label}
      </span>
      <input
        {...inputProps}
        type={type}
        step="any"
        className="rounded-md border border-edge bg-raised px-3 py-2 text-ink font-mono focus:outline-none focus:ring-1 focus:ring-cab"
      />
    </label>
  );
}
