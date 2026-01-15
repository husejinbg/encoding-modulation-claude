import React from 'react';
import { modulatorList } from '../../../modulators';
import type { ModulatorId } from '../../../types/modulator.types';

interface ModulatorSelectProps {
  selectedModulator: ModulatorId;
  onChange: (modulatorId: ModulatorId) => void;
}

/**
 * Dropdown component for selecting modulation technique
 */
export const ModulatorSelect: React.FC<ModulatorSelectProps> = ({
  selectedModulator,
  onChange
}) => {
  return (
    <div className="modulator-select">
      <label htmlFor="modulator-select">Modulation Technique:</label>
      <select
        id="modulator-select"
        value={selectedModulator}
        onChange={e => onChange(e.target.value as ModulatorId)}
      >
        {modulatorList.map(mod => (
          <option key={mod.id} value={mod.id}>
            {mod.displayName}
          </option>
        ))}
      </select>
    </div>
  );
};
