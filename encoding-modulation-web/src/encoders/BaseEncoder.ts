import type { IEncoder } from '../types/encoder.types';
import type { BinaryData, EncodedSignal } from '../types/signal.types';

export abstract class BaseEncoder implements IEncoder {
  abstract readonly name: string;
  abstract readonly description: string;

  abstract encode(data: BinaryData): EncodedSignal;
  abstract decode(signal: EncodedSignal): BinaryData;

  // Helper method for validation
  protected validateBinaryData(data: BinaryData): void {
    if (!data.length) {
      throw new Error('Binary data cannot be empty');
    }

    if (data.some(bit => bit !== 0 && bit !== 1)) {
      throw new Error('Binary data must contain only 0 and 1');
    }
  }

  protected validateSignal(signal: EncodedSignal): void {
    if (!signal.length) {
      throw new Error('Signal cannot be empty');
    }
  }
}
