import React from 'react';
import type { SinusoidParams } from '../../../types/analog.types';

interface SinusoidInputsProps {
  sinusoids: SinusoidParams[];
  onChange: (sinusoids: SinusoidParams[]) => void;
}

export const SinusoidInputs: React.FC<SinusoidInputsProps> = ({
  sinusoids,
  onChange
}) => {
  const handleAdd = () => {
    const newSinusoid: SinusoidParams = {
      id: Date.now().toString(),
      amplitude: 1,
      frequency: 5,
      phase: 0,
      verticalOffset: 0
    };
    onChange([...sinusoids, newSinusoid]);
  };

  const handleRemove = (id: string) => {
    if (sinusoids.length > 1) {
      onChange(sinusoids.filter(s => s.id !== id));
    }
  };

  const handleUpdate = (id: string, field: keyof SinusoidParams, value: number) => {
    onChange(sinusoids.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  // Convert phase from degrees to radians for display
  const radiansToDegrees = (radians: number) => (radians * 180 / Math.PI);
  const degreesToRadians = (degrees: number) => (degrees * Math.PI / 180);

  return (
    <div className="sinusoid-inputs">
      <label>Sinusoids:</label>
      <div className="sinusoid-list">
        {sinusoids.map(sinusoid => (
          <div key={sinusoid.id} className="sinusoid-row">
            <div className="sinusoid-field">
              <label>A:</label>
              <input
                type="number"
                value={sinusoid.amplitude}
                onChange={e => handleUpdate(sinusoid.id, 'amplitude', parseFloat(e.target.value) || 0)}
                step={0.1}
                min={0.1}
              />
            </div>

            <div className="sinusoid-field">
              <label>f (Hz):</label>
              <input
                type="number"
                value={sinusoid.frequency}
                onChange={e => handleUpdate(sinusoid.id, 'frequency', parseFloat(e.target.value) || 1)}
                step={0.1}
                min={0.1}
              />
            </div>

            <div className="sinusoid-field">
              <label>φ (deg):</label>
              <input
                type="number"
                value={radiansToDegrees(sinusoid.phase).toFixed(1)}
                onChange={e => handleUpdate(sinusoid.id, 'phase', degreesToRadians(parseFloat(e.target.value) || 0))}
                step={10}
              />
            </div>

            <div className="sinusoid-field">
              <label>D:</label>
              <input
                type="number"
                value={sinusoid.verticalOffset}
                onChange={e => handleUpdate(sinusoid.id, 'verticalOffset', parseFloat(e.target.value) || 0)}
                step={0.1}
              />
            </div>

            <button
              className="remove-button"
              onClick={() => handleRemove(sinusoid.id)}
              disabled={sinusoids.length === 1}
              title="Remove sinusoid"
            >
              ×
            </button>
          </div>
        ))}

        <button className="add-button" onClick={handleAdd}>
          Add Sinusoid
        </button>
      </div>
    </div>
  );
};
