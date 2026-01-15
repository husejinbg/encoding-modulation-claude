// Sinusoid parameters for user input
export interface SinusoidParams {
  id: string;              // Unique identifier for React keys
  amplitude: number;       // A: amplitude
  frequency: number;       // f: frequency (Hz)
  phase: number;          // phi: phase in radians
  verticalOffset: number; // D: vertical offset
}

// Analog signal sample point for plotting
export interface AnalogSamplePoint {
  time: number;   // Time in seconds
  value: number;  // Signal amplitude value
}

// Type for analog waveform data (array of time-value pairs)
export type AnalogSignal = AnalogSamplePoint[];

// Voltage range for PCM codec
export interface VoltageRange {
  min: number;
  max: number;
}
