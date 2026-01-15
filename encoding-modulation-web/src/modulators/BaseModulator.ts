import type { IModulator } from '../types/modulator.types';
import type { BinaryData } from '../types/signal.types';
import type { Sinusoid } from '../utils/signalGeneration';

/**
 * Abstract base class for all modulators
 * Provides common validation logic
 */
export abstract class BaseModulator implements IModulator {
  abstract readonly name: string;
  abstract readonly description: string;

  abstract modulate(data: BinaryData): Sinusoid[];
  abstract demodulate(signalStream: Sinusoid[]): BinaryData;

  /**
   * Validate binary data before modulation
   * Ensures data is non-empty and contains only 0s and 1s
   */
  protected validateBinaryData(data: BinaryData): void {
    if (!data.length) {
      throw new Error('Binary data cannot be empty');
    }
    if (data.some(bit => bit !== 0 && bit !== 1)) {
      throw new Error('Binary data must contain only 0 and 1');
    }
  }
}
