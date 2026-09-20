// Buckets numeric values into a fixed number of equal-width bins for histogram charts.
export function buildHistogram(values, bucketCount = 12) {
  if (!values.length) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const bucketWidth = range / bucketCount;

  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const rangeStart = min + i * bucketWidth;
    const rangeEnd = rangeStart + bucketWidth;
    return {
      label: `$${rangeStart.toFixed(0)}-${rangeEnd.toFixed(0)}`,
      rangeStart,
      rangeEnd,
      count: 0,
    };
  });

  for (const value of values) {
    const index = Math.min(
      Math.floor((value - min) / bucketWidth),
      bucketCount - 1
    );
    buckets[index].count += 1;
  }

  return buckets;
}

export function mean(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function standardDeviation(values, precomputedMean) {
  const avg = precomputedMean ?? mean(values);
  const variance =
    values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}
