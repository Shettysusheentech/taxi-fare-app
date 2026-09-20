import * as tf from "@tensorflow/tfjs";
import {
  FEATURE_KEYS,
  normalizeFeatures,
  normalizeTarget,
  denormalizeTarget,
} from "./preprocessing";

const EPOCHS = 80;

// A single dense layer with one linear unit and no activation is
// architecturally multiple linear regression — TensorFlow.js just fits it
// with gradient descent instead of a closed-form solution.
function buildModel() {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      units: 1,
      inputShape: [FEATURE_KEYS.length],
    })
  );
  model.compile({
    optimizer: tf.train.adam(),
    loss: "meanSquaredError",
  });
  return model;
}

export async function trainModel(trainRows, stats, { onEpochEnd } = {}) {
  const model = buildModel();

  const xs = tf.tensor2d(trainRows.map((row) => normalizeFeatures(row, stats)));
  const ys = tf.tensor2d(
    trainRows.map((row) => [normalizeTarget(row.fare_amount, stats)])
  );

  await model.fit(xs, ys, {
    epochs: EPOCHS,
    shuffle: true,
    callbacks: onEpochEnd
      ? {
          onEpochEnd: (epoch, logs) => onEpochEnd(epoch, logs),
        }
      : undefined,
  });

  xs.dispose();
  ys.dispose();

  return model;
}

export function evaluateModel(model, testRows, stats) {
  const xs = tf.tensor2d(testRows.map((row) => normalizeFeatures(row, stats)));
  const predictionsTensor = model.predict(xs);
  const predictedScaled = predictionsTensor.dataSync();
  xs.dispose();
  predictionsTensor.dispose();

  const points = testRows.map((row, i) => ({
    actual: row.fare_amount,
    predicted: denormalizeTarget(predictedScaled[i], stats),
  }));

  const n = points.length;
  const mae = points.reduce((sum, p) => sum + Math.abs(p.actual - p.predicted), 0) / n;
  const mse = points.reduce((sum, p) => sum + (p.actual - p.predicted) ** 2, 0) / n;
  const rmse = Math.sqrt(mse);

  const actualMean = points.reduce((sum, p) => sum + p.actual, 0) / n;
  const ssTotal = points.reduce((sum, p) => sum + (p.actual - actualMean) ** 2, 0);
  const ssResidual = points.reduce((sum, p) => sum + (p.actual - p.predicted) ** 2, 0);
  const r2 = ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal;

  return { mae, rmse, r2, points };
}
