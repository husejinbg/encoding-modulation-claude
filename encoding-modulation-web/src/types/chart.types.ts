import type { BinaryDataPoint, DigitalSignalPoint } from './signal.types';

export interface ChartDataset {
  sendData: BinaryDataPoint[];      // Original binary data
  encodedSignal: DigitalSignalPoint[]; // Encoded signal
  receivedData: BinaryDataPoint[];     // Decoded data
}

export interface ChartConfig {
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  strokeWidth?: number;
}
