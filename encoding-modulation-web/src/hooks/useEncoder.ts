import { useState, useCallback } from 'react';
import { encoders } from '../encoders';
import type { EncoderId } from '../encoders';
import type { BinaryData, EncodedSignal } from '../types/signal.types';
import type { IViolationDetector } from '../types/encoder.types';

interface UseEncoderResult {
  selectedEncoder: EncoderId;
  setSelectedEncoder: (id: EncoderId) => void;
  encode: (data: BinaryData) => EncodedSignal;
  decode: (signal: EncodedSignal) => BinaryData;
  checkViolations: (signal: EncodedSignal) => boolean | null;
}

export function useEncoder(initialEncoder: EncoderId = 'nrz-l'): UseEncoderResult {
  const [selectedEncoder, setSelectedEncoder] = useState<EncoderId>(initialEncoder);

  const encode = useCallback((data: BinaryData): EncodedSignal => {
    const encoder = encoders[selectedEncoder];
    return encoder.encode(data);
  }, [selectedEncoder]);

  const decode = useCallback((signal: EncodedSignal): BinaryData => {
    const encoder = encoders[selectedEncoder];
    return encoder.decode(signal);
  }, [selectedEncoder]);

  const checkViolations = useCallback((signal: EncodedSignal): boolean | null => {
    const encoder = encoders[selectedEncoder];

    if ('hasViolations' in encoder) {
      return (encoder as IViolationDetector).hasViolations(signal);
    }

    return null; // Encoder doesn't support violation detection
  }, [selectedEncoder]);

  return {
    selectedEncoder,
    setSelectedEncoder,
    encode,
    decode,
    checkViolations,
  };
}
