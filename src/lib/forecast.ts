export type ForecastPoint = { x: number; y: number }

export function linearRegression(points: ForecastPoint[]): { slope: number; intercept: number } | null {
  if (points.length < 2) return null

  const n = points.length
  const sumX = points.reduce((sum, p) => sum + p.x, 0)
  const sumY = points.reduce((sum, p) => sum + p.y, 0)
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0)

  const denominator = n * sumXX - sumX * sumX
  if (denominator === 0) return null

  const slope = (n * sumXY - sumX * sumY) / denominator
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

export function projectLinear(points: ForecastPoint[], xNext: number): number | null {
  const regression = linearRegression(points)
  if (!regression) return null
  return regression.slope * xNext + regression.intercept
}

export function movingAverage(values: number[], windowSize: number): number | null {
  if (values.length === 0 || windowSize <= 0) return null
  const window = values.slice(-windowSize)
  return window.reduce((sum, v) => sum + v, 0) / window.length
}
