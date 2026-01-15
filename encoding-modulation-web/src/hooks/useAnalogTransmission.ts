import { useState, useCallback } from 'react';
import type { AnalogToDigitalChartDataset } from '../types/chart.types';
import type { SinusoidParams } from '../types/analog.types';
import type { ICodec, IPCMCodec } from '../types/codec.types';
import type { IEncoder } from '../types/encoder.types';
import type { BinaryData } from '../types/signal.types';
import { CompositeSignal, Sinusoid } from '../utils/signalGeneration';
import { transformEncodedSignal } from '../utils/chartHelpers';

interface UseAnalogTransmissionResult {
  chartData: AnalogToDigitalChartDataset | null;
  numSamples: number;
  numBits: number;
  transmit: (params: TransmissionParams) => void;
  reset: () => void;
}

interface TransmissionParams {
  sinusoidParams: SinusoidParams[];
  duration: number;
  samplingRate: number;
  codec: ICodec;
  encoder: IEncoder;
}

/**
 * Hook to orchestrate two-stage analog-to-digital transmission:
 * 1. Analog Signal → Digital Data (PCM/DM encoding)
 * 2. Digital Data → Digital Signal (digital-to-digital encoding)
 */
export function useAnalogTransmission(): UseAnalogTransmissionResult {
  const [chartData, setChartData] = useState<AnalogToDigitalChartDataset | null>(null);
  const [numSamples, setNumSamples] = useState<number>(0);
  const [numBits, setNumBits] = useState<number>(0);

  const transmit = useCallback((params: TransmissionParams) => {
    const { sinusoidParams, duration, samplingRate, codec, encoder } = params;

    // 1. Create composite signal from sinusoid parameters
    const sinusoids = sinusoidParams.map(p => Sinusoid.fromParams(p));
    const composite = new CompositeSignal(sinusoids);

    // 2. Generate high-resolution analog signal for display
    const sendAnalog = composite.generateContinuousSignal(duration, 1000);

    // 3. Sample analog signal at specified sampling rate
    const samples = composite.generateSamples(duration, samplingRate);

    // 4. STAGE 1: Analog → Digital Data (using codec: PCM or DM)
    const digitalData = codec.encode(samples);

    // 5. Convert digital data to binary (PCM only)
    const binaryData = convertToBinaryData(digitalData, codec);

    // 6. STAGE 2: Binary Data → Digital Signal (using encoder)
    const encodedSignal = encoder.encode(binaryData);

    // 7. DECODE: Digital Signal → Binary Data
    const decodedBinary = encoder.decode(encodedSignal);

    // 8. Convert binary back to digital data (PCM only)
    const decodedDigitalData = convertFromBinaryData(decodedBinary, codec);

    // 9. DECODE: Digital Data → Analog Samples
    const reconstructedSamples = codec.decode(decodedDigitalData);

    // 10. Create time-aligned analog signal for display
    const receivedAnalog = reconstructedSamples.map((value, i) => ({
      time: i / samplingRate,
      value
    }));

    // 11. Transform encoded signal for step chart visualization
    const encodedDigital = transformEncodedSignal(encodedSignal);

    setChartData({
      sendAnalog,
      encodedDigital,
      receivedAnalog
    });

    // Store counts for scrolling calculation
    setNumSamples(samples.length);
    setNumBits(binaryData.length);
  }, []);

  const reset = useCallback(() => {
    setChartData(null);
    setNumSamples(0);
    setNumBits(0);
  }, []);

  return { chartData, numSamples, numBits, transmit, reset };
}

/**
 * Convert digital data to binary representation
 * PCM: Each quantization index → n_bits binary digits
 * DM: Already binary, pass through
 */
function convertToBinaryData(digitalData: number[], codec: ICodec): BinaryData {
  if (isPCMCodec(codec)) {
    // PCM: convert each integer to binary array
    const nBits = codec.nBits;
    const binaryArray: number[] = [];

    for (const value of digitalData) {
      const binary = value.toString(2).padStart(nBits, '0');
      binaryArray.push(...binary.split('').map(Number));
    }

    return binaryArray as BinaryData;
  } else {
    // DM: already binary bits
    return digitalData as BinaryData;
  }
}

/**
 * Convert binary representation back to digital data
 * PCM: Every n_bits binary digits → one quantization index
 * DM: Already binary, pass through
 */
function convertFromBinaryData(binaryData: BinaryData, codec: ICodec): number[] {
  if (isPCMCodec(codec)) {
    // PCM: convert binary array back to integers
    const nBits = codec.nBits;
    const digitalData: number[] = [];

    for (let i = 0; i < binaryData.length; i += nBits) {
      const chunk = binaryData.slice(i, i + nBits);
      const value = parseInt(chunk.join(''), 2);
      digitalData.push(value);
    }

    return digitalData;
  } else {
    // DM: already binary bits
    return Array.from(binaryData);
  }
}

/**
 * Type guard to check if codec is PCM (has nBits property)
 */
function isPCMCodec(codec: ICodec): codec is IPCMCodec {
  return 'nBits' in codec;
}
