import { BaseAnalogModulator } from './BaseAnalogModulator';
import { hilbertTransform, complexPhase, unwrapPhase } from '../utils/signalProcessing';

/**
 * Phase Modulation (PM)
 * The phase of the carrier signal varies with the message signal.
 */
export class PM extends BaseAnalogModulator {
  readonly name = 'PM';
  readonly description = 'Phase Modulation';

  private f_c: number;  // Carrier frequency (Hz)
  private A_c: number;  // Carrier amplitude
  private kp: number;   // Phase sensitivity (radians per unit of message amplitude)

  /**
   * Create a PM modulator
   * @param f_c - Carrier frequency in Hz (default: 1000)
   * @param A_c - Carrier amplitude (default: 1.0)
   * @param kp - Phase sensitivity in radians (default: π/2)
   */
  constructor(f_c: number = 1000, A_c: number = 1.0, kp: number = Math.PI / 2) {
    super();
    this.f_c = f_c;
    this.A_c = A_c;
    this.kp = kp;
  }

  /**
   * Modulate message signal using PM
   * Formula: s(t) = A_c * cos(2π * f_c * t + kp * m(t))
   */
  modulate(messageSignal: number[], t: number[]): number[] {
    this.validateArrays(messageSignal, t);

    const modulated: number[] = [];

    for (let i = 0; i < messageSignal.length; i++) {
      // Phase: φ(t) = 2π * f_c * t + kp * m(t)
      const phase = 2 * Math.PI * this.f_c * t[i] + this.kp * messageSignal[i];
      modulated.push(this.A_c * Math.cos(phase));
    }

    return modulated;
  }

  /**
   * Demodulate PM signal using phase detection
   * Uses Hilbert transform to extract instantaneous phase
   */
  demodulate(modulatedSignal: number[], t: number[]): number[] {
    this.validateArrays(modulatedSignal, t);

    // Step 1: Extract analytic signal using Hilbert transform
    const { real, imag } = hilbertTransform(modulatedSignal);

    // Step 2: Extract instantaneous phase
    const instantaneousPhase = complexPhase(real, imag);

    // Step 3: Unwrap phase to avoid discontinuities
    const unwrappedPhase = unwrapPhase(instantaneousPhase);

    // Step 4: Remove carrier phase: m(t) = (φ(t) - 2π*f_c*t) / kp
    const recovered: number[] = [];

    for (let i = 0; i < unwrappedPhase.length; i++) {
      const carrierPhase = 2 * Math.PI * this.f_c * t[i];
      recovered.push((unwrappedPhase[i] - carrierPhase) / this.kp);
    }

    return recovered;
  }
}
