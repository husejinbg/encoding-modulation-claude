import { NRZ_L } from './NRZ_L';
import { NRZ_I } from './NRZ_I';
import { BipolarAMI } from './BipolarAMI';
import { Pseudoternary } from './Pseudoternary';
import { Manchester } from './Manchester';
import { DifferentialManchester } from './DifferentialManchester';
import { B8ZS } from './B8ZS';
import { HDB3 } from './HDB3';
import type { EncoderInfo } from '../types/encoder.types';

// Encoder instances
export const encoders = {
  'nrz-l': new NRZ_L(),
  'nrz-i': new NRZ_I(),
  'bipolar-ami': new BipolarAMI(),
  'pseudoternary': new Pseudoternary(),
  'manchester': new Manchester(),
  'differential-manchester': new DifferentialManchester(),
  'b8zs': new B8ZS(),
  'hdb3': new HDB3(),
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
  'b8zs': {
    id: 'b8zs',
    displayName: 'B8ZS',
    description: 'Bipolar with 8-Zero Substitution',
    producesDoubleLength: false,
    canDetectViolations: true,
  },
  'hdb3': {
    id: 'hdb3',
    displayName: 'HDB3',
    description: 'High Density Bipolar 3 Zeros',
    producesDoubleLength: false,
    canDetectViolations: true,
  },
};

export const encoderList = Object.values(encoderInfoMap);
