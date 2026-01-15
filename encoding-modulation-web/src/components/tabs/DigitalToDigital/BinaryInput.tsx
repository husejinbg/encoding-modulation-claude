import React from 'react';

interface BinaryInputProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

export const BinaryInput: React.FC<BinaryInputProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <div className="binary-input">
      <label htmlFor="binary-data">Binary Data:</label>
      <input
        id="binary-data"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., 1101001"
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
