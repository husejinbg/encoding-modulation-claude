import type { AnalogSignal } from './analog.types';

/**
 * Interface for analog-to-analog modulators (AM, FM, PM)
 */
export interface IAnalogModulator {
  readonly name: string;
  readonly description: string;

  /**
   * Modulate a message signal with a carrier
   * @param messageSignal - Message signal samples
   * @param t - Time array corresponding to message signal
   * @returns Modulated signal samples
   */
  modulate(messageSignal: number[], t: number[]): number[];

  /**
   * Demodulate a modulated signal to recover the message
   * @param modulatedSignal - Modulated signal samples
   * @param t - Time array corresponding to modulated signal
   * @returns Recovered message signal samples
   */
  demodulate(modulatedSignal: number[], t: number[]): number[];
}

/**
 * Metadata for a modulator parameter
 */
export interface AnalogModulatorParameter {
  key: string;
  label: string;
  defaultValue: number;
  min: number;
  step: number;
  unit: string;
  max?: number;
  tooltip?: string;
}

/**
 * Modulator information for UI display
 */
export interface AnalogModulatorInfo {
  id: AnalogModulatorId;
  displayName: string;
  description: string;
  parameters: AnalogModulatorParameter[];
}

/**
 * Available analog modulator types
 */
export type AnalogModulatorId = 'am' | 'fm' | 'pm';

/**
 * Chart dataset for Analog-to-Analog transmission visualization
 */
export interface AnalogToAnalogChartDataset {
  sendAnalog: AnalogSignal;         // Original message signal
  modulatedAnalog: AnalogSignal;    // After AM/FM/PM modulation
  receivedAnalog: AnalogSignal;     // After demodulation
}
