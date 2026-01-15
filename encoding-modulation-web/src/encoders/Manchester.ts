import { BaseEncoder } from './BaseEncoder';
import type { BinaryData, EncodedSignal } from '../types/signal.types';
import { SignalLevel } from '../types/signal.types';

export class Manchester extends BaseEncoder {
  readonly name = 'Manchester';
  readonly description = 'Manchester Encoding: 0 = HIGH→LOW, 1 = LOW→HIGH';

  encode(data: BinaryData): EncodedSignal {
    this.validateBinaryData(data);

    const result: EncodedSignal = [];

    for (const bit of data) {
      if (bit === 1) {
        result.push(SignalLevel.LOW, SignalLevel.HIGH);
      } else {
        result.push(SignalLevel.HIGH, SignalLevel.LOW);
      }
    }

    return result;
  }

  decode(signal: EncodedSignal): BinaryData {
    this.validateSignal(signal);

    const result: BinaryData = [];

    for (let i = 0; i < signal.length; i += 2) {
      const pair = [signal[i], signal[i + 1]];

      if (pair[0] === SignalLevel.LOW && pair[1] === SignalLevel.HIGH) {
        result.push(1);
      } else {
        result.push(0);
      }
    }

    return result;
  }
}
