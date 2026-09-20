import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  loadDataset,
  cleanDataset,
  addTripDistance,
  toFeatureMatrix,
  trainTestSplit,
  FEATURE_NAMES,
} from "../ml/preprocessing.js";
import { trainLinearRegression } from "../ml/trainModel.js";
import { predictFare as runPrediction } from "../ml/prediction.js";

const MLContext = createContext(null);

export function MLProvider({ children }) {
  const [rawRows, setRawRows] = useState([]);
  const [rows, setRows] = useState([]); // cleaned + trip_distance added
  const [cleaningStats, setCleaningStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [isTraining, setIsTraining] = useState(false);
  const [trainProgress, setTrainProgress] = useState(0); // 0-1
  const [trained, setTrained] = useState(null); // { model, xStats, yMean, yStd, metrics, actualVsPredicted }

  const [lastPrediction, setLastPrediction] = useState(null);

  // Load + clean the CSV once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const parsed = await loadDataset("/taxi_fares.csv");
        if (cancelled) return;
        setRawRows(parsed);
        const { cleaned, stats } = cleanDataset(parsed);
        const withDistance = addTripDistance(cleaned);
        setRows(withDistance);
        setCleaningStats(stats);
      } catch (err) {
        if (!cancelled) setLoadError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const train = useCallback(async () => {
    if (rows.length === 0) return;
    setIsTraining(true);
    setTrainProgress(0);

    // Let the "Training..." UI state paint before the (synchronous-ish)
    // TF.js work begins.
    await new Promise((resolve) => setTimeout(resolve, 30));

    const { X, y } = toFeatureMatrix(rows);
    const split = trainTestSplit(X, y, 0.2);

    const result = await trainLinearRegression(split, (epoch, logs) => {
      setTrainProgress((epoch + 1) / 80);
    });

    setTrained(result);
    setIsTraining(false);
  }, [rows]);

  const predict = useCallback(
    (featureVector) => {
      if (!trained) return null;
      return runPrediction(
        trained.model,
        featureVector,
        trained.xStats,
        trained.yMean,
        trained.yStd
      );
    },
    [trained]
  );

  const value = {
    rawRows,
    rows,
    cleaningStats,
    loading,
    loadError,
    isTraining,
    trainProgress,
    trained,
    isTrained: Boolean(trained),
    train,
    predict,
    lastPrediction,
    setLastPrediction,
    featureNames: FEATURE_NAMES,
  };

  return <MLContext.Provider value={value}>{children}</MLContext.Provider>;
}

export function useML() {
  const ctx = useContext(MLContext);
  if (!ctx) throw new Error("useML must be used within an MLProvider");
  return ctx;
}
