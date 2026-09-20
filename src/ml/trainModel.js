import * as tf from "@tensorflow/tfjs";
import {
  computeStats,
  normalize,
  normalizeScalar,
  denormalizeScalar,
} from "./preprocessing.js";

/**
 * Builds a single dense layer with no activation function. With one linear
 * unit reading all six input features, this is architecturally identical to
 * a multiple linear regression model — TensorFlow.js is just the engine
 * that fits its weights, the same way scikit-learn's LinearRegression would.
 */
function buildModel(numFeatures) {
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      inputShape: [numFeatures],
      units: 1,
      // linear regression has no non-linear activation on the output
    })
  );
  model.compile({
    optimizer: tf.train.adam(0.05),
    loss: "meanSquaredError",
  });
  return model;
}

/**
 * Trains a linear regression model on the given train/test split and
 * returns the fitted model, the normalization stats needed to feed it new
 * data later, and real evaluation metrics (MAE, RMSE, R²) computed on the
 * held-out test set — nothing here is a placeholder number.
 *
 * @param {{XTrain: number[][], yTrain: number[], XTest: number[][], yTest: number[]}} split
 * @param {(epoch: number, logs: object) => void} [onEpochEnd] optional training progress callback
 */
export async function trainLinearRegression(split, onEpochEnd) {
  const { XTrain, yTrain, XTest, yTest } = split;

  const xStats = computeStats(XTrain);
  const yMean = yTrain.reduce((a, b) => a + b, 0) / yTrain.length;
  const yStd =
    Math.sqrt(yTrain.reduce((a, b) => a + (b - yMean) ** 2, 0) / yTrain.length) || 1;

  const XTrainNorm = normalize(XTrain, xStats);
  const yTrainNorm = normalizeScalar(yTrain, yMean, yStd);
  const XTestNorm = normalize(XTest, xStats);

  const model = buildModel(XTrain[0].length);

  const xTensor = tf.tensor2d(XTrainNorm);
  const yTensor = tf.tensor2d(yTrainNorm, [yTrainNorm.length, 1]);

  await model.fit(xTensor, yTensor, {
    epochs: 80,
    batchSize: 64,
    shuffle: true,
    callbacks: onEpochEnd
      ? { onEpochEnd: (epoch, logs) => onEpochEnd(epoch, logs) }
      : undefined,
  });

  xTensor.dispose();
  yTensor.dispose();

  // Evaluate on the held-out test set, in real dollar units.
  const testTensor = tf.tensor2d(XTestNorm);
  const predNormTensor = model.predict(testTensor);
  const predNorm = Array.from(await predNormTensor.data());
  testTensor.dispose();
  predNormTensor.dispose();

  const predicted = denormalizeScalar(predNorm, yMean, yStd);

  const n = yTest.length;
  const errors = yTest.map((actual, i) => actual - predicted[i]);
  const mae = errors.reduce((sum, e) => sum + Math.abs(e), 0) / n;
  const rmse = Math.sqrt(errors.reduce((sum, e) => sum + e * e, 0) / n);

  const yTestMean = yTest.reduce((a, b) => a + b, 0) / n;
  const ssRes = errors.reduce((sum, e) => sum + e * e, 0);
  const ssTot = yTest.reduce((sum, actual) => sum + (actual - yTestMean) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;

  const actualVsPredicted = yTest.map((actual, i) => ({
    actual: Number(actual.toFixed(2)),
    predicted: Number(predicted[i].toFixed(2)),
  }));

  return {
    model,
    xStats,
    yMean,
    yStd,
    metrics: { mae, rmse, r2, testSize: n, trainSize: XTrain.length },
    actualVsPredicted,
  };
}
