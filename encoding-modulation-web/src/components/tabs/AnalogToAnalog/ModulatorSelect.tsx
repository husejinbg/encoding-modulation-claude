import React from 'react';
import type { AnalogModulatorId } from '../../../types/analog-modulator.types';
import { analogModulatorList } from '../../../analog-modulators';

interface ModulatorSelectProps {
  selectedModulator: AnalogModulatorId;
  onChange: (modulator: AnalogModulatorId) => void;
}

export const ModulatorSelect: React.FC<ModulatorSelectProps> = ({
  selectedModulator,
  onChange
}) => {
  return (
    <div className="modulator-select">
      <label htmlFor="modulator">Modulation Technique:</label>
      <select
        id="modulator"
        value={selectedModulator}
        onChange={e => onChange(e.target.value as AnalogModulatorId)}
      >
        {analogModulatorList.map(modulator => (
          <option key={modulator.id} value={modulator.id}>
            {modulator.displayName} - {modulator.description}
          </option>
        ))}
      </select>
    </div>
  );
};
