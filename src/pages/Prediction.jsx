import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useML } from "../context/MLContext.jsx";
import { haversineDistance } from "../utils/distance.js";
import { downloadReport } from "../utils/pdfReport.js";

const defaultForm = {
  pickupLat: "40.7614",
  pickupLon: "-73.9776",
  dropoffLat: "40.7527",
  dropoffLon: "-73.9772",
  passengerCount: "1",
};

export default function Prediction() {
  const { isTrained, trained, predict, rows, lastPrediction, setLastPrediction } = useML();
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setResult(null);
  };

  const distance = useMemo(() => {
    const { pickupLat, pickupLon, dropoffLat, dropoffLon } = form;
    const vals = [pickupLat, pickupLon, dropoffLat, dropoffLon].map(Number);
    if (vals.some((v) => Number.isNaN(v))) return null;
    return haversineDistance(vals[0], vals[1], vals[2], vals[3]);
  }, [form]);

  const handlePredict = () => {
    const pickupLat = Number(form.pickupLat);
    const pickupLon = Number(form.pickupLon);
    const dropoffLat = Number(form.dropoffLat);
    const dropoffLon = Number(form.dropoffLon);
    const passengerCount = Number(form.passengerCount);

    const values = { pickupLat, pickupLon, dropoffLat, dropoffLon, passengerCount };
    for (const [key, v] of Object.entries(values)) {
      if (Number.isNaN(v)) {
        setError(`Please enter a valid number for ${key}.`);
        return;
      }
    }
    if (passengerCount <= 0 || passengerCount > 8) {
      setError("Passenger count should be between 1 and 8.");
      return;
    }
    if (
      pickupLat < 40.4 || pickupLat > 41.1 || dropoffLat < 40.4 || dropoffLat > 41.1 ||
      pickupLon < -74.5 || pickupLon > -73.5 || dropoffLon < -74.5 || dropoffLon > -73.5
    ) {
      setError("Coordinates look outside the NYC area the model was trained on.");
      return;
    }

    setError("");
    const dist = haversineDistance(pickupLat, pickupLon, dropoffLat, dropoffLon);
    const featureVector = [pickupLat, pickupLon, dropoffLat, dropoffLon, passengerCount, dist];
    const fare = predict(featureVector);

    const prediction = {
      pickupLat,
      pickupLon,
      dropoffLat,
      dropoffLon,
      passengerCount,
      distance: dist,
      fare,
    };
    setResult(prediction);
    setLastPrediction(prediction);
  };

  if (!isTrained) {
    return (
      <div className="panel rounded p-8 text-center">
        <p className="font-display font-medium mb-2">The model hasn't been trained yet</p>
        <p className="text-sm text-inkMuted mb-5">
          Train the linear regression model on the Dashboard first, then come back here to make a
          prediction.
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

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="panel rounded p-5">
        <h3 className="font-display font-medium text-sm mb-4">Trip Details</h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-inkMuted">
              Pickup Latitude
              <input
                type="number"
                step="0.0001"
                value={form.pickupLat}
                onChange={update("pickupLat")}
                className="mt-1 w-full bg-raised border border-edge rounded px-3 py-2 text-sm meter-digits focus:outline-none focus:border-cab"
              />
            </label>
            <label className="text-xs text-inkMuted">
              Pickup Longitude
              <input
                type="number"
                step="0.0001"
                value={form.pickupLon}
                onChange={update("pickupLon")}
                className="mt-1 w-full bg-raised border border-edge rounded px-3 py-2 text-sm meter-digits focus:outline-none focus:border-cab"
              />
            </label>
            <label className="text-xs text-inkMuted">
              Dropoff Latitude
              <input
                type="number"
                step="0.0001"
                value={form.dropoffLat}
                onChange={update("dropoffLat")}
                className="mt-1 w-full bg-raised border border-edge rounded px-3 py-2 text-sm meter-digits focus:outline-none focus:border-cab"
              />
            </label>
            <label className="text-xs text-inkMuted">
              Dropoff Longitude
              <input
                type="number"
                step="0.0001"
                value={form.dropoffLon}
                onChange={update("dropoffLon")}
                className="mt-1 w-full bg-raised border border-edge rounded px-3 py-2 text-sm meter-digits focus:outline-none focus:border-cab"
              />
            </label>
          </div>

          <label className="text-xs text-inkMuted">
            Passenger Count
            <input
              type="number"
              min="1"
              max="8"
              value={form.passengerCount}
              onChange={update("passengerCount")}
              className="mt-1 w-full bg-raised border border-edge rounded px-3 py-2 text-sm meter-digits focus:outline-none focus:border-cab"
            />
          </label>

          <div className="flex items-center justify-between text-xs bg-raised rounded px-3 py-2">
            <span className="text-inkMuted">Calculated trip distance</span>
            <span className="meter-digits text-meter">
              {distance !== null ? `${distance.toFixed(2)} km` : "—"}
            </span>
          </div>

          {error && (
            <p className="text-xs text-alert bg-alert/10 border border-alert/30 rounded px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handlePredict}
            className="w-full py-2.5 bg-cab text-base font-semibold rounded text-sm hover:bg-cab/90 transition-colors"
          >
            Predict Fare
          </button>
        </div>
      </div>

      <div className="panel rounded p-5 flex flex-col">
        <h3 className="font-display font-medium text-sm mb-4">Result</h3>

        {!result ? (
          <div className="flex-1 flex items-center justify-center text-center py-10">
            <p className="text-sm text-inkMuted max-w-xs">
              Fill in the trip details and press Predict Fare.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs text-inkMuted uppercase tracking-wide">Estimated Fare</p>
              <p className="meter-digits text-5xl font-semibold text-cab mt-1">
                ${result.fare.toFixed(2)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-raised rounded px-3 py-2">
                <p className="text-[11px] text-inkMuted">Trip Distance</p>
                <p className="meter-digits">{result.distance.toFixed(2)} km</p>
              </div>
              <div className="bg-raised rounded px-3 py-2">
                <p className="text-[11px] text-inkMuted">Passenger Count</p>
                <p className="meter-digits">{result.passengerCount}</p>
              </div>
              <div className="bg-raised rounded px-3 py-2 col-span-2">
                <p className="text-[11px] text-inkMuted">Model Used</p>
                <p>Linear Regression (TensorFlow.js)</p>
              </div>
            </div>

            <button
              onClick={() =>
                downloadReport({
                  recordCount: rows.length,
                  metrics: trained?.metrics,
                  lastPrediction: result,
                })
              }
              className="w-full py-2.5 border border-edge rounded text-sm font-medium hover:border-cab transition-colors"
            >
              Download Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
