import React from 'react';
import type { AnalogModulatorId } from '../../../types/analog-modulator.types';
import { analogModulatorInfoMap } from '../../../analog-modulators';

interface ModulatorParametersProps {
  modulator: AnalogModulatorId;
  params: Record<string, number>;
  onChange: (key: string, value: number) => void;
}

export const ModulatorParameters: React.FC<ModulatorParametersProps> = ({
  modulator,
  params,
  onChange
}) => {
  const modulatorInfo = analogModulatorInfoMap[modulator];

  return (
    <div className="modulator-parameters">
      {modulatorInfo.parameters.map(param => (
        <div key={param.key} className="parameter-field">
          <label htmlFor={`param-${param.key}`} title={param.tooltip}>
            {param.label} {param.unit && `(${param.unit})`}:
          </label>
          <input
            id={`param-${param.key}`}
            type="number"
            value={params[param.key]}
            onChange={e => onChange(param.key, parseFloat(e.target.value) || param.defaultValue)}
            step={param.step}
            min={param.min}
            max={param.max}
            title={param.tooltip}
          />
        </div>
      ))}
    </div>
  );
};
