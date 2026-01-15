import { useState, useCallback } from 'react';
import type { AnalogToAnalogChartDataset } from '../types/chart.types';
import type { SinusoidParams } from '../types/analog.types';
import type { IAnalogModulator } from '../types/analog-modulator.types';
import { CompositeSignal, Sinusoid } from '../utils/signalGeneration';

interface UseAnalogToAnalogTransmissionResult {
  chartData: AnalogToAnalogChartDataset | null;
  numSamples: number;
  transmit: (params: TransmissionParams) => void;
  reset: () => void;
}

interface TransmissionParams {
  sinusoidParams: SinusoidParams[];
  duration: number;
  samplingRate: number;
  modulator: IAnalogModulator;
}

/**
 * Hook to orchestrate analog-to-analog transmission:
 * Analog Signal → Modulated Analog Signal → Received Analog Signal
 */
export function useAnalogToAnalogTransmission(): UseAnalogToAnalogTransmissionResult {
  const [chartData, setChartData] = useState<AnalogToAnalogChartDataset | null>(null);
  const [numSamples, setNumSamples] = useState<number>(0);

  const transmit = useCallback((params: TransmissionParams) => {
    const { sinusoidParams, duration, samplingRate, modulator } = params;

    // 1. Create composite signal from sinusoid parameters
    const sinusoids = sinusoidParams.map(p => Sinusoid.fromParams(p));
    const composite = new CompositeSignal(sinusoids);

    // 2. Generate high-resolution analog signal for display (1000 samples/sec)
    const sendAnalog = composite.generateContinuousSignal(duration, 1000);

    // 3. Generate sampled signal for modulation at specified sampling rate
    const samples = composite.generateSamples(duration, samplingRate);
    const timeArray = Array.from({ length: samples.length }, (_, i) => i / samplingRate);

    // 4. Modulate the message signal
    const modulatedSamples = modulator.modulate(samples, timeArray);
    const modulatedAnalog = modulatedSamples.map((value, i) => ({
      time: timeArray[i],
      value
    }));

    // 5. Demodulate to recover the message signal
    const recoveredSamples = modulator.demodulate(modulatedSamples, timeArray);
    const receivedAnalog = recoveredSamples.map((value, i) => ({
      time: timeArray[i],
      value
    }));

    setChartData({
      sendAnalog,
      modulatedAnalog,
      receivedAnalog
    });

    setNumSamples(samples.length);
  }, []);

  const reset = useCallback(() => {
    setChartData(null);
    setNumSamples(0);
  }, []);

  return { chartData, numSamples, transmit, reset };
}
