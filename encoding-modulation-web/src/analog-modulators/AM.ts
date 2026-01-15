import { BaseAnalogModulator } from './BaseAnalogModulator';
import { movingAverage } from '../utils/signalProcessing';

/**
 * Amplitude Modulation (AM)
 * The amplitude of the carrier signal varies with the message signal.
 */
export class AM extends BaseAnalogModulator {
  readonly name = 'AM';
  readonly description = 'Amplitude Modulation';

  private f_c: number;  // Carrier frequency (Hz)
  private A_c: number;  // Carrier amplitude
  private ka: number;   // Amplitude sensitivity (modulation index)

  /**
   * Create an AM modulator
   * @param f_c - Carrier frequency in Hz (default: 1000)
   * @param A_c - Carrier amplitude (default: 1.0)
   * @param ka - Amplitude sensitivity/modulation index, 0 < ka ≤ 1 (default: 1.0)
   */
  constructor(f_c: number = 1000, A_c: number = 1.0, ka: number = 1.0) {
    super();
    this.f_c = f_c;
    this.A_c = A_c;
    this.ka = ka;

    if (ka <= 0 || ka > 1) {
      console.warn('Modulation index ka should be in range (0, 1] for proper AM');
    }
  }

  /**
   * Modulate message signal using AM
   * Formula: s(t) = A_c * [1 + ka * m(t)] * cos(2π * f_c * t)
   */
  modulate(messageSignal: number[], t: number[]): number[] {
    this.validateArrays(messageSignal, t);

    const modulated: number[] = [];

    for (let i = 0; i < messageSignal.length; i++) {
      // Generate carrier signal
      const carrier = Math.cos(2 * Math.PI * this.f_c * t[i]);

      // Apply amplitude modulation
      const envelope = this.A_c * (1 + this.ka * messageSignal[i]);
      modulated.push(envelope * carrier);
    }

    return modulated;
  }

  /**
   * Demodulate AM signal using envelope detection
   * Simplified approach: rectify and low-pass filter
   */
  demodulate(modulatedSignal: number[], t: number[]): number[] {
    this.validateArrays(modulatedSignal, t);

    // Step 1: Envelope detection (rectification)
    const envelope = modulatedSignal.map(value => Math.abs(value));

    // Step 2: Remove DC component and divide by sensitivity
    // envelope ≈ A_c * (1 + ka * m(t))
    // So: m(t) ≈ (envelope / A_c - 1) / ka
    const recovered = envelope.map(value => (value / this.A_c - 1) / this.ka);

    // Step 3: Low-pass filter using moving average
    // Calculate window size based on carrier frequency and signal duration
    const signalDuration = t[t.length - 1] - t[0];
    let windowSize = Math.max(3, Math.floor(recovered.length / (10 * this.f_c * signalDuration)));

    // Make window size odd
    if (windowSize % 2 === 0) {
      windowSize += 1;
    }

    // Ensure window size doesn't exceed signal length
    windowSize = Math.min(windowSize, recovered.length);

    const filtered = movingAverage(recovered, windowSize);

    return filtered;
  }
}
