import type {
  BinaryData,
  EncodedSignal,
  BinaryDataPoint,
  DigitalSignalPoint
} from '../types/signal.types';
import type { AnalogSignal } from '../types/analog.types';

/**
 * Transforms binary data into chart-ready format for bar/scatter plot
 */
export function transformBinaryData(data: BinaryData): BinaryDataPoint[] {
  return data.map((value, index) => ({
    index,
    value,
  }));
}

/**
 * Transforms encoded signal into step-chart-ready format
 * Creates horizontal line segments by duplicating points at boundaries
 */
export function transformEncodedSignal(signal: EncodedSignal): DigitalSignalPoint[] {
  const points: DigitalSignalPoint[] = [];

  for (let i = 0; i < signal.length; i++) {
    // Start of interval
    points.push({
      time: i,
      level: signal[i],
      bitIndex: i,
    });

    // End of interval (creates horizontal line)
    points.push({
      time: i + 1,
      level: signal[i],
      bitIndex: i,
    });
  }

  return points;
}

/**
 * Calculates optimal Y-axis domain for signal plot
 */
export function getSignalDomain(signal: EncodedSignal): [number, number] {
  const hasNoLine = signal.includes(0);
  const hasHigh = signal.includes(1);
  const hasLow = signal.includes(-1);

  // Add padding for better visualization
  const padding = 0.5;

  if (hasLow && hasHigh) {
    return [-1 - padding, 1 + padding];
  } else if (hasNoLine) {
    return [-1 - padding, 1 + padding]; // Show all three levels
  } else {
    return [-1.5, 1.5]; // Default range
  }
}

/**
 * Calculates optimal Y-axis domain for analog signal plot
 */
export function getAnalogDomain(signal: AnalogSignal): [number, number] {
  const values = signal.map(p => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1 || 1; // 10% padding or 1 if range is 0
  return [min - padding, max + padding];
}
