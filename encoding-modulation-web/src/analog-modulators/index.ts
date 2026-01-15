import type { AnalogModulatorInfo, AnalogModulatorId } from '../types/analog-modulator.types';

// Export modulator classes
export { AM } from './AM';
export { FM } from './FM';
export { PM } from './PM';

/**
 * Analog modulator metadata for UI display
 */
export const analogModulatorInfoMap: Record<AnalogModulatorId, AnalogModulatorInfo> = {
  'am': {
    id: 'am',
    displayName: 'AM',
    description: 'Amplitude Modulation',
    parameters: [
      {
        key: 'f_c',
        label: 'Carrier Frequency',
        defaultValue: 1000,
        min: 100,
        step: 100,
        unit: 'Hz'
      },
      {
        key: 'A_c',
        label: 'Carrier Amplitude',
        defaultValue: 1.0,
        min: 0.1,
        step: 0.1,
        unit: 'V'
      },
      {
        key: 'ka',
        label: 'Amplitude Sensitivity',
        defaultValue: 1.0,
        min: 0.1,
        max: 1.0,
        step: 0.1,
        unit: '',
        tooltip: 'Modulation index (0 < ka ≤ 1)'
      }
    ]
  },
  'fm': {
    id: 'fm',
    displayName: 'FM',
    description: 'Frequency Modulation',
    parameters: [
      {
        key: 'f_c',
        label: 'Carrier Frequency',
        defaultValue: 1000,
        min: 100,
        step: 100,
        unit: 'Hz'
      },
      {
        key: 'A_c',
        label: 'Carrier Amplitude',
        defaultValue: 1.0,
        min: 0.1,
        step: 0.1,
        unit: 'V'
      },
      {
        key: 'kf',
        label: 'Frequency Sensitivity',
        defaultValue: 100,
        min: 10,
        step: 10,
        unit: 'Hz',
        tooltip: 'Hz per unit message amplitude'
      }
    ]
  },
  'pm': {
    id: 'pm',
    displayName: 'PM',
    description: 'Phase Modulation',
    parameters: [
      {
        key: 'f_c',
        label: 'Carrier Frequency',
        defaultValue: 1000,
        min: 100,
        step: 100,
        unit: 'Hz'
      },
      {
        key: 'A_c',
        label: 'Carrier Amplitude',
        defaultValue: 1.0,
        min: 0.1,
        step: 0.1,
        unit: 'V'
      },
      {
        key: 'kp',
        label: 'Phase Sensitivity',
        defaultValue: Math.PI / 2,
        min: 0.1,
        step: 0.1,
        unit: 'rad',
        tooltip: 'Radians per unit message amplitude'
      }
    ]
  }
};

/**
 * Convenience export for dropdowns
 */
export const analogModulatorList = Object.values(analogModulatorInfoMap);
