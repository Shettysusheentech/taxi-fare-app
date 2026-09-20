/**
 * Buckets a list of numeric values into `binCount` equal-width bins and
 * returns counts per bin, suitable for rendering as a bar chart histogram.
 */
export function histogramBuckets(values, binCount = 12) {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = (max - min) / binCount || 1;

  const bins = Array.from({ length: binCount }, (_, i) => ({
    rangeStart: min + i * width,
    rangeEnd: min + (i + 1) * width,
    count: 0,
  }));

  values.forEach((v) => {
    let idx = Math.floor((v - min) / width);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    bins[idx].count += 1;
  });

  return bins.map((b) => ({
    label: `$${b.rangeStart.toFixed(0)}\u2013${b.rangeEnd.toFixed(0)}`,
    count: b.count,
  }));
}

export function mean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}
