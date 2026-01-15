import type { BinaryData, BinaryDataPoint } from './signal.types';
import type { AnalogSignal } from './analog.types';
import type { Sinusoid } from '../utils/signalGeneration';

/**
 * Modulator interface for digital-to-analog conversion
 * Converts binary data to analog signals using various modulation techniques
 */
export interface IModulator {
  readonly name: string;
  readonly description: string;

  /**
   * Modulate binary data into a signal stream
   * Each bit becomes one Sinusoid object
   */
  modulate(data: BinaryData): Sinusoid[];

  /**
   * Demodulate signal stream back to binary data
   * Extracts bits from Sinusoid properties (amplitude, frequency, or phase)
   */
  demodulate(signalStream: Sinusoid[]): BinaryData;
}

/**
 * Modulator parameter metadata for UI
 */
export interface ModulatorParameterInfo {
  key: string;
  label: string;
  defaultValue: number;
  min: number;
  step: number;
  unit: string;
}

/**
 * Modulator metadata for registry
 */
export interface ModulatorInfo {
  id: ModulatorId;
  displayName: string;
  description: string;
  parameters: ModulatorParameterInfo[];
}

/**
 * Available modulator types
 */
export type ModulatorId = 'ask' | 'bfsk' | 'bpsk' | 'mfsk' | 'qpsk';

/**
 * Chart dataset for digital-to-analog visualization
 */
export interface DigitalToAnalogChartDataset {
  sendData: BinaryDataPoint[];       // Original binary input
  modulatedSignal: AnalogSignal;     // Modulated analog waveform
  receivedData: BinaryDataPoint[];   // Demodulated binary output
}
