import Papa from "papaparse";
import { haversineDistance } from "../utils/distance.js";

export const FEATURE_NAMES = [
  "pickup_latitude",
  "pickup_longitude",
  "dropoff_latitude",
  "dropoff_longitude",
  "passenger_count",
  "trip_distance",
];

/**
 * Loads the taxi fares CSV from the public/ folder and parses it with
 * PapaParse. Returns the raw rows exactly as they appear in the file,
 * with numeric columns converted from strings to numbers.
 */
export function loadDataset(url = "/taxi_fares.csv") {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}

/**
 * Basic sanity filtering: drops rows with missing values or with values
 * outside plausible ranges (e.g. a fare of $0, or coordinates far outside
 * New York City). Real-world trip data always has a handful of these, and
 * a linear regression model trained on them would be skewed by a few
 * extreme outliers.
 */
export function cleanDataset(rows) {
  const missing = { total: rows.length, droppedMissing: 0, droppedInvalid: 0 };

  const cleaned = rows.filter((row) => {
    const values = [
      row.pickup_latitude,
      row.pickup_longitude,
      row.dropoff_latitude,
      row.dropoff_longitude,
      row.passenger_count,
      row.fare_amount,
    ];

    if (values.some((v) => v === null || v === undefined || Number.isNaN(v))) {
      missing.droppedMissing += 1;
      return false;
    }

    const inNYCBounds =
      row.pickup_latitude > 40.4 &&
      row.pickup_latitude < 41.1 &&
      row.dropoff_latitude > 40.4 &&
      row.dropoff_latitude < 41.1 &&
      row.pickup_longitude > -74.5 &&
      row.pickup_longitude < -73.5 &&
      row.dropoff_longitude > -74.5 &&
      row.dropoff_longitude < -73.5;

    const plausible =
      row.fare_amount > 0 &&
      row.fare_amount < 300 &&
      row.passenger_count > 0 &&
      row.passenger_count <= 8;

    if (!inNYCBounds || !plausible) {
      missing.droppedInvalid += 1;
      return false;
    }

    return true;
  });

  missing.kept = cleaned.length;
  return { cleaned, stats: missing };
}

/**
 * Adds the trip_distance feature (computed from the four coordinates via
 * the Haversine formula) to every row.
 */
export function addTripDistance(rows) {
  return rows.map((row) => ({
    ...row,
    trip_distance: haversineDistance(
      row.pickup_latitude,
      row.pickup_longitude,
      row.dropoff_latitude,
      row.dropoff_longitude
    ),
  }));
}

/**
 * Splits rows into feature matrix X and target vector y, in the fixed
 * FEATURE_NAMES column order the model expects.
 */
export function toFeatureMatrix(rows) {
  const X = rows.map((row) => FEATURE_NAMES.map((f) => row[f]));
  const y = rows.map((row) => row.fare_amount);
  return { X, y };
}

/** Fisher-Yates shuffle of two parallel arrays (X, y), keeping pairs aligned. */
function shuffleTogether(X, y) {
  const idx = X.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return { X: idx.map((i) => X[i]), y: idx.map((i) => y[i]) };
}

/** 80/20 (by default) train/test split, shuffled first. */
export function trainTestSplit(X, y, testSize = 0.2) {
  const { X: Xs, y: ys } = shuffleTogether(X, y);
  const splitAt = Math.floor(Xs.length * (1 - testSize));
  return {
    XTrain: Xs.slice(0, splitAt),
    yTrain: ys.slice(0, splitAt),
    XTest: Xs.slice(splitAt),
    yTest: ys.slice(splitAt),
  };
}

/** Per-column mean and standard deviation, used to z-score normalize features. */
export function computeStats(matrix) {
  const numCols = matrix[0].length;
  const mean = new Array(numCols).fill(0);
  const std = new Array(numCols).fill(0);

  for (const row of matrix) {
    row.forEach((v, i) => (mean[i] += v));
  }
  mean.forEach((_, i) => (mean[i] /= matrix.length));

  for (const row of matrix) {
    row.forEach((v, i) => (std[i] += (v - mean[i]) ** 2));
  }
  std.forEach((_, i) => {
    std[i] = Math.sqrt(std[i] / matrix.length) || 1; // avoid divide-by-zero
  });

  return { mean, std };
}

/** Applies z-score normalization: (x - mean) / std, column-wise. */
export function normalize(matrix, stats) {
  return matrix.map((row) => row.map((v, i) => (v - stats.mean[i]) / stats.std[i]));
}

export function normalizeScalar(values, mean, std) {
  return values.map((v) => (v - mean) / std);
}

export function denormalizeScalar(values, mean, std) {
  return values.map((v) => v * std + mean);
}
