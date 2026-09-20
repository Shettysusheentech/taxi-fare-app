import * as tf from "@tensorflow/tfjs";
import { normalize, denormalizeScalar } from "./preprocessing.js";

/**
 * Runs one feature vector through the trained model and returns the
 * predicted fare in dollars. Applies the exact same normalization used
 * during training, so this is the same math the model was fit with — not
 * a separate estimate.
 *
 * @param {tf.LayersModel} model
 * @param {number[]} featureVector - [pickup_lat, pickup_lon, dropoff_lat, dropoff_lon, passengers, distance]
 * @param {{mean: number[], std: number[]}} xStats
 * @param {number} yMean
 * @param {number} yStd
 * @returns {number} predicted fare in dollars
 */
export function predictFare(model, featureVector, xStats, yMean, yStd) {
  const normalized = normalize([featureVector], xStats);
  const inputTensor = tf.tensor2d(normalized);
  const outputTensor = model.predict(inputTensor);
  const [predictedNorm] = outputTensor.dataSync();
  inputTensor.dispose();
  outputTensor.dispose();

  const [fare] = denormalizeScalar([predictedNorm], yMean, yStd);
  return Math.max(fare, 0); // a fare can't be negative
}
