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

export interface ChartConfig {
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  strokeWidth?: number;
}
