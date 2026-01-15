import { BaseModulator } from './BaseModulator';
import type { BinaryData } from '../types/signal.types';
import { Sinusoid } from '../utils/signalGeneration';

/**
 * MFSK (Multiple Frequency Shift Keying) Modulator
 * Uses 4 different frequencies to encode 2 bits per symbol (4-FSK)
 * - 00: Frequency f_0
 * - 01: Frequency f_1
 * - 10: Frequency f_2
 * - 11: Frequency f_3
 */
export class MFSK extends BaseModulator {
  readonly name = 'MFSK';
  readonly description = 'Multiple Frequency Shift Keying: 4 frequencies encode 2 bits per symbol';

  public f_0: number;      // Frequency for 00 (Hz)
  public f_1: number;      // Frequency for 01 (Hz)
  public f_2: number;      // Frequency for 10 (Hz)
  public f_3: number;      // Frequency for 11 (Hz)
  public A: number;        // Amplitude (constant)

  constructor(f_0: number, f_1: number, f_2: number, f_3: number, A: number) {
    super();
    this.f_0 = f_0;
    this.f_1 = f_1;
    this.f_2 = f_2;
    this.f_3 = f_3;
    this.A = A;
  }

  /**
   * Modulate binary data into signal stream
   * Groups bits into pairs (symbols) and maps each to a frequency
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

      // Map bit pair to frequency
      let frequency: number;
      if (bit1 === 0 && bit2 === 0) {
        frequency = this.f_0;  // 00
      } else if (bit1 === 0 && bit2 === 1) {
        frequency = this.f_1;  // 01
      } else if (bit1 === 1 && bit2 === 0) {
        frequency = this.f_2;  // 10
      } else {
        frequency = this.f_3;  // 11
      }

      signalStream.push(new Sinusoid(this.A, frequency, 0, 0));
    }

    return signalStream;
  }

  /**
   * Demodulate signal stream back to binary data
   * Maps frequency back to bit pairs
   */
  demodulate(signalStream: Sinusoid[]): BinaryData {
    const result: BinaryData = [];

    for (const wave of signalStream) {
      // Find closest frequency match (allows for floating-point tolerance)
      const frequencies = [this.f_0, this.f_1, this.f_2, this.f_3];
      const distances = frequencies.map(f => Math.abs(wave.frequency - f));
      const minIndex = distances.indexOf(Math.min(...distances));

      // Map frequency index to bit pair
      switch (minIndex) {
        case 0: // f_0 → 00
          result.push(0, 0);
          break;
        case 1: // f_1 → 01
          result.push(0, 1);
          break;
        case 2: // f_2 → 10
          result.push(1, 0);
          break;
        case 3: // f_3 → 11
          result.push(1, 1);
          break;
      }
    }

    return result as BinaryData;
  }
}
