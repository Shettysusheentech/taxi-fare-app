import { createContext, useCallback, useContext, useState } from "react";
import Papa from "papaparse";
import {
  parseAndCleanCsv,
  trainTestSplit,
  computeNormalizationStats,
} from "../ml/preprocessing";
import { trainModel as trainModelInternal, evaluateModel } from "../ml/trainModel";

const MLContext = createContext(null);

// Shares the loaded dataset and the trained model across every page, since
// Dashboard trains it, Prediction/ModelPerformance both need to read it.
export function MLProvider({ children }) {
  const [dataset, setDataset] = useState([]);
  const [rawRowCount, setRawRowCount] = useState(0);
  const [isDatasetLoading, setIsDatasetLoading] = useState(false);
  const [datasetError, setDatasetError] = useState(null);

  const [model, setModel] = useState(null);
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const [lastPrediction, setLastPrediction] = useState(null);

  const loadDataset = useCallback(async () => {
    setIsDatasetLoading(true);
    setDatasetError(null);
    try {
      const response = await fetch("/taxi_fares.csv");
      const csvText = await response.text();
      const { data: rawRows } = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });
      const cleaned = parseAndCleanCsv(csvText);
      setRawRowCount(rawRows.length);
      setDataset(cleaned);
    } catch (err) {
      setDatasetError(err.message ?? "Failed to load dataset");
    } finally {
      setIsDatasetLoading(false);
    }
  }, []);

  const train = useCallback(async () => {
    if (!dataset.length) return;
    setIsTraining(true);
    setTrainingProgress(0);

    const { train: trainRows, test: testRows } = trainTestSplit(dataset, 0.8);
    const normStats = computeNormalizationStats(trainRows);

    const trainedModel = await trainModelInternal(trainRows, normStats, {
      onEpochEnd: (epoch, logs) => {
        setTrainingProgress(Math.round(((epoch + 1) / 80) * 100));
      },
    });

    const evalResult = evaluateModel(trainedModel, testRows, normStats);

    setModel(trainedModel);
    setStats(normStats);
    setMetrics(evalResult);
    setIsTraining(false);
  }, [dataset]);

  const value = {
    dataset,
    rawRowCount,
    isDatasetLoading,
    datasetError,
    loadDataset,
    model,
    stats,
    metrics,
    isTraining,
    trainingProgress,
    isTrained: Boolean(model && stats),
    train,
    lastPrediction,
    setLastPrediction,
  };

  return <MLContext.Provider value={value}>{children}</MLContext.Provider>;
}

export function useML() {
  const ctx = useContext(MLContext);
  if (!ctx) throw new Error("useML must be used within an MLProvider");
  return ctx;
}
