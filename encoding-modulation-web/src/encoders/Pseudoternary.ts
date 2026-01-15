import { BaseEncoder } from './BaseEncoder';
import type { IViolationDetector } from '../types/encoder.types';
import type { BinaryData, EncodedSignal, SignalLevelValue } from '../types/signal.types';
import { SignalLevel } from '../types/signal.types';

export class Pseudoternary extends BaseEncoder implements IViolationDetector {
  readonly name = 'Pseudoternary';
  readonly description = 'Alternate Space Inversion: 0 = alternating HIGH/LOW, 1 = NO_LINE';

  encode(data: BinaryData): EncodedSignal {
    this.validateBinaryData(data);

    let lastLevel: SignalLevelValue = SignalLevel.LOW;
    const result: EncodedSignal = [];

    for (const bit of data) {
      if (bit === 0) {
        lastLevel = lastLevel === SignalLevel.LOW ? SignalLevel.HIGH : SignalLevel.LOW;
        result.push(lastLevel);
      } else {
        result.push(SignalLevel.NO_LINE);
      }
    }

    return result;
  }

  decode(signal: EncodedSignal): BinaryData {
    this.validateSignal(signal);

    return signal.map(level =>
      level === SignalLevel.NO_LINE ? 1 : 0
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
}
