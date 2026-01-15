import { BaseEncoder } from './BaseEncoder';
import type { IViolationDetector } from '../types/encoder.types';
import type { BinaryData, EncodedSignal, SignalLevelValue } from '../types/signal.types';
import { SignalLevel } from '../types/signal.types';

export class HDB3 extends BaseEncoder implements IViolationDetector {
  readonly name = 'HDB3';
  readonly description = 'High Density Bipolar 3 Zeros';

  encode(data: BinaryData): EncodedSignal {
    this.validateBinaryData(data);

    const result: EncodedSignal = [];
    let lastLevel: SignalLevelValue = SignalLevel.LOW; // Initialize to LOW so first HIGH is positive
    let pulseCount = 0; // Tracks pulses since the last substitution

    let i = 0;
    while (i < data.length) {
      // Check for 4 consecutive zeros in the input data
      let isFourZeros = false;
      if (i + 4 <= data.length) {
        isFourZeros = true;
        for (let j = 0; j < 4; j++) {
          if (data[i + j] !== 0) {
            isFourZeros = false;
            break;
          }
        }
      }

      if (isFourZeros) {
        // --- HDB3 Substitution Logic ---
        
        // Check parity of pulses since last substitution
        const isOdd = (pulseCount % 2 !== 0);

        if (isOdd) {
          // Pattern: 000V
          // V must match the polarity of the previous pulse
          const V: SignalLevelValue = lastLevel;
          result.push(SignalLevel.NO_LINE, SignalLevel.NO_LINE, SignalLevel.NO_LINE, V);
          
          lastLevel = V; // Update last level to V
          pulseCount = 0; // Reset pulse count after substitution
        } else {
          // Pattern: B00V
          // B must be opposite to the previous pulse
          const B: SignalLevelValue = (lastLevel === SignalLevel.LOW) ? SignalLevel.HIGH : SignalLevel.LOW;
          // V must match the polarity of B
          const V: SignalLevelValue = B;
          result.push(B, SignalLevel.NO_LINE, SignalLevel.NO_LINE, V);
          
          lastLevel = V; // Update last level to V
          pulseCount = 0; // Reset pulse count after substitution
        }

        // Advance index past the 4 zeros
        i += 4;
      } else {
        // --- Standard Bipolar-AMI Encoding ---
        
        if (data[i] === 1) {
          // Toggle polarity for valid data pulse
          lastLevel = (lastLevel === SignalLevel.LOW) ? SignalLevel.HIGH : SignalLevel.LOW;
          result.push(lastLevel);
          pulseCount++; // Increment pulse count
        } else {
          result.push(SignalLevel.NO_LINE);
        }
        
        i++;
      }
    }

    return result;
  }

  decode(signal: EncodedSignal): BinaryData {
    this.validateSignal(signal);

    // Create mutable copy for pattern replacement
    const mutableSignal = [...signal];

    // Detect and replace HDB3 patterns with zeros
    let i = 0;
    while (i < mutableSignal.length) {
      if (this.isHDB3PatternAt(mutableSignal, i)) {
        // Replace pattern with 4 zeros
        for (let j = 0; j < 4; j++) {
          mutableSignal[i + j] = SignalLevel.NO_LINE;
        }
        i += 4;
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

  // Helper: Verify HDB3 pattern signature at position
  private isHDB3PatternAt(signal: EncodedSignal, index: number): boolean {
    // Check bounds
    if (index + 4 > signal.length) return false;

    // Find the last non-zero pulse before this potential pattern
    let lastNonZero: number | null = null;
    for (let i = index - 1; i >= 0; i--) {
      if (signal[i] !== SignalLevel.NO_LINE) {
        lastNonZero = signal[i];
        break;
      }
    }

    // Check for 000V pattern:
    // Positions 0, 1, 2 are NO_LINE
    // Position 3 is non-zero and matches last non-zero (violation)
    if (signal[index] === SignalLevel.NO_LINE &&
        signal[index + 1] === SignalLevel.NO_LINE &&
        signal[index + 2] === SignalLevel.NO_LINE &&
        signal[index + 3] !== SignalLevel.NO_LINE) {

      // Check if position 3 creates a violation
      if (lastNonZero !== null && signal[index + 3] === lastNonZero) {
        return true; // 000V pattern detected
      }
    }

    // Check for B00V pattern:
    // Position 0 is non-zero
    // Positions 1, 2 are NO_LINE
    // Position 3 is non-zero and matches position 0 (violation)
    if (signal[index] !== SignalLevel.NO_LINE &&
        signal[index + 1] === SignalLevel.NO_LINE &&
        signal[index + 2] === SignalLevel.NO_LINE &&
        signal[index + 3] !== SignalLevel.NO_LINE) {

      // Check if positions 0 and 3 have same polarity (violation)
      if (signal[index] === signal[index + 3]) {
        return true; // B00V pattern detected
      }
    }

    return false;
  }
}
