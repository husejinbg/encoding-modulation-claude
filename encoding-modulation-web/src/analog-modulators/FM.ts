import { BaseAnalogModulator } from './BaseAnalogModulator';
import { integrate, differentiate, hilbertTransform, complexPhase, unwrapPhase } from '../utils/signalProcessing';

/**
 * Frequency Modulation (FM)
 * The frequency of the carrier signal varies with the message signal.
 */
export class FM extends BaseAnalogModulator {
  readonly name = 'FM';
  readonly description = 'Frequency Modulation';

  private f_c: number;  // Carrier frequency (Hz)
  private A_c: number;  // Carrier amplitude
  private kf: number;   // Frequency sensitivity (Hz per unit of message amplitude)

  /**
   * Create an FM modulator
   * @param f_c - Carrier frequency in Hz (default: 1000)
   * @param A_c - Carrier amplitude (default: 1.0)
   * @param kf - Frequency sensitivity in Hz (default: 100)
   */
  constructor(f_c: number = 1000, A_c: number = 1.0, kf: number = 100) {
    super();
    this.f_c = f_c;
    this.A_c = A_c;
    this.kf = kf;
  }

  /**
   * Modulate message signal using FM
   * Formula: s(t) = A_c * cos(2π * f_c * t + 2π * kf * ∫m(τ)dτ)
   */
  modulate(messageSignal: number[], t: number[]): number[] {
    this.validateArrays(messageSignal, t);

    // Calculate time step
    const dt = t.length > 1 ? t[1] - t[0] : 1.0;

    // Integrate message signal using cumulative sum
    const integratedMessage = integrate(messageSignal, dt);

    // Generate FM signal
    const modulated: number[] = [];

    for (let i = 0; i < messageSignal.length; i++) {
      // Phase: φ(t) = 2π * f_c * t + 2π * kf * ∫m(τ)dτ
      const phase = 2 * Math.PI * this.f_c * t[i] + 2 * Math.PI * this.kf * integratedMessage[i];
      modulated.push(this.A_c * Math.cos(phase));
    }

    return modulated;
  }

  /**
   * Demodulate FM signal using frequency detection
   * Uses Hilbert transform to extract instantaneous frequency
   */
  demodulate(modulatedSignal: number[], t: number[]): number[] {
    this.validateArrays(modulatedSignal, t);

    // Step 1: Extract analytic signal using Hilbert transform
    const { real, imag } = hilbertTransform(modulatedSignal);

    // Step 2: Extract instantaneous phase
    const instantaneousPhase = complexPhase(real, imag);

    // Step 3: Unwrap phase to avoid discontinuities
    const unwrappedPhase = unwrapPhase(instantaneousPhase);

    // Step 4: Compute instantaneous frequency: f(t) = (1/2π) * dφ/dt
    const dt = t.length > 1 ? t[1] - t[0] : 1.0;
    const phaseDerivative = differentiate(unwrappedPhase, dt);

    // Convert phase derivative to frequency (divide by 2π)
    const instantaneousFrequency = phaseDerivative.map(value => value / (2 * Math.PI));

    // Step 5: Remove carrier frequency to get message: m(t) = (f(t) - f_c) / kf
    const recovered = instantaneousFrequency.map(freq => (freq - this.f_c) / this.kf);

    return recovered;
  }
}
