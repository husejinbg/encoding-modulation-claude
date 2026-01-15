import { BaseEncoder } from './BaseEncoder';
import type { BinaryData, EncodedSignal, SignalLevelValue } from '../types/signal.types';
import { SignalLevel } from '../types/signal.types';

export class DifferentialManchester extends BaseEncoder {
  readonly name = 'Differential Manchester';
  readonly description = 'Differential Manchester: 0 = transition at start, 1 = no transition at start';

  encode(data: BinaryData): EncodedSignal {
    this.validateBinaryData(data);

    let lastLevel: SignalLevelValue = SignalLevel.LOW;
    const result: EncodedSignal = [];

    for (const bit of data) {
      if (bit === 0) {
        // Transition at beginning
        lastLevel = lastLevel === SignalLevel.LOW ? SignalLevel.HIGH : SignalLevel.LOW;
      }
      result.push(lastLevel);

      // Transition in the middle (always)
      lastLevel = lastLevel === SignalLevel.LOW ? SignalLevel.HIGH : SignalLevel.LOW;
      result.push(lastLevel);
    }

    return result;
  }

  decode(signal: EncodedSignal): BinaryData {
    this.validateSignal(signal);

    const result: BinaryData = [];
    let previousLevel: SignalLevelValue = SignalLevel.LOW;

    for (let i = 0; i < signal.length; i += 2) {
      const firstHalf = signal[i];

      if (firstHalf !== previousLevel) {
        result.push(0);
      } else {
        result.push(1);
      }

      previousLevel = signal[i + 1];
    }

    return result;
  }
}
