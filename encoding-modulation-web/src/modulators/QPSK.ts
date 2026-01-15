import { BaseModulator } from './BaseModulator';
import type { BinaryData } from '../types/signal.types';
import { Sinusoid } from '../utils/signalGeneration';

/**
 * QPSK (Quadrature Phase Shift Keying) Modulator
 * Uses 4 phase shifts to encode 2 bits per symbol
 * Standard constellation:
 * - 00: Phase = 45° (π/4 radians)
 * - 01: Phase = 135° (3π/4 radians)
 * - 10: Phase = 315° (-π/4 radians)
 * - 11: Phase = 225° (-3π/4 radians)
 */
export class QPSK extends BaseModulator {
  readonly name = 'QPSK';
  readonly description = 'Quadrature Phase Shift Keying: 4 phase shifts encode 2 bits per symbol';

  public f_c: number;      // Carrier frequency (Hz)
  public A: number;        // Amplitude (constant)

  constructor(f_c: number, A: number) {
    super();
    this.f_c = f_c;
    this.A = A;
  }

  /**
   * Modulate binary data into signal stream
   * Groups bits into pairs (symbols) and maps each to a phase shift
   */
  modulate(data: BinaryData): Sinusoid[] {
    this.validateBinaryData(data);

    // Pad data if odd length
    const paddedData = data.length % 2 === 0 ? data : [...data, 0];
    const signalStream: Sinusoid[] = [];

    // Process data in pairs (2 bits per symbol)
    for (let i = 0; i < paddedData.length; i += 2) {
      const bit1 = paddedData[i];
      const bit2 = paddedData[i + 1];

      // Map bit pair to phase (in radians)
      let phase: number;
      if (bit1 === 0 && bit2 === 0) {
        phase = Math.PI / 4;        // 45°
      } else if (bit1 === 0 && bit2 === 1) {
        phase = 3 * Math.PI / 4;    // 135°
      } else if (bit1 === 1 && bit2 === 0) {
        phase = -Math.PI / 4;       // 315° (or -45°)
      } else {
        phase = -3 * Math.PI / 4;   // 225° (or -135°)
      }

      signalStream.push(new Sinusoid(this.A, this.f_c, phase, 0));
    }

    return signalStream;
  }

  /**
   * Demodulate signal stream back to binary data
   * Maps phase back to bit pairs using quadrant detection
   */
  demodulate(signalStream: Sinusoid[]): BinaryData {
    const result: BinaryData = [];

    for (const wave of signalStream) {
      // Normalize phase to [-π, π] range
      let phase = wave.phase;
      while (phase > Math.PI) phase -= 2 * Math.PI;
      while (phase < -Math.PI) phase += 2 * Math.PI;

      // Map phase to bit pair using quadrant detection
      // Quadrant boundaries: -3π/4, -π/4, π/4, 3π/4
      if (phase >= -Math.PI / 2 && phase < 0) {
        // Quadrant IV: -π/4 → 10
        result.push(1, 0);
      } else if (phase >= 0 && phase < Math.PI / 2) {
        // Quadrant I: π/4 → 00
        result.push(0, 0);
      } else if (phase >= Math.PI / 2 && phase <= Math.PI) {
        // Quadrant II: 3π/4 → 01
        result.push(0, 1);
      } else {
        // Quadrant III: -3π/4 → 11
        result.push(1, 1);
      }
    }

    return result as BinaryData;
  }
}
