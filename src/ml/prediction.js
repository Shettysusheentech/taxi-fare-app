import * as tf from "@tensorflow/tfjs";
import { haversineDistance } from "../utils/distance";
import { normalizeFeatures, denormalizeTarget } from "./preprocessing";

// Runs one prediction through the trained model, using the exact same
// normalization statistics computed during training.
export function predictFare(model, stats, input) {
  const { pickupLat, pickupLon, dropoffLat, dropoffLon, passengerCount } = input;
  const distanceKm = haversineDistance(pickupLat, pickupLon, dropoffLat, dropoffLon);

  const row = {
    pickup_latitude: pickupLat,
    pickup_longitude: pickupLon,
    dropoff_latitude: dropoffLat,
    dropoff_longitude: dropoffLon,
    passenger_count: passengerCount,
    trip_distance: distanceKm,
  };

  const xs = tf.tensor2d([normalizeFeatures(row, stats)]);
  const predictionTensor = model.predict(xs);
  const [scaledFare] = predictionTensor.dataSync();
  xs.dispose();
  predictionTensor.dispose();

  const predictedFare = Math.max(0, denormalizeTarget(scaledFare, stats));

  return { predictedFare, distanceKm };
}
