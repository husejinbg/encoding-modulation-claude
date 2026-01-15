import { BaseEncoder } from './BaseEncoder';
import type { BinaryData, EncodedSignal, SignalLevelValue } from '../types/signal.types';
import { SignalLevel } from '../types/signal.types';

export class NRZ_I extends BaseEncoder {
  readonly name = 'NRZ-I';
  readonly description = 'Non-Return-to-Zero-Inverted: Transition on 1, no transition on 0';

  encode(data: BinaryData): EncodedSignal {
    this.validateBinaryData(data);

    let lastLevel: SignalLevelValue = SignalLevel.LOW;
    const result: EncodedSignal = [];

    for (const bit of data) {
      if (bit === 1) {
        lastLevel = lastLevel === SignalLevel.LOW ? SignalLevel.HIGH : SignalLevel.LOW;
      }
      result.push(lastLevel);
    }

    return result;
  }

  decode(signal: EncodedSignal): BinaryData {
    this.validateSignal(signal);

    const result: BinaryData = [];
    let previousLevel: SignalLevelValue = SignalLevel.LOW;

    for (const level of signal) {
      if (level !== previousLevel) {
        result.push(1);
      } else {
        result.push(0);
      }
      previousLevel = level;
    }

    return result;
  }
}
