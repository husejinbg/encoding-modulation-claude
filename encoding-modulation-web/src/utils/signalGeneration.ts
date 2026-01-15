import type { SinusoidParams, AnalogSignal } from '../types/analog.types';

// =============================================================================
// SINUSOID CLASS
// =============================================================================

/**
 * Represents a single sinusoidal waveform.
 *
 * Mathematical formula: y(t) = A × sin(2π × f × t + φ) + D
 *
 * Where:
 * - A = amplitude (peak deviation from center)
 * - f = frequency in Hz (cycles per second)
 * - φ = phase in radians (horizontal shift)
 * - D = vertical offset (DC component)
 *
 * @example
 * // Create a 5 Hz sine wave with amplitude 2
 * const sine = new Sinusoid(2, 5, 0, 0);
 * const valueAtT1 = sine.evaluate(1.0); // Value at t=1 second
 */
export class Sinusoid {
  public amplitude: number;
  public frequency: number;
  public phase: number;
  public verticalOffset: number;

  // Pre-computed constant for performance (2π × frequency)
  private readonly angularFrequency: number;

  constructor(
    amplitude: number,       // A: amplitude
    frequency: number,       // f: frequency (Hz)
    phase: number,           // φ: phase in radians
    verticalOffset: number   // D: vertical offset
  ) {
    this.amplitude = amplitude;
    this.frequency = frequency;
    this.phase = phase;
    this.verticalOffset = verticalOffset;

    // Pre-compute angular frequency to avoid repeated multiplication in evaluate()
    this.angularFrequency = 2 * Math.PI * frequency;
  }

  /**
   * Evaluate the sinusoid at time t.
   *
   * Uses pre-computed angular frequency for better performance when
   * called repeatedly (e.g., generating thousands of samples).
   *
   * @param t - Time in seconds
   * @returns Signal value at time t
   */
  evaluate(t: number): number {
    return (
      this.amplitude * Math.sin(this.angularFrequency * t + this.phase) +
      this.verticalOffset
    );
  }

  /**
   * Get the maximum possible value of this sinusoid.
   * Occurs when sin() = 1.
   */
  maxValue(): number {
    return this.amplitude + this.verticalOffset;
  }

  /**
   * Get the minimum possible value of this sinusoid.
   * Occurs when sin() = -1.
   */
  minValue(): number {
    return -this.amplitude + this.verticalOffset;
  }

  /**
   * Factory method to create a Sinusoid from SinusoidParams interface.
   *
   * @param params - Object containing amplitude, frequency, phase, verticalOffset
   * @returns New Sinusoid instance
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

// =============================================================================
// COMPOSITE SIGNAL CLASS
// =============================================================================

/**
 * Represents a composite signal formed by summing multiple sinusoids.
 *
 * Used to model complex analog signals that are the superposition of
 * multiple frequency components (common in real-world signals).
 *
 * @example
 * const sinusoids = [
 *   new Sinusoid(1, 5, 0, 0),   // 5 Hz component
 *   new Sinusoid(0.5, 10, 0, 0) // 10 Hz component
 * ];
 * const composite = new CompositeSignal(sinusoids);
 * const nyquist = composite.getNyquistRate(); // 20 Hz
 */
export class CompositeSignal {
  public sinusoids: Sinusoid[];

  constructor(sinusoids: Sinusoid[]) {
    this.sinusoids = sinusoids;
  }

  /**
   * Evaluate the composite signal at time t.
   *
   * Returns the sum of all sinusoid values at the given time point.
   * This is the superposition principle applied to signal addition.
   *
   * @param t - Time in seconds
   * @returns Combined signal value at time t
   */
  evaluate(t: number): number {
    let sum = 0;
    // Use simple for loop instead of reduce for better performance
    for (let i = 0; i < this.sinusoids.length; i++) {
      sum += this.sinusoids[i].evaluate(t);
    }
    return sum;
  }

  /**
   * Get the Nyquist sampling rate (2 × maximum frequency).
   *
   * According to the Nyquist-Shannon sampling theorem, to accurately
   * reconstruct a signal, it must be sampled at least twice the highest
   * frequency component.
   *
   * Optimized: Uses single-pass loop instead of map+spread to avoid
   * creating intermediate arrays.
   *
   * @returns Minimum required sampling rate in Hz
   */
  getNyquistRate(): number {
    if (this.sinusoids.length === 0) return 0;

    let maxFreq = 0;
    for (const sinusoid of this.sinusoids) {
      if (sinusoid.frequency > maxFreq) {
        maxFreq = sinusoid.frequency;
      }
    }
    return 2 * maxFreq;
  }

