import React, { useState } from 'react';
import { ModulatorSelect } from './ModulatorSelect';
import { ModulatorParameters } from './ModulatorParameters';
import { BinaryInput } from '../DigitalToDigital/BinaryInput';
import { TransmitButton } from '../DigitalToDigital/TransmitButton';
import { BinaryPlot } from '../../common/BinaryPlot';
import { AnalogPlot } from '../../common/AnalogPlot';
import { useDigitalToAnalogTransmission } from '../../../hooks/useDigitalToAnalogTransmission';
import { parseBinaryString } from '../../../utils/validation';
import { ASK, BFSK, BPSK, MFSK, QPSK, modulatorInfoMap } from '../../../modulators';
import type { ModulatorId } from '../../../types/modulator.types';
import type { IModulator } from '../../../types/modulator.types';
import './DigitalToAnalog.css';

export const DigitalToAnalog: React.FC = () => {
  // Modulator selection
  const [selectedModulator, setSelectedModulator] = useState<ModulatorId>('ask');

  // Binary input
  const [binaryInput, setBinaryInput] = useState('1101001');
  const [inputError, setInputError] = useState<string | null>(null);

  // Bit duration and sampling
  const [bitDuration, setBitDuration] = useState<number>(0.001); // 1 ms per bit

  // Modulator parameters (dynamic based on selection)
  const [askParams, setAskParams] = useState({ f_c: 1000, A_one: 1, A_zero: 0 });
  const [bfskParams, setBfskParams] = useState({ f_zero: 1000, f_one: 2000, A: 1 });
  const [bpskParams, setBpskParams] = useState({ f_c: 1000, A: 1 });
  const [mfskParams, setMfskParams] = useState({ f_0: 1000, f_1: 1500, f_2: 2000, f_3: 2500, A: 1 });
  const [qpskParams, setQpskParams] = useState({ f_c: 1000, A: 1 });

  // Track transmitted parameters (only updated when Transmit is clicked)
  const [transmittedBitDuration, setTransmittedBitDuration] = useState<number>(0.001);
  const [transmittedNumBits, setTransmittedNumBits] = useState<number>(7);

  const { chartData, transmit, reset } = useDigitalToAnalogTransmission();

  const handleTransmit = () => {
    try {
      // Parse binary input
      const binaryData = parseBinaryString(binaryInput);

      // Create modulator instance based on selection
      let modulator: IModulator;
      switch (selectedModulator) {
        case 'ask':
          modulator = new ASK(askParams.f_c, askParams.A_one, askParams.A_zero);
          break;
        case 'bfsk':
          modulator = new BFSK(bfskParams.f_zero, bfskParams.f_one, bfskParams.A);
          break;
        case 'bpsk':
          modulator = new BPSK(bpskParams.f_c, bpskParams.A);
          break;
        case 'mfsk':
          modulator = new MFSK(mfskParams.f_0, mfskParams.f_1, mfskParams.f_2, mfskParams.f_3, mfskParams.A);
          break;
        case 'qpsk':
          modulator = new QPSK(qpskParams.f_c, qpskParams.A);
          break;
      }

      // Validate parameters
      if (bitDuration <= 0) {
        throw new Error('Bit duration must be positive');
      }

      // Clear errors
      setInputError(null);

      // Store transmitted parameters
      setTransmittedBitDuration(bitDuration);
      setTransmittedNumBits(binaryData.length);

      // Transmit
      transmit({
        binaryData,
        modulator,
        bitDuration,
        samplesPerBit: 100
      });
    } catch (error) {
      setInputError(error instanceof Error ? error.message : 'Invalid input');
      reset();
    }
  };

  const modulatorInfo = modulatorInfoMap[selectedModulator];

  return (
    <div className="digital-to-analog-tab">
      <div className="controls">
        <ModulatorSelect
          selectedModulator={selectedModulator}
          onChange={setSelectedModulator}
        />

        <BinaryInput
          value={binaryInput}
          onChange={setBinaryInput}
          error={inputError}
        />

        <div className="bit-duration-input">
          <label htmlFor="bit-duration">Bit Duration (s):</label>
          <input
            id="bit-duration"
            type="number"
            value={bitDuration}
            onChange={e => setBitDuration(parseFloat(e.target.value) || 0.001)}
            step={0.0001}
            min={0.0001}
          />
        </div>

        <ModulatorParameters
          modulator={selectedModulator}
          askParams={askParams}
          bfskParams={bfskParams}
          bpskParams={bpskParams}
          mfskParams={mfskParams}
          qpskParams={qpskParams}
          onAskChange={setAskParams}
          onBfskChange={setBfskParams}
          onBpskChange={setBpskParams}
          onMfskChange={setMfskParams}
          onQpskChange={setQpskParams}
        />

        <TransmitButton onClick={handleTransmit} />
      </div>

      <div className="plots-container">
        {chartData ? (
          <>
            <BinaryPlot
              data={chartData.sendData}
              title="Send Binary Data"
            />

            <AnalogPlot
              data={chartData.modulatedSignal}
              title={`Modulated Analog Signal (${modulatorInfo.displayName})`}
              smooth={true}
              bitDuration={transmittedBitDuration}
              numBits={transmittedNumBits}
              numSamples={transmittedNumBits}
            />

            <BinaryPlot
              data={chartData.receivedData}
              title="Received Binary Data"
            />
          </>
        ) : (
          <div className="empty-state">
            <p>Enter binary data and click Transmit to see modulation</p>
          </div>
        )}
      </div>

      {chartData && (
        <div className="config-panel">
          <h3>Modulator Information</h3>
          <p><strong>Technique:</strong> {modulatorInfo.displayName}</p>
          <p><strong>Description:</strong> {modulatorInfo.description}</p>
          {selectedModulator === 'ask' && (
            <p><strong>Parameters:</strong> f_c={askParams.f_c} Hz, A_one={askParams.A_one} V, A_zero={askParams.A_zero} V</p>
          )}
          {selectedModulator === 'bfsk' && (
            <p><strong>Parameters:</strong> f_zero={bfskParams.f_zero} Hz, f_one={bfskParams.f_one} Hz, A={bfskParams.A} V</p>
          )}
          {selectedModulator === 'bpsk' && (
            <p><strong>Parameters:</strong> f_c={bpskParams.f_c} Hz, A={bpskParams.A} V</p>
          )}
          {selectedModulator === 'mfsk' && (
            <p><strong>Parameters:</strong> f_0={mfskParams.f_0} Hz, f_1={mfskParams.f_1} Hz, f_2={mfskParams.f_2} Hz, f_3={mfskParams.f_3} Hz, A={mfskParams.A} V</p>
          )}
          {selectedModulator === 'qpsk' && (
            <p><strong>Parameters:</strong> f_c={qpskParams.f_c} Hz, A={qpskParams.A} V</p>
          )}
        </div>
      )}
    </div>
  );
};
