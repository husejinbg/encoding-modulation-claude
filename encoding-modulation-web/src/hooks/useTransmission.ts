import { useState, useCallback } from 'react';
import type { BinaryData, EncodedSignal } from '../types/signal.types';
import type { ChartDataset } from '../types/chart.types';
import {
  transformBinaryData,
  transformEncodedSignal
} from '../utils/chartHelpers';

interface UseTransmissionResult {
  chartData: ChartDataset | null;
  transmit: (
    originalData: BinaryData,
    encode: (data: BinaryData) => EncodedSignal,
    decode: (signal: EncodedSignal) => BinaryData
  ) => void;
  reset: () => void;
  hasViolation: boolean | null;
  setHasViolation: (value: boolean | null) => void;
}

export function useTransmission(): UseTransmissionResult {
  const [chartData, setChartData] = useState<ChartDataset | null>(null);
  const [hasViolation, setHasViolation] = useState<boolean | null>(null);

  const transmit = useCallback((
    originalData: BinaryData,
    encode: (data: BinaryData) => EncodedSignal,
    decode: (signal: EncodedSignal) => BinaryData
  ) => {
    // Encode
    const encodedSignal = encode(originalData);

    // Decode (simulate reception)
    const receivedData = decode(encodedSignal);

    // Transform for charts
    const dataset: ChartDataset = {
      sendData: transformBinaryData(originalData),
      encodedSignal: transformEncodedSignal(encodedSignal),
      receivedData: transformBinaryData(receivedData),
    };

    setChartData(dataset);
  }, []);

  const reset = useCallback(() => {
    setChartData(null);
    setHasViolation(null);
  }, []);

  return {
    chartData,
    transmit,
    reset,
    hasViolation,
    setHasViolation,
  };
}
