import type { SinusoidParams, AnalogSignal } from '../types/analog.types';

/**
 * Sinusoid class representing a single sinusoidal waveform
 * Formula: y(t) = A * sin(2π * f * t + φ) + D
 */
export class Sinusoid {
  public amplitude: number;
  public frequency: number;
  public phase: number;
  public verticalOffset: number;

  constructor(
    amplitude: number,      // A: amplitude
    frequency: number,       // f: frequency (Hz)
    phase: number,          // φ: phase in radians
    verticalOffset: number  // D: vertical offset
  ) {
    this.amplitude = amplitude;
    this.frequency = frequency;
    this.phase = phase;
    this.verticalOffset = verticalOffset;
  }

  /**
   * Evaluate the sinusoid at time t
   */
  evaluate(t: number): number {
    return (
      this.amplitude * Math.sin(2 * Math.PI * this.frequency * t + this.phase) +
      this.verticalOffset
    );
  }

  /**
   * Get the maximum value of this sinusoid
   */
  maxValue(): number {
    return this.amplitude + this.verticalOffset;
  }

  /**
   * Get the minimum value of this sinusoid
   */
  minValue(): number {
    return -this.amplitude + this.verticalOffset;
  }

  /**
   * Create a Sinusoid from SinusoidParams interface
   */
  static fromParams(params: SinusoidParams): Sinusoid {
    return new Sinusoid(
      params.amplitude,
      params.frequency,
      params.phase,
      params.verticalOffset
    );
  }
}

/**
 * CompositeSignal representing the sum of multiple sinusoids
 */
export class CompositeSignal {
  public sinusoids: Sinusoid[];

  constructor(sinusoids: Sinusoid[]) {
    this.sinusoids = sinusoids;
  }

  /**
   * Evaluate the composite signal at time t (sum of all sinusoids)
   */
  evaluate(t: number): number {
    return this.sinusoids.reduce((sum, sin) => sum + sin.evaluate(t), 0);
  }

  /**
   * Get the Nyquist sampling rate (2 × maximum frequency)
   * Required to avoid aliasing in signal reconstruction
   */
  getNyquistRate(): number {
    const maxFreq = Math.max(...this.sinusoids.map(s => s.frequency));
    return 2 * maxFreq;
  }

  /**
   * Get the amplitude range (min and max values) of the composite signal
   */
  getAmplitudeRange(): { min: number; max: number } {
    const min = Math.min(...this.sinusoids.map(s => s.minValue()));
    const max = Math.max(...this.sinusoids.map(s => s.maxValue()));
    return { min, max };
  }

  /**
   * Generate samples at specified sampling rate for encoding
   * Returns array of sample values (not time-value pairs)
   */
  generateSamples(duration: number, samplingRate: number): number[] {
    const numSamples = Math.floor(duration * samplingRate);
    const samples: number[] = [];

    for (let i = 0; i < numSamples; i++) {
      const t = i / samplingRate;
      samples.push(this.evaluate(t));
    }

    return samples;
  }

  /**
   * Generate continuous signal for smooth visualization
   * Returns time-value pairs for plotting
   */
  generateContinuousSignal(
    duration: number,
    pointsPerSecond: number = 1000
  ): AnalogSignal {
    const numPoints = Math.floor(duration * pointsPerSecond);
    const points: AnalogSignal = [];

    for (let i = 0; i < numPoints; i++) {
      const t = i / pointsPerSecond;
      points.push({ time: t, value: this.evaluate(t) });
    }

    return points;
  }
}

/**
 * Convert modulator signal stream to continuous analog signal for plotting
 *
 * Each Sinusoid in the signal stream represents one bit period.
 * This function samples each Sinusoid over its bit duration and concatenates
 * all samples into a single continuous AnalogSignal for visualization.
 *
 * @param signalStream - Array of Sinusoid objects (one per bit)
 * @param bitDuration - Duration of each bit in seconds
 * @param samplesPerBit - Number of samples per bit for smooth plotting (default: 100)
 * @returns AnalogSignal with time-value pairs for plotting
 */
export function modulatorSignalToAnalog(
  signalStream: Sinusoid[],
  bitDuration: number,
  samplesPerBit: number = 100
): AnalogSignal {
  const points: AnalogSignal = [];

  signalStream.forEach((sinusoid, bitIndex) => {
    const bitStartTime = bitIndex * bitDuration;

    // Generate samples for this bit period
    for (let i = 0; i < samplesPerBit; i++) {
      // Absolute time for the plot
      const t = bitStartTime + (i / samplesPerBit) * bitDuration;

      // Time relative to bit start (for sinusoid evaluation)
      const relativeT = (i / samplesPerBit) * bitDuration;

      // Evaluate sinusoid at relative time
      points.push({ time: t, value: sinusoid.evaluate(relativeT) });
    }
  });

  // Add final point at exact end time to avoid floating-point precision issues
  if (signalStream.length > 0) {
    const lastSinusoid = signalStream[signalStream.length - 1];
    const exactEndTime = bitDuration * signalStream.length;
    points.push({ time: exactEndTime, value: lastSinusoid.evaluate(bitDuration) });
  }

  return points;
}
