import { BaseEncoder } from './BaseEncoder';
import type { IViolationDetector } from '../types/encoder.types';
import type { BinaryData, EncodedSignal, SignalLevelValue } from '../types/signal.types';
import { SignalLevel } from '../types/signal.types';

export class BipolarAMI extends BaseEncoder implements IViolationDetector {
  readonly name = 'Bipolar-AMI';
  readonly description = 'Alternate Mark Inversion: 0 = NO_LINE, 1 = alternating HIGH/LOW';

  encode(data: BinaryData): EncodedSignal {
    this.validateBinaryData(data);

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

    return result;
  }

  decode(signal: EncodedSignal): BinaryData {
    this.validateSignal(signal);

    return signal.map(level =>
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
}
