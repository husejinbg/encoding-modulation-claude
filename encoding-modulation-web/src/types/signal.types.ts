// Signal level constants (matching Python implementation)
export const SignalLevel = {
  LOW: -1,
  HIGH: 1,
  NO_LINE: 0,
} as const;

export type SignalLevelValue = typeof SignalLevel[keyof typeof SignalLevel];

// Binary data type
export type BinaryBit = 0 | 1;
export type BinaryData = BinaryBit[];

// Encoded signal type
export type EncodedSignal = SignalLevelValue[];

// Chart data point for digital signals
export interface DigitalSignalPoint {
  time: number;      // x-axis: time index
  level: number;     // y-axis: signal level (-1, 0, 1)
  bitIndex?: number; // original bit index (for reference)
}

// Chart data point for binary data visualization
export interface BinaryDataPoint {
  index: number;     // bit position
  value: BinaryBit;  // 0 or 1
}
