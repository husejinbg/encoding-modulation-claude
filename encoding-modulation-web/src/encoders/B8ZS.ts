import { BaseEncoder } from './BaseEncoder';
import type { IViolationDetector } from '../types/encoder.types';
import type { BinaryData, EncodedSignal, SignalLevelValue } from '../types/signal.types';
import { SignalLevel } from '../types/signal.types';

export class B8ZS extends BaseEncoder implements IViolationDetector {
  readonly name = 'B8ZS';
  readonly description = 'Bipolar with 8-Zero Substitution';

  encode(data: BinaryData): EncodedSignal {
    this.validateBinaryData(data);

    // Pass 1: Basic Bipolar-AMI encoding
    let lastLevel: SignalLevelValue = SignalLevel.LOW;
    const result: EncodedSignal = [];

    for (const bit of data) {
      if (bit === 1) {
        lastLevel = lastLevel === SignalLevel.LOW ? SignalLevel.HIGH : SignalLevel.LOW;
        result.push(lastLevel);
      } else {
        result.push(SignalLevel.NO_LINE);
      }
    }

    // Pass 2: Find and replace 8-zero sequences with violation patterns
    let lastNonZero: SignalLevelValue = SignalLevel.LOW; // Default for edge case
    let i = 0;

    while (i < result.length) {
      // Track last non-zero pulse before checking for pattern
      if (result[i] !== SignalLevel.NO_LINE) {
        lastNonZero = result[i];
      }

      // Check if 8 consecutive zeros start at position i
      if (this.found8ZerosAt(result, i)) {
        const pattern = this.getSubstitutionPattern(lastNonZero);

        // Replace 8 zeros with pattern
        for (let j = 0; j < 8; j++) {
          result[i + j] = pattern[j];
        }

        // Update lastNonZero to the last pulse in the pattern (position 7)
        lastNonZero = pattern[7];

        // Skip past the substituted pattern
        i += 8;
      } else {
        i++;
      }
    }

    return result;
  }

  decode(signal: EncodedSignal): BinaryData {
    this.validateSignal(signal);

    // Create mutable copy for pattern replacement
    const mutableSignal = [...signal];

    // Detect and replace B8ZS patterns with zeros
    let i = 0;
    while (i < mutableSignal.length) {
      if (this.isB8ZSPatternAt(mutableSignal, i)) {
        // Replace pattern with 8 zeros
        for (let j = 0; j < 8; j++) {
          mutableSignal[i + j] = SignalLevel.NO_LINE;
        }
        i += 8;
      } else {
        i++;
      }
    }

    // Convert signal to binary: NO_LINE → 0, HIGH/LOW → 1
    return mutableSignal.map(level =>
      level === SignalLevel.NO_LINE ? 0 : 1
    ) as BinaryData;
  }

  hasViolations(signal: EncodedSignal): boolean {
    let lastNonZero: number | null = null;

    for (const level of signal) {
      if (level === SignalLevel.NO_LINE) continue;

      if (lastNonZero !== null && level === lastNonZero) {
        return true;
      }

      lastNonZero = level;
    }

    return false;
  }

  // Helper: Check if 8 consecutive NO_LINE values exist at index
  private found8ZerosAt(signal: EncodedSignal, index: number): boolean {
    if (index + 8 > signal.length) return false;

    for (let i = 0; i < 8; i++) {
      if (signal[index + i] !== SignalLevel.NO_LINE) {
        return false;
      }
    }

    return true;
  }

  // Helper: Get substitution pattern based on last pulse polarity
  private getSubstitutionPattern(lastPolarity: SignalLevelValue): EncodedSignal {
    if (lastPolarity === SignalLevel.HIGH) {
      // Pattern: 000+-0-+ → [NO_LINE × 3, HIGH, LOW, NO_LINE, LOW, HIGH]
      return [
        SignalLevel.NO_LINE,
        SignalLevel.NO_LINE,
        SignalLevel.NO_LINE,
        SignalLevel.HIGH,
        SignalLevel.LOW,
        SignalLevel.NO_LINE,
        SignalLevel.LOW,
        SignalLevel.HIGH,
      ];
    } else {
      // Pattern: 000-+0+- → [NO_LINE × 3, LOW, HIGH, NO_LINE, HIGH, LOW]
      return [
        SignalLevel.NO_LINE,
        SignalLevel.NO_LINE,
        SignalLevel.NO_LINE,
        SignalLevel.LOW,
        SignalLevel.HIGH,
        SignalLevel.NO_LINE,
        SignalLevel.HIGH,
        SignalLevel.LOW,
      ];
    }
  }

  // Helper: Verify B8ZS pattern signature at position
  private isB8ZSPatternAt(signal: EncodedSignal, index: number): boolean {
    // Check bounds
    if (index + 8 > signal.length) return false;

    // Positions 0, 1, 2 must be NO_LINE
    if (signal[index] !== SignalLevel.NO_LINE ||
        signal[index + 1] !== SignalLevel.NO_LINE ||
        signal[index + 2] !== SignalLevel.NO_LINE) {
      return false;
    }

    // Position 5 must be NO_LINE
    if (signal[index + 5] !== SignalLevel.NO_LINE) {
      return false;
    }

    // Positions 3, 4, 6, 7 must be non-zero
    if (signal[index + 3] === SignalLevel.NO_LINE ||
        signal[index + 4] === SignalLevel.NO_LINE ||
        signal[index + 6] === SignalLevel.NO_LINE ||
        signal[index + 7] === SignalLevel.NO_LINE) {
      return false;
    }

    // Find the last non-zero pulse before this potential pattern
    let lastNonZero: number | null = null;
    for (let i = index - 1; i >= 0; i--) {
      if (signal[i] !== SignalLevel.NO_LINE) {
        lastNonZero = signal[i];
        break;
      }
    }

    // Check violation signatures:
    // Position 3 should match last non-zero (violation)
    // Position 6 should match position 4 (violation)
    const hasViolation1 = lastNonZero !== null && signal[index + 3] === lastNonZero;
    const hasViolation2 = signal[index + 6] === signal[index + 4];

    // Check that positions 4 and 3 are opposite polarity
    const hasOppositePolarity = signal[index + 4] !== signal[index + 3];

    // Check that positions 7 and 6 are opposite polarity
    const hasOppositePolarity2 = signal[index + 7] !== signal[index + 6];

    return hasViolation1 && hasViolation2 && hasOppositePolarity && hasOppositePolarity2;
  }
}
