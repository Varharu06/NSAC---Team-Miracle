// src/app/visualize/utils.ts

// Existing helper functions (zScore, grubbsTest)
export function zScore(arr: number[]) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const std = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
  return arr.map((x) => (x - mean) / std);
}

export function grubbsTest(arr: number[], threshold = 2.5) {
  if (arr.length < 3) return [];
  const zScoresArr = zScore(arr);
  const maxZ = Math.max(...zScoresArr.map(Math.abs));
  const maxIndex = zScoresArr.map(Math.abs).indexOf(maxZ);
  return maxZ > threshold ? [maxIndex] : [];
}

// 🔹 New helper: Linear extrapolation for prediction
export function linearExtrapolate(values: number[], steps: number) {
  if (values.length < 2) return Array(steps).fill(values[values.length - 1] || 0);

  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = values;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY);
    denominator += (x[i] - meanX) ** 2;
  }

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  const predictions: number[] = [];
  for (let i = n; i < n + steps; i++) {
    predictions.push(intercept + slope * i);
  }

  return predictions;
}

// BEFORE:
// // src/app/visualize/utils.ts

// // Compute z-scores
// export function zScore(values: number[]): number[] {
//   const mean = values.reduce((a, b) => a + b, 0) / values.length;
//   const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
//   return values.map(v => (v - mean) / (std || 1)); // avoid divide by zero
// }

// // Return indices of outliers using z-score threshold
// export function grubbsOutliers(values: number[], threshold = 3): number[] {
//   const zScores = zScore(values);
//   return zScores
//     .map((z, i) => ({ z, i }))
//     .filter(item => Math.abs(item.z) > threshold)
//     .map(item => item.i);
// }
