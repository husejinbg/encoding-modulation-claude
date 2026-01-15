import type { BinaryData, BinaryBit } from '../types/signal.types';

/**
 * Parses a binary string into BinaryData array
 * Throws error if invalid
 */
export function parseBinaryString(input: string): BinaryData {
  // Remove whitespace
  const cleaned = input.trim().replace(/\s/g, '');

  if (cleaned.length === 0) {
    throw new Error('Binary string cannot be empty');
  }

  // Validate characters
  if (!/^[01]+$/.test(cleaned)) {
    throw new Error('Binary string must contain only 0 and 1');
  }

  // Convert to array of numbers
  return cleaned.split('').map(char => parseInt(char, 10) as BinaryBit);
}

/**
 * Validates binary data array
 */
export function validateBinaryData(data: BinaryData): void {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Binary data must be a non-empty array');
  }

  if (data.some(bit => bit !== 0 && bit !== 1)) {
    throw new Error('Binary data must contain only 0 and 1');
  }
}
