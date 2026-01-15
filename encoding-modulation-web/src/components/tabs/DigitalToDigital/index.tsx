import React, { useState, useMemo, useCallback } from 'react';
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

/**
 * Digital-to-Digital encoding visualization tab.
 *
 * Allows users to:
 * - Enter binary data
 * - Select an encoder (NRZ-L, NRZ-I, Manchester, etc.)
 * - Visualize the encoding/decoding process
 * - Detect bipolar violations (for applicable encoders)
 */
export const DigitalToDigital: React.FC = () => {
  // Input state
  const [binaryInput, setBinaryInput] = useState('1101001');
  const [inputError, setInputError] = useState<string | null>(null);

  // Encoder hook provides encode/decode functions
  const {
    selectedEncoder,
    setSelectedEncoder,
    encode,
    decode,
    checkViolations
  } = useEncoder();

  // Transmission hook manages chart data and timing
  const {
    chartData,
    transmit,
    reset,
    hasViolation,
    setHasViolation,
    elapsedTime
  } = useTransmission();

  // Memoize handleTransmit to prevent unnecessary re-renders of child components
  const handleTransmit = useCallback(() => {
    try {
      // Parse and validate input
      const binaryData = parseBinaryString(binaryInput);

      // Clear previous errors
      setInputError(null);

      // Perform transmission (encode → decode cycle)
      transmit(binaryData, encode, decode);

      // Check for bipolar violations (if encoder supports it)
      const encodedSignal = encode(binaryData);
      const violation = checkViolations(encodedSignal);
      setHasViolation(violation);

    } catch (error) {
      setInputError(error instanceof Error ? error.message : 'Invalid input');
      reset();
    }
  }, [binaryInput, encode, decode, transmit, checkViolations, setHasViolation, reset]);

  // Memoize encoder info lookup
  const encoderInfo = useMemo(
    () => encoderInfoMap[selectedEncoder],
    [selectedEncoder]
  );

  // Memoize raw signal extraction to avoid creating new array on every render
  // This is needed for DigitalPlot's domain calculation
  const rawSignal = useMemo((): EncodedSignal | undefined => {
    if (!chartData) return undefined;
    // Extract just the level values for domain calculation
    const levels = new Array<number>(chartData.encodedSignal.length);
    for (let i = 0; i < chartData.encodedSignal.length; i++) {
      levels[i] = chartData.encodedSignal[i].level;
    }
    return levels as EncodedSignal;
  }, [chartData]);

  // Memoize num bits to avoid recalculation
  const numBits = useMemo(
    () => chartData?.sendData.length ?? 0,
    [chartData]
  );

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

        {/* Execution time display */}
        {elapsedTime !== null && (
          <div className="benchmark-info" style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Execution time: {elapsedTime.toFixed(2)} ms
          </div>
        )}

        {/* Violation detection alert (for Bipolar-AMI and Pseudoternary) */}
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
              rawSignal={rawSignal}
              numBits={numBits}
              producesDoubleLength={encoderInfo.producesDoubleLength}
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
