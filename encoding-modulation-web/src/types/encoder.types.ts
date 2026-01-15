import type { BinaryData, EncodedSignal } from './signal.types';

// Base encoder interface
export interface IEncoder {
  readonly name: string;
  readonly description: string;

  encode(data: BinaryData): EncodedSignal;
  decode(signal: EncodedSignal): BinaryData;
}

// Extended interface for encoders that can have violations
export interface IViolationDetector extends IEncoder {
  hasViolations(signal: EncodedSignal): boolean;
}

// Encoder metadata for UI
export interface EncoderInfo {
  id: string;
  displayName: string;
  description: string;
  producesDoubleLength: boolean; // Manchester, Differential Manchester
  canDetectViolations: boolean;   // Bipolar-AMI, Pseudoternary
}
