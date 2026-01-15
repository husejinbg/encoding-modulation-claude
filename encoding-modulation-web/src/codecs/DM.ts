import { BaseCodec } from './BaseCodec';
import type { IDMCodec, DigitalData } from '../types/codec.types';

/**
 * Delta Modulation (DM) Codec
 *
 * Encoding: Creates staircase approximation by tracking signal changes
 * Decoding: Reconstructs staircase signal from binary stream
 *
 * Direct translation from Python analog_to_digital.py DM class
 */
export class DM extends BaseCodec implements IDMCodec {
  readonly name = 'DM';
  readonly description = 'Delta Modulation';
  readonly delta: number;

  constructor(delta: number) {
    super();

    if (delta <= 0) {
      throw new Error('Delta must be positive');
    }

    this.delta = delta;
  }

  /**
   * Encode analog samples to binary stream
   * Returns array of bits (0 or 1)
   *
   * Algorithm: Maintain staircase approximation
   * - If sample > staircase: emit 1, increment staircase by delta
   * - If sample <= staircase: emit 0, decrement staircase by delta
   */
  encode(analogSamples: number[]): DigitalData {
    this.validateAnalogSamples(analogSamples);

    const binaryStream: number[] = [];
    let currentStaircaseValue = 0.0;

    for (const sample of analogSamples) {
      if (sample > currentStaircaseValue) {
        binaryStream.push(1);
        currentStaircaseValue += this.delta;
      } else {
        binaryStream.push(0);
        currentStaircaseValue -= this.delta;
      }
    }

    return binaryStream;
  }

  /**
   * Decode binary stream to analog samples
   * Reconstructs staircase approximation
   *
   * Algorithm: Start at 0, apply delta based on each bit
   * - If bit is 1: add delta
   * - If bit is 0: subtract delta
   */
  decode(binaryStream: DigitalData): number[] {
    this.validateDigitalData(binaryStream);

    const reconstructedSignal: number[] = [];
    let currentValue = 0.0;

    for (const bit of binaryStream) {
      if (bit === 1) {
        currentValue += this.delta;
      } else {
        currentValue -= this.delta;
      }
      reconstructedSignal.push(currentValue);
    }

    return reconstructedSignal;
  }
}
