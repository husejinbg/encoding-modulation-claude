import type { ModulatorInfo, ModulatorId } from '../types/modulator.types';

// Export modulator classes
export { ASK } from './ASK';
export { BFSK } from './BFSK';
export { BPSK } from './BPSK';
export { MFSK } from './MFSK';
export { QPSK } from './QPSK';
export { BaseModulator } from './BaseModulator';

/**
 * Modulator metadata registry
 * Contains UI configuration and parameter definitions for each modulator
 */
export const modulatorInfoMap: Record<ModulatorId, ModulatorInfo> = {
  'ask': {
    id: 'ask',
    displayName: 'ASK',
    description: 'Amplitude Shift Keying',
    parameters: [
      {
        key: 'f_c',
        label: 'Carrier Frequency (Hz)',
        defaultValue: 1000,
        min: 100,
        step: 100,
        unit: 'Hz'
      },
      {
        key: 'A_one',
        label: 'Amplitude for 1 (V)',
        defaultValue: 1,
        min: 0,
        step: 0.1,
        unit: 'V'
      },
      {
        key: 'A_zero',
        label: 'Amplitude for 0 (V)',
        defaultValue: 0,
        min: 0,
        step: 0.1,
        unit: 'V'
      }
    ]
  },
  'bfsk': {
    id: 'bfsk',
    displayName: 'BFSK',
    description: 'Binary Frequency Shift Keying',
    parameters: [
      {
        key: 'f_zero',
        label: 'Frequency for 0 (Hz)',
        defaultValue: 1000,
        min: 100,
        step: 100,
        unit: 'Hz'
      },
      {
        key: 'f_one',
        label: 'Frequency for 1 (Hz)',
        defaultValue: 2000,
        min: 100,
        step: 100,
        unit: 'Hz'
      },
      {
        key: 'A',
        label: 'Amplitude (V)',
        defaultValue: 1,
        min: 0.1,
        step: 0.1,
        unit: 'V'
      }
    ]
  },
  'bpsk': {
    id: 'bpsk',
    displayName: 'BPSK',
    description: 'Binary Phase Shift Keying',
    parameters: [
      {
        key: 'f_c',
        label: 'Carrier Frequency (Hz)',
        defaultValue: 1000,
        min: 100,
        step: 100,
        unit: 'Hz'
      },
      {
        key: 'A',
        label: 'Amplitude (V)',
        defaultValue: 1,
        min: 0.1,
        step: 0.1,
        unit: 'V'
      }
    ]
  },
  'mfsk': {
    id: 'mfsk',
    displayName: 'MFSK',
    description: 'Multiple Frequency Shift Keying (4-FSK)',
    parameters: [
      {
        key: 'f_0',
        label: 'Frequency for 00 (Hz)',
        defaultValue: 1000,
        min: 100,
        step: 100,
        unit: 'Hz'
      },
      {
        key: 'f_1',
        label: 'Frequency for 01 (Hz)',
        defaultValue: 1500,
        min: 100,
        step: 100,
        unit: 'Hz'
      },
      {
        key: 'f_2',
        label: 'Frequency for 10 (Hz)',
        defaultValue: 2000,
        min: 100,
        step: 100,
        unit: 'Hz'
      },
      {
        key: 'f_3',
        label: 'Frequency for 11 (Hz)',
        defaultValue: 2500,
        min: 100,
        step: 100,
        unit: 'Hz'
      },
      {
        key: 'A',
        label: 'Amplitude (V)',
        defaultValue: 1,
        min: 0.1,
        step: 0.1,
        unit: 'V'
      }
    ]
  },
  'qpsk': {
    id: 'qpsk',
    displayName: 'QPSK',
    description: 'Quadrature Phase Shift Keying',
    parameters: [
      {
        key: 'f_c',
        label: 'Carrier Frequency (Hz)',
        defaultValue: 1000,
        min: 100,
        step: 100,
        unit: 'Hz'
      },
      {
        key: 'A',
        label: 'Amplitude (V)',
        defaultValue: 1,
        min: 0.1,
        step: 0.1,
        unit: 'V'
      }
    ]
  }
};

/**
 * List of all modulators for dropdown/selection UI
 */
export const modulatorList = Object.values(modulatorInfoMap);
