import type { ICodec, DigitalData } from '../types/codec.types';

/**
 * Abstract base class for analog-to-digital codecs
 * Provides common validation methods
 */
export abstract class BaseCodec implements ICodec {
  abstract readonly name: string;
  abstract readonly description: string;

  abstract encode(analogSamples: number[]): DigitalData;
  abstract decode(digitalData: DigitalData): number[];

  /**
   * Validate that analog samples are valid
   */
  protected validateAnalogSamples(samples: number[]): void {
    if (!samples.length) {
      throw new Error('Analog samples cannot be empty');
    }
    if (samples.some(s => !Number.isFinite(s))) {
      throw new Error('Analog samples must be finite numbers');
    }
  }

  /**
   * Validate that digital data is valid
   */
  protected validateDigitalData(data: number[]): void {
    if (!data.length) {
      throw new Error('Digital data cannot be empty');
    }
  }
}
