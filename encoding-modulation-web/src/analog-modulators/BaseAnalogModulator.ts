import type { IAnalogModulator } from '../types/analog-modulator.types';

/**
 * Abstract base class for analog-to-analog modulators
 * Provides common validation and interface implementation
 */
export abstract class BaseAnalogModulator implements IAnalogModulator {
  abstract readonly name: string;
  abstract readonly description: string;

  /**
   * Modulate a message signal with a carrier
   */
  abstract modulate(messageSignal: number[], t: number[]): number[];

  /**
   * Demodulate a modulated signal to recover the message
   */
  abstract demodulate(modulatedSignal: number[], t: number[]): number[];

  /**
   * Validate that signal and time arrays have matching lengths
   */
  protected validateArrays(signal: number[], t: number[]): void {
    if (signal.length !== t.length) {
      throw new Error(
        `Signal and time arrays must have same length (signal: ${signal.length}, time: ${t.length})`
      );
    }

    if (signal.length === 0) {
      throw new Error('Signal and time arrays cannot be empty');
    }
  }

  /**
   * Validate time array has consistent spacing
   */
  protected validateTimeArray(t: number[]): void {
    if (t.length < 2) {
      throw new Error('Time array must have at least 2 points');
    }

    if (t[0] >= t[t.length - 1]) {
      throw new Error('Time array must be strictly increasing');
    }
  }
}
