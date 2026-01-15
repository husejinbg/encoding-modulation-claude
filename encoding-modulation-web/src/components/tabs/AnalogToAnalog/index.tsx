import React, { useState } from 'react';
import type { AnalogModulatorId } from '../../../types/analog-modulator.types';
import type { SinusoidParams } from '../../../types/analog.types';
import { ModulatorSelect } from './ModulatorSelect';
import { ModulatorParameters } from './ModulatorParameters';
import { SinusoidInputs } from '../AnalogToDigital/SinusoidInputs';
import { TransmitButton } from '../DigitalToDigital/TransmitButton';
import { AnalogPlot } from '../../common/AnalogPlot';
import { useAnalogToAnalogTransmission } from '../../../hooks/useAnalogToAnalogTransmission';
import { AM, FM, PM, analogModulatorInfoMap } from '../../../analog-modulators';
import './AnalogToAnalog.css';

export const AnalogToAnalog: React.FC = () => {
  // Selection state
  const [selectedModulator, setSelectedModulator] = useState<AnalogModulatorId>('am');

  // Input state
  const [sinusoids, setSinusoids] = useState<SinusoidParams[]>([
    {
      id: Date.now().toString(),
      amplitude: 1,
      frequency: 5,
      phase: 0,
      verticalOffset: 0
    }
  ]);
  const [duration, setDuration] = useState(1);
  const [samplingRate, setSamplingRate] = useState(5000);

  // Modulator parameters (separate state for each modulator)
  const [modulatorParams, setModulatorParams] = useState({
    am: { f_c: 1000, A_c: 1.0, ka: 1.0 },
    fm: { f_c: 1000, A_c: 1.0, kf: 100 },
    pm: { f_c: 1000, A_c: 1.0, kp: Math.PI / 2 }
  });

  // Error/warning state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [carrierWarning, setCarrierWarning] = useState<string | null>(null);

  // Transmission hook
  const { chartData, numSamples, transmit, reset } = useAnalogToAnalogTransmission();

  const handleModulatorChange = (modulator: AnalogModulatorId) => {
    setSelectedModulator(modulator);
    reset();
    setValidationError(null);
    setCarrierWarning(null);
  };

  const handleParamChange = (key: string, value: number) => {
    setModulatorParams(prev => ({
      ...prev,
      [selectedModulator]: {
        ...prev[selectedModulator],
        [key]: value
      }
    }));
    reset();
  };

  const handleTransmit = () => {
    try {
      setValidationError(null);
      setCarrierWarning(null);

      // Validate inputs
      if (sinusoids.length === 0) {
        throw new Error('Add at least one sinusoid');
      }

      if (duration <= 0) {
        throw new Error('Duration must be positive');
      }

      if (samplingRate <= 0) {
        throw new Error('Sampling rate must be positive');
      }

      // Get current modulator parameters
      const params = modulatorParams[selectedModulator];

      // Carrier frequency validation (warning only, not error)
      const maxMessageFreq = Math.max(...sinusoids.map(s => s.frequency));
      if (params.f_c < 10 * maxMessageFreq) {
        setCarrierWarning(
          `Carrier frequency (${params.f_c} Hz) should be much higher than message frequency (${maxMessageFreq} Hz) for proper modulation.`
        );
      }

      // Sampling rate validation (conservative rule: at least 4× carrier frequency)
      if (samplingRate < 4 * params.f_c) {
        throw new Error(
          `Sampling rate must be at least ${4 * params.f_c} Hz (4× carrier frequency). Current: ${samplingRate} Hz.`
        );
      }

      // Create modulator instance
      const modulator = createModulator(selectedModulator, params);

      // Transmit
      transmit({
        sinusoidParams: sinusoids,
        duration,
        samplingRate,
        modulator
      });
    } catch (error) {
      setValidationError((error as Error).message);
      reset();
    }
  };

  const createModulator = (id: AnalogModulatorId, params: any) => {
    switch (id) {
      case 'am':
        return new AM(params.f_c, params.A_c, params.ka);
      case 'fm':
        return new FM(params.f_c, params.A_c, params.kf);
      case 'pm':
        return new PM(params.f_c, params.A_c, params.kp);
      default:
        throw new Error(`Unknown modulator: ${id}`);
    }
  };

  const modulatorInfo = analogModulatorInfoMap[selectedModulator];
  const currentParams = modulatorParams[selectedModulator];

  return (
    <div className="analog-to-analog-tab">
      {/* Controls Section */}
      <div className="controls">
        <ModulatorSelect
          selectedModulator={selectedModulator}
          onChange={handleModulatorChange}
        />

        <SinusoidInputs
          sinusoids={sinusoids}
          onChange={setSinusoids}
        />

        <div className="inline-input">
          <label htmlFor="duration">Duration (s):</label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={e => {
              setDuration(parseFloat(e.target.value) || 1);
              reset();
            }}
            step={0.1}
            min={0.1}
          />
        </div>

        <div className="inline-input">
          <label htmlFor="sampling-rate">Sampling Rate (Hz):</label>
          <input
            id="sampling-rate"
            type="number"
            value={samplingRate}
            onChange={e => {
              setSamplingRate(parseFloat(e.target.value) || 1000);
              reset();
            }}
            step={100}
            min={100}
          />
        </div>

        <ModulatorParameters
          modulator={selectedModulator}
          params={currentParams}
          onChange={handleParamChange}
        />

        <TransmitButton onClick={handleTransmit} />

        {validationError && (
          <div className="error-message">{validationError}</div>
        )}

        {carrierWarning && (
          <div className="warning-message">{carrierWarning}</div>
        )}
      </div>

      {/* Plots Section */}
      {chartData ? (
        <div className="plots-container">
          <div className="plot-section">
            <AnalogPlot
              data={chartData.sendAnalog}
              title="Send Analog Signal"
              numSamples={numSamples}
              smooth={true}
            />
          </div>

          <div className="plot-section">
            <AnalogPlot
              data={chartData.modulatedAnalog}
              title="Modulated Analog Signal"
              numSamples={numSamples}
              smooth={true}
            />
          </div>

          <div className="plot-section">
            <AnalogPlot
              data={chartData.receivedAnalog}
              title="Received Analog Signal"
              numSamples={numSamples}
              smooth={true}
            />
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>Configure the parameters above and click Transmit to see the modulation visualization.</p>
        </div>
      )}

      {/* Config Panel */}
      {chartData && (
        <div className="config-panel">
          <h4>Modulation Configuration</h4>
          <p><strong>Technique:</strong> {modulatorInfo.displayName} - {modulatorInfo.description}</p>
          <p>
            <strong>Parameters:</strong>{' '}
            {modulatorInfo.parameters.map(param => (
              <span key={param.key}>
                {param.key} = {(currentParams as any)[param.key].toFixed(2)} {param.unit}
                {param.key !== modulatorInfo.parameters[modulatorInfo.parameters.length - 1].key && ', '}
              </span>
            ))}
          </p>
          <p className="note">
            Note: Demodulation may have small offset or distortion due to numerical approximations.
          </p>
        </div>
      )}
    </div>
  );
};
