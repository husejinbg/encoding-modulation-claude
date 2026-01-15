import React from 'react';

interface TransmitButtonProps {
  onClick: () => void;
}

export const TransmitButton: React.FC<TransmitButtonProps> = ({ onClick }) => {
  return (
    <button className="transmit-button" onClick={onClick}>
      Transmit
    </button>
  );
};
