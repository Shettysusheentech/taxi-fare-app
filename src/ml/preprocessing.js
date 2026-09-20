import Papa from "papaparse";
import { haversineDistance } from "../utils/distance";

export const FEATURE_KEYS = [
  "pickup_latitude",
  "pickup_longitude",
  "dropoff_latitude",
  "dropoff_longitude",
  "passenger_count",
  "trip_distance",
];

// Parses the raw CSV, drops invalid rows, and derives trip_distance via
// the Haversine formula. Mirrors the cleaning rules described in the README:
// fares must be > $0 and <= $300, passenger counts within 1-8, and
// coordinates within the rough NYC area.
export function parseAndCleanCsv(csvText) {
  const { data } = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const cleaned = [];
  for (const row of data) {
    const pickup_latitude = row.pickup_latitude;
    const pickup_longitude = row.pickup_longitude;
    const dropoff_latitude = row.dropoff_latitude;
    const dropoff_longitude = row.dropoff_longitude;
    const passenger_count = row.passenger_count;
    const fare_amount = row.fare_amount;

    if (
      [pickup_latitude, pickup_longitude, dropoff_latitude, dropoff_longitude, passenger_count, fare_amount].some(
        (v) => v === null || v === undefined || Number.isNaN(v)
      )
    ) {
      continue;
    }

    if (fare_amount <= 0 || fare_amount > 300) continue;
    if (passenger_count < 1 || passenger_count > 8) continue;
    if (pickup_latitude < 40.4 || pickup_latitude > 41.1) continue;
    if (dropoff_latitude < 40.4 || dropoff_latitude > 41.1) continue;
    if (pickup_longitude < -74.3 || pickup_longitude > -73.5) continue;
    if (dropoff_longitude < -74.3 || dropoff_longitude > -73.5) continue;

    const trip_distance = haversineDistance(
      pickup_latitude,
      pickup_longitude,
      dropoff_latitude,
      dropoff_longitude
    );
    if (trip_distance <= 0) continue;

    cleaned.push({
      pickup_latitude,
      pickup_longitude,
      dropoff_latitude,
      dropoff_longitude,
      passenger_count,
      trip_distance,
      fare_amount,
    });
  }

  return cleaned;
}

// Deterministic shuffle so repeated runs in the same session are comparable.
function shuffle(array, seed = 42) {
  const result = [...array];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function trainTestSplit(rows, trainRatio = 0.8) {
  const shuffled = shuffle(rows);
  const splitIndex = Math.floor(shuffled.length * trainRatio);
  return {
    train: shuffled.slice(0, splitIndex),
    test: shuffled.slice(splitIndex),
  };
}

// Computes per-feature and target mean/std from the training set ONLY,
// so the test set never leaks into normalization statistics.
export function computeNormalizationStats(trainRows) {
  const stats = {};

  for (const key of FEATURE_KEYS) {
    const values = trainRows.map((r) => r[key]);
    const featMean = values.reduce((a, b) => a + b, 0) / values.length;
    const featStd =
      Math.sqrt(
        values.reduce((a, b) => a + (b - featMean) ** 2, 0) / values.length
      ) || 1;
    stats[key] = { mean: featMean, std: featStd };
  }

  const targets = trainRows.map((r) => r.fare_amount);
  const targetMean = targets.reduce((a, b) => a + b, 0) / targets.length;
  const targetStd =
    Math.sqrt(
      targets.reduce((a, b) => a + (b - targetMean) ** 2, 0) / targets.length
    ) || 1;
  stats.fare_amount = { mean: targetMean, std: targetStd };

  return stats;
}

export function normalizeFeatures(row, stats) {
  return FEATURE_KEYS.map((key) => (row[key] - stats[key].mean) / stats[key].std);
}

export function normalizeTarget(fare, stats) {
  return (fare - stats.fare_amount.mean) / stats.fare_amount.std;
}

export function denormalizeTarget(scaledFare, stats) {
  return scaledFare * stats.fare_amount.std + stats.fare_amount.mean;
}
