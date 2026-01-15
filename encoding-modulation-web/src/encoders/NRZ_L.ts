import { BaseEncoder } from './BaseEncoder';
import type { BinaryData, EncodedSignal } from '../types/signal.types';
import { SignalLevel } from '../types/signal.types';

export class NRZ_L extends BaseEncoder {
  readonly name = 'NRZ-L';
  readonly description = 'Non-Return-to-Zero-Level: 0 = HIGH, 1 = LOW';

  encode(data: BinaryData): EncodedSignal {
    this.validateBinaryData(data);

    return data.map(bit =>
      bit === 1 ? SignalLevel.LOW : SignalLevel.HIGH
    );
  }

  decode(signal: EncodedSignal): BinaryData {
    this.validateSignal(signal);

    return signal.map(level =>
      level === SignalLevel.LOW ? 1 : 0
    ) as BinaryData;
  }
}
