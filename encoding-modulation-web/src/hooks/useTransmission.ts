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
  elapsedTime: number | null;
}

export function useTransmission(): UseTransmissionResult {
  const [chartData, setChartData] = useState<ChartDataset | null>(null);
  const [hasViolation, setHasViolation] = useState<boolean | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);

  const transmit = useCallback((
    originalData: BinaryData,
    encode: (data: BinaryData) => EncodedSignal,
    decode: (signal: EncodedSignal) => BinaryData
  ) => {
    const startTime = performance.now();

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

    const endTime = performance.now();
    setElapsedTime(endTime - startTime);
  }, []);

  const reset = useCallback(() => {
    setChartData(null);
    setHasViolation(null);
    setElapsedTime(null);
  }, []);

  return {
    chartData,
    transmit,
    reset,
    hasViolation,
    setHasViolation,
    elapsedTime,
  };
}
