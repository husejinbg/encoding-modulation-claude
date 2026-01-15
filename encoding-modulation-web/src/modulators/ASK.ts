import { BaseModulator } from './BaseModulator';
import type { BinaryData } from '../types/signal.types';
import { Sinusoid } from '../utils/signalGeneration';

/**
 * ASK (Amplitude Shift Keying) Modulator
 * Bits are represented by different amplitudes
 * - Binary 1: High amplitude (A_one)
 * - Binary 0: Low/zero amplitude (A_zero)
 */
export class ASK extends BaseModulator {
  readonly name = 'ASK';
  readonly description = 'Amplitude Shift Keying: Bits represented by different amplitudes';

  public f_c: number;      // Carrier frequency (Hz)
  public A_one: number;    // Amplitude for bit 1
  public A_zero: number;   // Amplitude for bit 0

  constructor(f_c: number, A_one: number, A_zero: number) {
    super();
    this.f_c = f_c;
    this.A_one = A_one;
    this.A_zero = A_zero;
  }

  /**
   * Modulate binary data into signal stream
   * Each bit becomes a Sinusoid with amplitude based on bit value
   */
  modulate(data: BinaryData): Sinusoid[] {
    this.validateBinaryData(data);

    return data.map(bit => {
      const amplitude = bit === 1 ? this.A_one : this.A_zero;
      return new Sinusoid(amplitude, this.f_c, 0, 0);
    });
  }

  /**
   * Demodulate signal stream back to binary data
   * Uses threshold detection: amplitude > threshold → 1, else → 0
   */
  demodulate(signalStream: Sinusoid[]): BinaryData {
    const threshold = (this.A_one + this.A_zero) / 2;

    return signalStream.map(wave => {
      return wave.amplitude > threshold ? 1 : 0;
    }) as BinaryData;
  }
}
