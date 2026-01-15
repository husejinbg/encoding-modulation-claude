import { NRZ_L } from './NRZ_L';
import { NRZ_I } from './NRZ_I';
import { BipolarAMI } from './BipolarAMI';
import { Pseudoternary } from './Pseudoternary';
import { Manchester } from './Manchester';
import { DifferentialManchester } from './DifferentialManchester';
import type { EncoderInfo } from '../types/encoder.types';

// Encoder instances
export const encoders = {
  'nrz-l': new NRZ_L(),
  'nrz-i': new NRZ_I(),
  'bipolar-ami': new BipolarAMI(),
  'pseudoternary': new Pseudoternary(),
  'manchester': new Manchester(),
  'differential-manchester': new DifferentialManchester(),
} as const;

export type EncoderId = keyof typeof encoders;

// Encoder metadata for UI
export const encoderInfoMap: Record<EncoderId, EncoderInfo> = {
  'nrz-l': {
    id: 'nrz-l',
    displayName: 'NRZ-L',
    description: 'Non-Return-to-Zero-Level',
    producesDoubleLength: false,
    canDetectViolations: false,
  },
  'nrz-i': {
    id: 'nrz-i',
    displayName: 'NRZ-I',
    description: 'Non-Return-to-Zero-Inverted',
    producesDoubleLength: false,
    canDetectViolations: false,
  },
  'bipolar-ami': {
    id: 'bipolar-ami',
    displayName: 'Bipolar-AMI',
    description: 'Alternate Mark Inversion',
    producesDoubleLength: false,
    canDetectViolations: true,
  },
  'pseudoternary': {
    id: 'pseudoternary',
    displayName: 'Pseudoternary',
    description: 'Alternate Space Inversion',
    producesDoubleLength: false,
    canDetectViolations: true,
  },
  'manchester': {
    id: 'manchester',
    displayName: 'Manchester',
    description: 'Manchester Encoding (XOR with clock)',
    producesDoubleLength: true,
    canDetectViolations: false,
  },
  'differential-manchester': {
    id: 'differential-manchester',
    displayName: 'Differential Manchester',
    description: 'Differential Manchester Encoding',
    producesDoubleLength: true,
    canDetectViolations: false,
  },
};

export const encoderList = Object.values(encoderInfoMap);
