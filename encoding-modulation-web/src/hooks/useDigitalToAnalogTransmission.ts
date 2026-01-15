import { useState, useCallback } from 'react';
import type { DigitalToAnalogChartDataset, IModulator } from '../types/modulator.types';
import type { BinaryData } from '../types/signal.types';
import { transformBinaryData } from '../utils/chartHelpers';
import { modulatorSignalToAnalog } from '../utils/signalGeneration';

interface UseDigitalToAnalogTransmissionResult {
  chartData: DigitalToAnalogChartDataset | null;
  transmit: (params: TransmissionParams) => void;
  reset: () => void;
}

interface TransmissionParams {
  binaryData: BinaryData;
  modulator: IModulator;
  bitDuration: number;
  samplesPerBit?: number;
}

/**
 * Hook to orchestrate digital-to-analog modulation/demodulation
 *
 * Flow:
 * 1. Binary Data → Modulator.modulate() → Signal Stream (Sinusoid array)
 * 2. Signal Stream → Sample over bit durations → Analog Signal for plotting
 * 3. Signal Stream → Modulator.demodulate() → Received Binary Data
 */
export function useDigitalToAnalogTransmission(): UseDigitalToAnalogTransmissionResult {
  const [chartData, setChartData] = useState<DigitalToAnalogChartDataset | null>(null);

  const transmit = useCallback((params: TransmissionParams) => {
    const { binaryData, modulator, bitDuration, samplesPerBit = 100 } = params;

    // 1. Modulate: Binary Data → Signal Stream (array of Sinusoid objects)
    const signalStream = modulator.modulate(binaryData);

    // 2. Convert signal stream to continuous analog signal for plotting
    const modulatedSignal = modulatorSignalToAnalog(signalStream, bitDuration, samplesPerBit);

    // 3. Demodulate: Signal Stream → Binary Data (simulate reception)
    const receivedData = modulator.demodulate(signalStream);

    // 4. Transform binary data for chart display
    const dataset: DigitalToAnalogChartDataset = {
      sendData: transformBinaryData(binaryData),
      modulatedSignal,
      receivedData: transformBinaryData(receivedData)
    };

    setChartData(dataset);
  }, []);

  const reset = useCallback(() => {
    setChartData(null);
  }, []);

  return { chartData, transmit, reset };
}
