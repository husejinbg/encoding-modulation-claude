// @ts-ignore - fft-js doesn't have type definitions
import { fft, ifft } from 'fft-js';

/**
 * Compute Hilbert transform using FFT
 * Returns the analytic signal representation (real and imaginary parts)
 */
export function hilbertTransform(signal: number[]): { real: number[], imag: number[] } {
  // Pad to power of 2 for FFT efficiency
  const { padded, originalLength } = padToPowerOf2(signal);
  const paddedN = padded.length;

  // Compute FFT
  const phasors = fft(padded) as Array<[number, number]>;

  // Apply Hilbert filter: multiply by -i * sign(frequency)
  // This creates the analytic signal
  const filtered = phasors.map((phasor: [number, number], k: number): [number, number] => {
    // Calculate frequency index (handles negative frequencies)
    const freq = k < paddedN / 2 ? k : k - paddedN;

    // Sign: positive for positive frequencies, negative for negative, 0 for DC
    const sign = freq === 0 ? 0 : (freq > 0 ? 1 : -1);

    // Multiply phasor by -i * sign
    // (a + bi) * (-i * sign) = (b * sign) + (-a * sign)i
    return [phasor[1] * sign, -phasor[0] * sign];
  });

  // Inverse FFT to get analytic signal
  const analyticSignal = ifft(filtered) as Array<[number, number]>;

  // Trim back to original length
  return {
    real: analyticSignal.slice(0, originalLength).map((p: [number, number]) => p[0]),
    imag: analyticSignal.slice(0, originalLength).map((p: [number, number]) => p[1])
  };
}

/**
 * Integrate signal using cumulative sum
 * Equivalent to cumsum(signal) * dt in Python
 */
export function integrate(signal: number[], dt: number): number[] {
  const integrated: number[] = [];
  let sum = 0;

  for (const value of signal) {
    sum += value * dt;
    integrated.push(sum);
  }

  return integrated;
}

/**
 * Differentiate signal using forward differences
 * Returns diff(signal) / dt, padded to original length
 */
export function differentiate(signal: number[], dt: number): number[] {
  if (signal.length === 0) return [];
  if (signal.length === 1) return [0];

  const derivative: number[] = [];

  for (let i = 0; i < signal.length - 1; i++) {
    derivative.push((signal[i + 1] - signal[i]) / dt);
  }

  // Pad to match original length (prepend first value)
  derivative.unshift(derivative[0]);

  return derivative;
}

/**
 * Unwrap phase to remove 2π discontinuities
 * Equivalent to np.unwrap in Python
 */
export function unwrapPhase(phase: number[]): number[] {
  if (phase.length === 0) return [];

  const unwrapped = [phase[0]];
  let offset = 0;

  for (let i = 1; i < phase.length; i++) {
    let diff = phase[i] - phase[i - 1];

    // Detect jumps > π and adjust
    while (diff > Math.PI) {
      diff -= 2 * Math.PI;
      offset -= 2 * Math.PI;
    }
    while (diff < -Math.PI) {
      diff += 2 * Math.PI;
      offset += 2 * Math.PI;
    }

    unwrapped.push(phase[i] + offset);
  }

  return unwrapped;
}

/**
 * Compute phase angle from real and imaginary parts
 * Returns atan2(imag, real) for each point
 */
export function complexPhase(real: number[], imag: number[]): number[] {
  if (real.length !== imag.length) {
    throw new Error('Real and imaginary arrays must have same length');
  }

  return real.map((r, i) => Math.atan2(imag[i], r));
}

/**
 * Apply moving average filter to smooth signal
 * Used for low-pass filtering in AM demodulation
 */
export function movingAverage(signal: number[], windowSize: number): number[] {
  if (windowSize < 1) {
    throw new Error('Window size must be at least 1');
  }

  if (windowSize >= signal.length) {
    // If window is larger than signal, return average of entire signal
    const avg = signal.reduce((a, b) => a + b, 0) / signal.length;
    return Array(signal.length).fill(avg);
  }

  const filtered: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < signal.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(signal.length, i + halfWindow + 1);
    const sum = signal.slice(start, end).reduce((a, b) => a + b, 0);
    filtered.push(sum / (end - start));
  }

  return filtered;
}

/**
 * Pad signal to next power of 2 for FFT efficiency
 * Returns padded signal and original length
 */
function padToPowerOf2(signal: number[]): { padded: number[], originalLength: number } {
  const originalLength = signal.length;
  const nextPower = Math.pow(2, Math.ceil(Math.log2(originalLength)));

  if (nextPower === originalLength) {
    return { padded: signal, originalLength };
  }

  const padded = [...signal, ...Array(nextPower - originalLength).fill(0)];
  return { padded, originalLength };
}
