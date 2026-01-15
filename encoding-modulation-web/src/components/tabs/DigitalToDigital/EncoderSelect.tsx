import React from 'react';
import { encoderList } from '../../../encoders';
import type { EncoderId } from '../../../encoders';

interface EncoderSelectProps {
  selectedEncoder: EncoderId;
  onEncoderChange: (encoderId: EncoderId) => void;
}

export const EncoderSelect: React.FC<EncoderSelectProps> = ({
  selectedEncoder,
  onEncoderChange
}) => {
  return (
    <div className="encoder-select">
      <label htmlFor="encoder">Encoding Technique:</label>
      <select
        id="encoder"
        value={selectedEncoder}
        onChange={(e) => onEncoderChange(e.target.value as EncoderId)}
      >
        {encoderList.map((encoder) => (
          <option key={encoder.id} value={encoder.id}>
            {encoder.displayName}
          </option>
        ))}
      </select>
    </div>
  );
};
