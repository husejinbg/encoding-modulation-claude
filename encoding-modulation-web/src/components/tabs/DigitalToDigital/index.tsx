import React, { useState } from 'react';
import { EncoderSelect } from './EncoderSelect';
import { BinaryInput } from './BinaryInput';
import { TransmitButton } from './TransmitButton';
import { BinaryPlot } from '../../common/BinaryPlot';
import { DigitalPlot } from '../../common/DigitalPlot';
import { useEncoder } from '../../../hooks/useEncoder';
import { useTransmission } from '../../../hooks/useTransmission';
import { parseBinaryString } from '../../../utils/validation';
import { encoderInfoMap } from '../../../encoders';
import type { EncodedSignal } from '../../../types/signal.types';
import './DigitalToDigital.css';

export const DigitalToDigital: React.FC = () => {
  const [binaryInput, setBinaryInput] = useState('1101001');
  const [inputError, setInputError] = useState<string | null>(null);

  const {
    selectedEncoder,
    setSelectedEncoder,
    encode,
    decode,
    checkViolations
  } = useEncoder();

  const {
    chartData,
    transmit,
    reset,
    hasViolation,
    setHasViolation
  } = useTransmission();

  const handleTransmit = () => {
    try {
      // Parse and validate input
      const binaryData = parseBinaryString(binaryInput);

      // Clear previous errors
      setInputError(null);

      // Perform transmission
      transmit(binaryData, encode, decode);

      // Check for violations (if applicable)
      const encodedSignal = encode(binaryData);
      const violation = checkViolations(encodedSignal);
      setHasViolation(violation);

    } catch (error) {
      setInputError(error instanceof Error ? error.message : 'Invalid input');
      reset();
    }
  };

  const encoderInfo = encoderInfoMap[selectedEncoder];

  return (
    <div className="digital-to-digital-tab">
      <div className="controls">
        <EncoderSelect
          selectedEncoder={selectedEncoder}
          onEncoderChange={setSelectedEncoder}
        />

        <BinaryInput
          value={binaryInput}
          onChange={setBinaryInput}
          error={inputError}
        />

        <TransmitButton onClick={handleTransmit} />

        {hasViolation !== null && encoderInfo.canDetectViolations && (
          <div className={`violation-alert ${hasViolation ? 'error' : 'success'}`}>
            {hasViolation
              ? 'Warning: Bipolar violations detected!'
              : 'No violations detected'}
          </div>
        )}
      </div>

      <div className="plots-container">
        {chartData ? (
          <>
            <BinaryPlot
              data={chartData.sendData}
              title="Send Data (Original Binary)"
            />

            <DigitalPlot
              data={chartData.encodedSignal}
              title={`Encoded Signal (${encoderInfo.displayName})`}
              rawSignal={chartData.encodedSignal.map(p => p.level) as EncodedSignal}
            />

            <BinaryPlot
              data={chartData.receivedData}
              title="Received Data (Decoded Binary)"
            />
          </>
        ) : (
          <div className="empty-state">
            <p>Enter binary data and click Transmit to see the encoding</p>
          </div>
        )}
      </div>

      <div className="config-panel">
        <h3>Encoder Information</h3>
        <p><strong>Technique:</strong> {encoderInfo.displayName}</p>
        <p><strong>Description:</strong> {encoderInfo.description}</p>
        {encoderInfo.producesDoubleLength && (
          <p className="info">Note: This encoding produces 2x signal length</p>
        )}
      </div>
    </div>
  );
};
