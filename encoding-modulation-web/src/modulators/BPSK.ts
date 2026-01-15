import { BaseModulator } from './BaseModulator';
import type { BinaryData } from '../types/signal.types';
import { Sinusoid } from '../utils/signalGeneration';

/**
 * BPSK (Binary Phase Shift Keying) Modulator
 * Bits are represented by phase shifts
 * - Binary 1: Phase 0 (normal phase)
 * - Binary 0: Phase π (180 degrees, inverted)
 */
export class BPSK extends BaseModulator {
  readonly name = 'BPSK';
  readonly description = 'Binary Phase Shift Keying: Bits represented by phase shifts';

  public f_c: number;      // Carrier frequency (Hz)
  public A: number;        // Amplitude (constant)

  constructor(f_c: number, A: number) {
    super();
    this.f_c = f_c;
    this.A = A;
  }

  /**
   * Modulate binary data into signal stream
   * Each bit becomes a Sinusoid with phase based on bit value
   */
  modulate(data: BinaryData): Sinusoid[] {
    this.validateBinaryData(data);

    return data.map(bit => {
      const phase = bit === 1 ? 0 : Math.PI;  // 0 for 1, π (180°) for 0
      return new Sinusoid(this.A, this.f_c, phase, 0);
    });
  }

  /**
   * Demodulate signal stream back to binary data
   * Uses phase comparison with tolerance for floating-point precision
   */
  demodulate(signalStream: Sinusoid[]): BinaryData {
    return signalStream.map(wave => {
      // Check if phase is close to 0 (tolerance for floating-point comparison)
      return Math.abs(wave.phase) < 0.1 ? 1 : 0;
    }) as BinaryData;
  }
}
