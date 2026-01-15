import { BaseModulator } from './BaseModulator';
import type { BinaryData } from '../types/signal.types';
import { Sinusoid } from '../utils/signalGeneration';

/**
 * BFSK (Binary Frequency Shift Keying) Modulator
 * Bits are represented by different frequencies
 * - Binary 1: High frequency (f_one)
 * - Binary 0: Low frequency (f_zero)
 */
export class BFSK extends BaseModulator {
  readonly name = 'BFSK';
  readonly description = 'Binary Frequency Shift Keying: Bits represented by different frequencies';

  public f_zero: number;   // Frequency for bit 0 (Hz)
  public f_one: number;    // Frequency for bit 1 (Hz)
  public A: number;        // Amplitude (constant)

  constructor(f_zero: number, f_one: number, A: number) {
    super();
    this.f_zero = f_zero;
    this.f_one = f_one;
    this.A = A;
  }

  /**
   * Modulate binary data into signal stream
   * Each bit becomes a Sinusoid with frequency based on bit value
   */
  modulate(data: BinaryData): Sinusoid[] {
    this.validateBinaryData(data);

    return data.map(bit => {
      const frequency = bit === 1 ? this.f_one : this.f_zero;
      return new Sinusoid(this.A, frequency, 0, 0);
    });
  }

  /**
   * Demodulate signal stream back to binary data
   * Checks frequency to determine bit value
   */
  demodulate(signalStream: Sinusoid[]): BinaryData {
    return signalStream.map(wave => {
      return wave.frequency === this.f_one ? 1 : 0;
    }) as BinaryData;
  }
}
