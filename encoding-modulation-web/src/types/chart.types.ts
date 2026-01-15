import type { BinaryDataPoint, DigitalSignalPoint } from './signal.types';
import type { AnalogSignal } from './analog.types';

export interface ChartDataset {
  sendData: BinaryDataPoint[];      // Original binary data
  encodedSignal: DigitalSignalPoint[]; // Encoded signal
  receivedData: BinaryDataPoint[];     // Decoded data
}

export interface AnalogToDigitalChartDataset {
  sendAnalog: AnalogSignal;            // Original analog signal
  encodedDigital: DigitalSignalPoint[]; // After two-stage encoding
  receivedAnalog: AnalogSignal;         // Reconstructed analog signal
}

// Re-export from modulator.types for convenience
export type { DigitalToAnalogChartDataset } from './modulator.types';

// Re-export from analog-modulator.types for convenience
export type { AnalogToAnalogChartDataset } from './analog-modulator.types';

export interface ChartConfig {
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  strokeWidth?: number;
}
