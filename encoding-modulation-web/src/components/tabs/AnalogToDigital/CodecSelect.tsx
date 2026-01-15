import React from 'react';
import { codecList } from '../../../codecs';
import type { CodecId } from '../../../types/codec.types';

interface CodecSelectProps {
  selectedCodec: CodecId;
  onChange: (codecId: CodecId) => void;
}

export const CodecSelect: React.FC<CodecSelectProps> = ({
  selectedCodec,
  onChange
}) => {
  return (
    <div className="codec-select">
      <label htmlFor="codec-select">Codec:</label>
      <select
        id="codec-select"
        value={selectedCodec}
        onChange={e => onChange(e.target.value as CodecId)}
      >
        {codecList.map(codec => (
          <option key={codec.id} value={codec.id}>
            {codec.displayName}
          </option>
        ))}
      </select>
    </div>
  );
};
