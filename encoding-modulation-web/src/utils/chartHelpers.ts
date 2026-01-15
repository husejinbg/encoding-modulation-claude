import type {
  BinaryData,
  EncodedSignal,
  BinaryDataPoint,
  DigitalSignalPoint
} from '../types/signal.types';
import type { AnalogSignal } from '../types/analog.types';

// =============================================================================
// PERFORMANCE CONFIGURATION
// =============================================================================

/** Maximum number of bit boundary lines to render in plots */
export const MAX_VISIBLE_BIT_BOUNDARIES = 50;

/** Maximum number of individual colored cells in BinaryPlot */
export const MAX_INDIVIDUAL_CELLS = 100;

// =============================================================================
// BINARY DATA TRANSFORMATIONS
// =============================================================================

/**
 * Transforms binary data into chart-ready format for bar/scatter plot.
 * Creates an array of {index, value} points for Recharts BarChart.
 *
 * Time complexity: O(n)
 * Space complexity: O(n)
 *
 * @param data - Array of binary values (0 or 1)
 * @returns Array of chart-ready data points with index and value
 */
export function transformBinaryData(data: BinaryData): BinaryDataPoint[] {
  return data.map((value, index) => ({
    index,
    value,
  }));
}

// =============================================================================
// DIGITAL SIGNAL TRANSFORMATIONS
// =============================================================================

/**
 * Transforms encoded signal into step-chart-ready format.
 *
 * Creates horizontal line segments by duplicating each point at interval boundaries.
 * This "double-point transformation" is required because Recharts LineChart connects
 * points with diagonal lines by default. By placing two points at the same level
 * (one at start, one at end of each interval), we create horizontal segments.
 *
 * Example: Signal [1, -1] becomes:
 *   [{time:0, level:1}, {time:1, level:1}, {time:1, level:-1}, {time:2, level:-1}]
 *
 * Time complexity: O(n)
 * Space complexity: O(2n) - pre-allocated for performance
 *
 * @param signal - Encoded signal array with values from SignalLevel (-1, 0, 1)
 * @returns Array of chart points with doubled length for step rendering
 */
export function transformEncodedSignal(signal: EncodedSignal): DigitalSignalPoint[] {
  const length = signal.length;

  // Pre-allocate array to avoid dynamic resizing during push operations
  // This significantly improves performance for large signals (1000+ elements)
  const points = new Array<DigitalSignalPoint>(length * 2);

  for (let i = 0; i < length; i++) {
    const level = signal[i];
    const idx = i * 2;

    // Start of interval - point at beginning of time slot
    points[idx] = {
      time: i,
      level: level,
      bitIndex: i,
    };

    // End of interval - point at end of time slot (same level creates horizontal line)
    points[idx + 1] = {
      time: i + 1,
      level: level,
      bitIndex: i,
    };
  }

  return points;
}

/**
 * Calculates optimal Y-axis domain for digital signal plot.
 *
 * Uses a single-pass algorithm to detect which signal levels are present,
 * with early exit optimization when all levels are found.
 *
 * Previous implementation used 3x .includes() calls = O(3n).
 * This optimized version is O(n) with potential early exit.
 *
 * @param signal - Encoded signal array
 * @returns Tuple of [min, max] values for Y-axis domain with padding
 */
export function getSignalDomain(signal: EncodedSignal): [number, number] {
  let hasNoLine = false;
  let hasHigh = false;
  let hasLow = false;

  // Single-pass through array with early exit when all levels found
  for (let i = 0; i < signal.length; i++) {
    const level = signal[i];
    if (level === 0) hasNoLine = true;
    else if (level === 1) hasHigh = true;
    else if (level === -1) hasLow = true;

    // Early exit - no need to continue if all three levels are found
    if (hasNoLine && hasHigh && hasLow) break;
  }

  // Add padding for better visualization
  const padding = 0.5;

  if (hasLow && hasHigh) {
    return [-1 - padding, 1 + padding];
  } else if (hasNoLine) {
    // Show all three levels when NO_LINE is present
    return [-1 - padding, 1 + padding];
  } else {
    // Default range
    return [-1.5, 1.5];
  }
}

// =============================================================================
// ANALOG SIGNAL UTILITIES
// =============================================================================

/**
 * Efficiently calculates min and max values from a numeric array in a single pass.
 *
 * Avoids the spread operator issue where Math.min(...largeArray) can cause
 * "Maximum call stack size exceeded" errors with arrays >65K elements.
 *
 * Time complexity: O(n)
 * Space complexity: O(1) - no intermediate arrays created
 *
 * @param values - Array of numbers to analyze
 * @returns Object containing min and max values
 */
export function getMinMax(values: number[]): { min: number; max: number } {
  if (values.length === 0) {
    return { min: 0, max: 0 };
  }

  let min = values[0];
  let max = values[0];

  // Start from index 1 since we initialized with values[0]
  for (let i = 1; i < values.length; i++) {
    const value = values[i];
    if (value < min) min = value;
    if (value > max) max = value;
  }

  return { min, max };
}

/**
 * Calculates optimal Y-axis domain for analog signal plot.
 *
 * Optimized version that avoids:
 * 1. Creating intermediate array with .map()
 * 2. Using spread operator with Math.min/max (stack overflow risk)
 *
 * Time complexity: O(n)
 * Space complexity: O(1) - no intermediate arrays
 *
 * @param signal - Analog signal array with {time, value} points
 * @returns Tuple of [min, max] for Y-axis domain with 10% padding
 */
export function getAnalogDomain(signal: AnalogSignal): [number, number] {
  if (signal.length === 0) {
    return [-1, 1];
  }

  let min = signal[0].value;
  let max = signal[0].value;

  // Single-pass min/max without intermediate array allocation
  for (let i = 1; i < signal.length; i++) {
    const value = signal[i].value;
    if (value < min) min = value;
    if (value > max) max = value;
  }

  // 10% padding, or 1 if range is zero (flat signal)
  const padding = (max - min) * 0.1 || 1;
  return [min - padding, max + padding];
}

/**
 * Calculates unified Y-axis domain for multiple analog signals.
 *
 * Used in AnalogToDigital tab to ensure Send and Received signals
 * share the same Y-axis scale for visual comparison.
 *
 * Optimized to process multiple signals in a single pass without
 * creating intermediate arrays or using spread operators.
 *
 * Time complexity: O(n) where n = total points across all signals
 * Space complexity: O(1)
 *
 * @param signals - Array of AnalogSignal arrays to analyze
 * @param paddingPercent - Padding as decimal (default 0.1 = 10%)
 * @returns Tuple of [min, max] for unified Y-axis domain
 */
export function getUnifiedAnalogDomain(
  signals: AnalogSignal[],
  paddingPercent: number = 0.1
): [number, number] {
  let globalMin = Infinity;
  let globalMax = -Infinity;

  // Process all signals in a single nested loop - no intermediate arrays
  for (const signal of signals) {
    for (const point of signal) {
      if (point.value < globalMin) globalMin = point.value;
      if (point.value > globalMax) globalMax = point.value;
    }
  }

  // Handle edge case of empty/invalid data
  if (!isFinite(globalMin) || !isFinite(globalMax)) {
    return [-1, 1];
  }

  const range = globalMax - globalMin;
  const padding = range * paddingPercent || 1;

  return [globalMin - padding, globalMax + padding];
}
