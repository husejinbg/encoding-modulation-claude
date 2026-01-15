import { BaseCodec } from './BaseCodec';
import type { IPCMCodec, DigitalData } from '../types/codec.types';

/**
 * Pulse Code Modulation (PCM) Codec
 *
 * Encoding: Quantizes analog samples to discrete levels
 * Decoding: Reconstructs analog signal from quantization indices
 *
 * Direct translation from Python analog_to_digital.py PCM class
 */
export class PCM extends BaseCodec implements IPCMCodec {
  readonly name = 'PCM';
  readonly description = 'Pulse Code Modulation';
  readonly nBits: number;
  readonly vMin: number;
  readonly vMax: number;
  readonly numLevels: number;
  readonly stepSize: number;

  constructor(nBits: number, vMin: number, vMax: number) {
    super();

    if (nBits < 1 || nBits > 16) {
      throw new Error('nBits must be between 1 and 16');
    }
    if (vMin >= vMax) {
      throw new Error('vMin must be less than vMax');
    }

    this.nBits = nBits;
    this.vMin = vMin;
    this.vMax = vMax;
    this.numLevels = 2 ** nBits;
    this.stepSize = (vMax - vMin) / this.numLevels;
  }

  /**
   * Encode analog samples to quantization indices
   * Returns array of integers in range [0, 2^nBits - 1]
   */
  encode(analogSamples: number[]): DigitalData {
    this.validateAnalogSamples(analogSamples);

    return analogSamples.map(sample => {
      // Normalize sample relative to vMin
      const normalized = sample - this.vMin;

      // Quantize to level index
      let levelIndex = Math.floor(normalized / this.stepSize);

      // Clamp to valid range [0, numLevels - 1]
      levelIndex = Math.max(0, Math.min(this.numLevels - 1, levelIndex));

      return levelIndex;
    });
  }

  /**
   * Decode quantization indices to analog samples
   * Reconstructs using midpoint of each quantization interval
   */
  decode(digitalData: DigitalData): number[] {
    this.validateDigitalData(digitalData);

    return digitalData.map(levelIndex => {
      // Reconstruct voltage at midpoint of quantization interval
      // This minimizes mean absolute error
      return this.vMin + (levelIndex * this.stepSize) + (this.stepSize / 2);
    });
  }
}