  /**
   * Get the amplitude range (min and max possible values) of the composite signal.
   *
   * Note: This calculates the theoretical worst-case range by summing individual
   * component ranges. The actual signal may have a smaller range due to phase
   * relationships between components.
   *
   * Optimized: Uses single-pass loop instead of two separate map+spread calls
   * to avoid creating intermediate arrays.
   *
   * @returns Object with min and max values
   */
  getAmplitudeRange(): { min: number; max: number } {
    if (this.sinusoids.length === 0) {
      return { min: 0, max: 0 };
    }

    // Sum the min/max contributions from each sinusoid
    // This gives the theoretical range of the composite signal
    let totalMin = 0;
    let totalMax = 0;

    for (const sinusoid of this.sinusoids) {
      totalMin += sinusoid.minValue();
      totalMax += sinusoid.maxValue();
    }

    return { min: totalMin, max: totalMax };
  }

  /**
   * Generate discrete samples at specified sampling rate for encoding.
   *
   * Used as input to A/D converters (PCM, DM). Returns only values,
   * not time-value pairs, as the codec only needs amplitude data.
   *
   * Optimized:
   * - Pre-allocates array to avoid dynamic resizing
   * - Pre-computes inverse sampling rate to replace division with multiplication
   *
   * Time complexity: O(n × m) where n=samples, m=sinusoids
   * Space complexity: O(n) pre-allocated
   *
   * @param duration - Signal duration in seconds
   * @param samplingRate - Samples per second (Hz)
   * @returns Array of sample amplitude values
   */
  generateSamples(duration: number, samplingRate: number): number[] {
    const numSamples = Math.floor(duration * samplingRate);

    // Pre-allocate array to avoid dynamic resizing (significant speedup for large arrays)
    const samples = new Array<number>(numSamples);

    // Pre-compute inverse to replace division with multiplication in loop
    const invSamplingRate = 1 / samplingRate;

    for (let i = 0; i < numSamples; i++) {
      const t = i * invSamplingRate;
      samples[i] = this.evaluate(t);
    }

    return samples;
  }

  /**
   * Generate continuous signal for smooth visualization.
   *
   * Creates time-value pairs suitable for plotting with Recharts.
   * Default resolution of 1000 points/second provides smooth curves
   * while maintaining reasonable performance.
   *
   * Optimized:
   * - Pre-allocates array to avoid dynamic resizing
   * - Pre-computes inverse to replace division with multiplication
   *
   * Time complexity: O(n × m) where n=points, m=sinusoids
   * Space complexity: O(n) pre-allocated
   *
   * @param duration - Signal duration in seconds
   * @param pointsPerSecond - Resolution for visualization (default: 1000)
   * @returns Array of {time, value} points for plotting
   */
  generateContinuousSignal(
    duration: number,
    pointsPerSecond: number = 1000
  ): AnalogSignal {
    const numPoints = Math.floor(duration * pointsPerSecond);

    // Pre-allocate array for better performance
    const points = new Array<{ time: number; value: number }>(numPoints);

    // Pre-compute inverse to replace division with multiplication in loop
    const invPointsPerSecond = 1 / pointsPerSecond;

    for (let i = 0; i < numPoints; i++) {
      const t = i * invPointsPerSecond;
      points[i] = { time: t, value: this.evaluate(t) };
    }

    return points;
  }
}

// =============================================================================
// MODULATOR SIGNAL CONVERSION
// =============================================================================

/**
 * Convert modulator signal stream to continuous analog signal for plotting.
 *
 * In digital-to-analog modulation (ASK, FSK, PSK), each bit is represented
 * by a specific sinusoidal waveform over a fixed bit duration. This function
 * concatenates these per-bit sinusoids into a continuous signal for visualization.
 *
 * Optimized:
 * - Pre-allocates array based on total expected points
 * - Pre-computes repeated values outside inner loop
 * - Uses direct array assignment instead of push()
 *
 * Time complexity: O(b × s) where b=bits, s=samplesPerBit
 * Space complexity: O(b × s + 1) pre-allocated
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
  const numBits = signalStream.length;

  if (numBits === 0) {
    return [];
  }

  // Pre-allocate array: (samples per bit × number of bits) + 1 final point
  const totalPoints = numBits * samplesPerBit + 1;
  const points = new Array<{ time: number; value: number }>(totalPoints);

  // Pre-compute time increment within each bit
  const timeIncrementPerSample = bitDuration / samplesPerBit;

  let pointIndex = 0;

  for (let bitIndex = 0; bitIndex < numBits; bitIndex++) {
    const sinusoid = signalStream[bitIndex];
    const bitStartTime = bitIndex * bitDuration;

    // Generate samples for this bit period
    for (let i = 0; i < samplesPerBit; i++) {
      // Absolute time for the plot
      const t = bitStartTime + i * timeIncrementPerSample;

      // Time relative to bit start (for sinusoid evaluation)
      const relativeT = i * timeIncrementPerSample;

      // Evaluate sinusoid at relative time and store directly in pre-allocated array
      points[pointIndex++] = { time: t, value: sinusoid.evaluate(relativeT) };
    }
  }

  // Add final point at exact end time to avoid floating-point precision issues
  const lastSinusoid = signalStream[numBits - 1];
  const exactEndTime = bitDuration * numBits;
  points[pointIndex] = { time: exactEndTime, value: lastSinusoid.evaluate(bitDuration) };

  return points;
}
